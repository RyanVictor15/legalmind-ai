const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// 🎯 VERSÃO QUE FUNCIONA
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
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`🔄 Conectando ao Gemini 2.5 (Tentativa ${attempts})...`);
        
        const model = genAI.getGenerativeModel({ model: TARGET_MODEL });
        
        // --- AQUI ESTÁ A MUDANÇA DO PROMPT ---
        const prompt = `
          Atue como um Juiz Sênior Especialista.
          Analise o texto jurídico abaixo e retorne um JSON.
          
          Texto: "${docContent.substring(0, 25000).replace(/"/g, "'")}"
          
          REGRAS CRITICAS:
          1. "score": DEVE ser um número de 0 a 100 (Chance de Êxito).
          2. JAMAIS use valores monetários (como 20000) no score.
          3. Se for uma causa ganha, dê entre 80-95. Se for difícil, 20-40.
          
          FORMATO JSON:
          { 
            "sentiment": "Favorável" | "Desfavorável" | "Neutro", 
            "score": 0, 
            "summary": "Resumo executivo do caso", 
            "keyRisks": ["Risco 1", "Risco 2"], 
            "recommendations": ["Recomendação 1", "Recomendação 2"] 
          }
        `;

        const generation = await model.generateContent(prompt);
        const response = await generation.response;
        result = response.text();
        
        console.log(`✅ Conexão bem sucedida!`);
        break;

      } catch (error) {
        if (error.message.includes('429') || error.message.includes('Quota')) {
          console.warn(`⏳ Cota cheia. Esperando 60s...`);
          await sleep(60000); 
          continue; 
        }
        throw error;
      }
    }

    if (!result) throw new Error("Sem resposta da IA.");

    console.log("🤖 Formatando JSON...");
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
        summary: "Erro técnico na formatação.",
        keyRisks: ["Erro Técnico"],
        recommendations: ["Tente novamente"]
      };
    }

    doc.analysis = analysis;
    doc.status = 'completed';
    doc.analyzedAt = new Date();
    await doc.save();

    console.log(`✅ ANÁLISE SALVA COM SCORE CORRIGIDO!`);
    return analysis;

  } catch (error) {
    console.error(`❌ ERRO:`, error.message);
    try { await Document.findByIdAndUpdate(documentId, { status: 'failed' }); } catch (e) { }
    throw error;
  }
}, { connection: redisConnection });

module.exports = analyzeWorker;