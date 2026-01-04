const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Sua versão preferida no topo
const MODELS_TO_TRY = [
  "gemini-2.0-flash-exp", 
  "gemini-1.5-pro",
  "gemini-1.5-flash"
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

// Função de Pausa (Sleep)
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

    console.log(`📄 Texto lido: ${docContent.length} caracteres.`);

    let result = null;
    let usedModel = "";

    // Loop de Modelos
    for (const modelName of MODELS_TO_TRY) {
      // Loop de Tentativas (Retry para erro 429)
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`🔄 Tentando modelo: ${modelName} (Tentativa ${attempt})...`);
          
          const model = genAI.getGenerativeModel({ model: modelName });
          const prompt = `
            Analise este texto jurídico e retorne APENAS um JSON válido.
            Texto: "${docContent.substring(0, 25000).replace(/"/g, "'")}"
            JSON: { "sentiment": "Neutro", "score": 0, "summary": "Resumo", "keyRisks": [], "recommendations": [] }
          `;

          const generation = await model.generateContent(prompt);
          const response = await generation.response;
          result = response.text();
          
          usedModel = modelName;
          console.log(`✅ CONECTADO! Modelo: ${modelName}`);
          break; // Sai do loop de tentativas

        } catch (error) {
          // SE FOR ERRO DE COTA (429) -> ESPERA E TENTA DE NOVO
          if (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('Too Many Requests')) {
            console.warn(`⏳ Cota excedida no ${modelName}. Esperando 60 segundos...`);
            await sleep(60000); // Dorme 60s
            continue; // Tenta de novo
          }
          
          // Se for erro 404 (Não existe), pula para o próximo modelo
          console.warn(`⚠️ Erro no modelo ${modelName}: ${error.message}`);
          break; // Sai do loop de tentativas e vai pro próximo modelo
        }
      }
      if (result) break; // Se conseguiu resultado, sai do loop de modelos
    }

    if (!result) throw new Error("Falha em todos os modelos após tentativas.");

    // Processa JSON
    console.log("🤖 Processando JSON...");
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
        summary: "Erro na formatação da resposta da IA.",
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