const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// --- LISTA DE MODELOS PARA TESTAR (DA MAIS NOVA PARA A ANTIGA) ---
// O código vai tentar uma por uma até funcionar.
const MODELS_TO_TRY = [
  "gemini-2.0-flash-exp", // Provavelmente a que funcionou pra você (Experimental V2)
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-1.0-pro",
  "gemini-pro"
];

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
};

if (process.env.REDIS_PASSWORD) {
  redisConnection.password = process.env.REDIS_PASSWORD;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeWorker = new Worker('analyzeQueue', async (job) => {
  const { documentId } = job.data;
  console.log(`⚙️ Worker: Iniciando Doc ID: ${documentId}`);

  try {
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGO_URI);

    const doc = await Document.findById(documentId);
    if (!doc) throw new Error('Documento não encontrado.');

    const docContent = doc.content || "";
    if (docContent.trim().length === 0) throw new Error('Documento vazio.');

    console.log(`📄 Texto lido: ${docContent.length} caracteres.`);

    // --- LÓGICA DE AUTO-DISCOVERY (Tenta conectar em loop) ---
    let result = null;
    let usedModel = "";
    let lastError = null;

    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`🔄 Tentando modelo: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `
          Retorne APENAS um JSON válido (sem markdown) analisando este texto jurídico:
          "${docContent.substring(0, 25000).replace(/"/g, "'")}"
          
          JSON: {
            "sentiment": "Favorável" | "Desfavorável" | "Neutro",
            "score": (0-100),
            "summary": "Resumo pt-br",
            "keyRisks": ["Risco 1"],
            "recommendations": ["Rec 1"]
          }
        `;

        const generation = await model.generateContent(prompt);
        const response = await generation.response;
        result = response.text();
        
        // Se chegou aqui, funcionou!
        usedModel = modelName;
        console.log(`✅ CONECTADO COM SUCESSO NO MODELO: ${modelName}`);
        break; // Sai do loop

      } catch (error) {
        console.warn(`⚠️ Falha no modelo ${modelName}: ${error.message}`);
        lastError = error;
        // Continua para o próximo modelo da lista...
      }
    }

    if (!result) {
      throw new Error(`Todos os modelos falharam. Último erro: ${lastError?.message}`);
    }

    // --- PROCESSAMENTO DO JSON ---
    console.log("🤖 Processando resposta...");
    let text = result.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch (e) {
      console.error("❌ Erro Parse JSON:", text);
      analysis = {
        sentiment: "Neutro",
        score: 50,
        summary: `Análise feita pelo modelo ${usedModel}, mas o formato JSON quebrou.`,
        keyRisks: ["Erro técnico de formatação"],
        recommendations: ["Tente novamente"]
      };
    }

    doc.analysis = analysis;
    doc.status = 'completed';
    doc.analyzedAt = new Date();
    await doc.save();

    console.log(`✅ SUCESSO! Doc finalizado.`);
    return analysis;

  } catch (error) {
    console.error(`❌ ERRO FATAL no Worker:`, error.message);
    try { await Document.findByIdAndUpdate(documentId, { status: 'failed' }); } catch (e) { }
    throw error;
  }
}, { connection: redisConnection });

module.exports = analyzeWorker;