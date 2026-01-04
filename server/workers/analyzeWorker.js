const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// 📍 AQUI ESTÁ: Coloquei exatamente o que você pediu no topo
const MODELS_TO_TRY = [
  "gemini-2.5-flash",       // O que você pediu
  "gemini-2.5-flash-exp",   // Variação possível
  "gemini-2.0-flash-exp"    // Fallback (o mais recente oficial, caso o 2.5 seja beta fechado)
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

// Função de Pausa para o erro 429
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const analyzeWorker = new Worker('analyzeQueue', async (job) => {
  const { documentId } = job.data;
  console.log(`⚙️ Worker: Iniciando Doc ID: ${documentId}`);

  try {
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGO_URI);

    const doc = await Document.findById(documentId);
    if (!doc) throw new Error('Documento não encontrado.');

    const docContent = doc.content || "";
    if (docContent.trim().length === 0) throw new Error('Documento vazio.');

    let result = null;
    let usedModel = "";

    // TENTA A LISTA (Começando pela 2.5)
    for (const modelName of MODELS_TO_TRY) {
      
      // Tenta até 3 vezes se der erro de Cota (429)
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`🔄 Tentando modelo: ${modelName} (Tentativa ${attempt})...`);
          
          const model = genAI.getGenerativeModel({ model: modelName });
          const prompt = `
            Analise este documento jurídico e retorne JSON válido:
            "${docContent.substring(0, 25000).replace(/"/g, "'")}"
            JSON: { "sentiment": "Neutro", "score": 0, "summary": "Resumo", "keyRisks": [], "recommendations": [] }
          `;

          const generation = await model.generateContent(prompt);
          const response = await generation.response;
          result = response.text();
          
          usedModel = modelName;
          console.log(`✅ CONECTADO! Modelo usado: ${modelName}`);
          break; // Sucesso na tentativa

        } catch (error) {
          // Se for erro de Cota (429) -> Espera e tenta de novo o MESMO modelo
          if (error.message.includes('429') || error.message.includes('Quota')) {
            console.warn(`⏳ Cota cheia no ${modelName}. Esperando 60s...`);
            await sleep(60000); 
            continue; 
          }
          
          // Se for 404 (Modelo não existe), sai do loop de tentativas e vai pro próximo da lista
          console.warn(`⚠️ Modelo ${modelName} falhou: ${error.message}`);
          break; 
        }
      }
      if (result) break; // Sucesso no modelo
    }

    if (!result) throw new Error("Falha em todos os modelos (2.5 e variações).");

    console.log("🤖 Processando resposta...");
    let text = result.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) text = text.substring(firstBrace, lastBrace + 1);

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch (e) {
      analysis = {
        sentiment: "Neutro",
        score: 50,
        summary: "Erro na formatação JSON.",
        keyRisks: ["Erro Técnico"],
        recommendations: ["Tente novamente"]
      };
    }

    doc.analysis = analysis;
    doc.status = 'completed';
    doc.analyzedAt = new Date();
    await doc.save();

    console.log(`✅ SUCESSO FINAL!`);
    return analysis;

  } catch (error) {
    console.error(`❌ ERRO FATAL:`, error.message);
    try { await Document.findByIdAndUpdate(documentId, { status: 'failed' }); } catch (e) { }
    throw error;
  }
}, { connection: redisConnection });

module.exports = analyzeWorker;