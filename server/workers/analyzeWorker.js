const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// 📍 LISTA DE PRIORIDADE (Sua versão 2.0/2.5 está aqui no topo)
const MODELS_TO_TRY = [
  "gemini-2.0-flash-exp", // <--- TENTA ESTE PRIMEIRO
  "gemini-1.5-pro",       // Backup 1
  "gemini-1.5-flash",     // Backup 2
  "gemini-pro"            // Backup 3 (Legado)
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
    // 1. Conexão DB
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGO_URI);

    // 2. Busca Documento
    const doc = await Document.findById(documentId);
    if (!doc) throw new Error('Documento não encontrado.');

    const docContent = doc.content || "";
    if (docContent.trim().length === 0) throw new Error('Documento vazio.');

    console.log(`📄 Texto lido: ${docContent.length} caracteres. Iniciando IA...`);

    // 3. LÓGICA DE TENTATIVA (Retry Logic)
    let result = null;
    let usedModel = "";
    
    // Loop para testar modelos até um funcionar
    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`🔄 Tentando conectar no modelo: ${modelName}...`);
        
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `
          Analise este texto jurídico e retorne APENAS um JSON válido.
          Sem markdown. Sem crases.
          
          Texto: "${docContent.substring(0, 25000).replace(/"/g, "'")}"
          
          JSON: {
            "sentiment": "Favorável" | "Desfavorável" | "Neutro",
            "score": (0-100),
            "summary": "Resumo curto pt-br",
            "keyRisks": ["Risco 1"],
            "recommendations": ["Rec 1"]
          }
        `;

        const generation = await model.generateContent(prompt);
        const response = await generation.response;
        result = response.text();
        
        // Se não deu erro, define o modelo usado e sai do loop
        usedModel = modelName;
        console.log(`✅ SUCESSO! Conectado via ${modelName}`);
        break; 

      } catch (error) {
        // Se der erro 404 ou outro, avisa e tenta o próximo
        console.warn(`⚠️ Falha no modelo ${modelName}: ${error.message}`);
        // NÃO dá throw aqui, para o loop continuar
      }
    }

    // Se saiu do loop e result continua null, todos falharam
    if (!result) {
      throw new Error(`Todos os modelos de IA falharam. Verifique sua API Key.`);
    }

    // 4. Processamento da Resposta
    console.log("🤖 Processando resposta JSON...");
    let text = result.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Extrai apenas o objeto JSON (caso a IA fale antes ou depois)
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
        summary: `Análise realizada via ${usedModel}, mas houve erro na formatação do JSON.`,
        keyRisks: ["Erro técnico"],
        recommendations: ["Tente novamente"]
      };
    }

    // 5. Salva e Finaliza
    doc.analysis = analysis;
    doc.status = 'completed';
    doc.analyzedAt = new Date();
    await doc.save();

    console.log(`✅ WORKER FINALIZADO COM SUCESSO!`);
    return analysis;

  } catch (error) {
    console.error(`❌ ERRO FATAL no Worker:`, error.message);
    try { await Document.findByIdAndUpdate(documentId, { status: 'failed' }); } catch (e) { }
    throw error;
  }
}, { connection: redisConnection });

module.exports = analyzeWorker;