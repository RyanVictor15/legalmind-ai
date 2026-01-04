const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// 🎯 A ÚNICA VERSÃO QUE FUNCIONA
const TARGET_MODEL = "gemini-2.5-flash";

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
  console.log(`⚙️ Worker: Iniciando Doc ID: ${documentId} com modelo ${TARGET_MODEL}`);

  try {
    if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGO_URI);

    const doc = await Document.findById(documentId);
    if (!doc) throw new Error('Documento não encontrado.');

    const docContent = doc.content || "";
    if (docContent.trim().length === 0) throw new Error('Documento vazio.');

    let result = null;
    let attempts = 0;
    const maxAttempts = 3; // Tenta até 3 vezes se a cota estiver cheia

    // --- LOOP DE TENTATIVA ÚNICA (Apenas para garantir que não falhe por cota) ---
    while (attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`🔄 Conectando ao Google Gemini (Tentativa ${attempts})...`);
        
        const model = genAI.getGenerativeModel({ model: TARGET_MODEL });
        
        const prompt = `
          Analise este documento jurídico e retorne um JSON válido.
          Documento: "${docContent.substring(0, 25000).replace(/"/g, "'")}"
          
          Formato JSON Obrigatório:
          { 
            "sentiment": "Favorável" | "Desfavorável" | "Neutro", 
            "score": 0, 
            "summary": "Resumo executivo", 
            "keyRisks": ["Risco 1"], 
            "recommendations": ["Recomendação 1"] 
          }
        `;

        const generation = await model.generateContent(prompt);
        const response = await generation.response;
        result = response.text();
        
        console.log(`✅ CONEXÃO BEM SUCEDIDA COM ${TARGET_MODEL}!`);
        break; // Sai do loop pois funcionou

      } catch (error) {
        // Se for erro de Cota (429), espera um pouco e tenta de novo
        if (error.message.includes('429') || error.message.includes('Quota')) {
          console.warn(`⏳ Cota cheia no Google. Esperando 60 segundos...`);
          await sleep(60000); 
          continue; 
        }
        
        // Se for outro erro, lança direto
        throw error;
      }
    }

    if (!result) throw new Error("Não foi possível obter resposta da IA.");

    // Processamento do JSON
    console.log("🤖 Formatando resposta...");
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
        summary: "Erro ao formatar o JSON da resposta.",
        keyRisks: ["Erro Técnico"],
        recommendations: ["Tente novamente"]
      };
    }

    doc.analysis = analysis;
    doc.status = 'completed';
    doc.analyzedAt = new Date();
    await doc.save();

    console.log(`✅ ANÁLISE CONCLUÍDA E SALVA!`);
    return analysis;

  } catch (error) {
    console.error(`❌ ERRO:`, error.message);
    try { await Document.findByIdAndUpdate(documentId, { status: 'failed' }); } catch (e) { }
    throw error;
  }
}, { connection: redisConnection });

module.exports = analyzeWorker;