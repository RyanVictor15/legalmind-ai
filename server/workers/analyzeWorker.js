const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Configuração da Conexão Redis (IGUAL AO CONFIG/REDIS.JS)
const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
};

if (process.env.REDIS_PASSWORD) {
  redisConnection.password = process.env.REDIS_PASSWORD;
}

// Inicializa a IA
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeWorker = new Worker('analyzeQueue', async (job) => {
  const { documentId } = job.data;
  console.log(`⚙️ Worker: Processando documento ${documentId}...`);

  try {
    // Garante conexão com Mongo dentro do Worker
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    const doc = await Document.findById(documentId);
    if (!doc) throw new Error('Documento não encontrado');

    // --- LÓGICA DA IA (GEMINI) ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Prompt Otimizado
    const prompt = `
      Analise juridicamente este texto e retorne APENAS um JSON:
      Texto: "${doc.content.substring(0, 5000)}"
      
      Formato JSON exigido:
      {
        "sentiment": "Favorável" | "Desfavorável" | "Neutro",
        "score": (número de 0 a 100),
        "summary": "Resumo de 2 linhas",
        "keyRisks": ["Risco 1", "Risco 2"],
        "recommendations": ["Rec 1", "Rec 2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Limpeza do JSON (Remove crases ```json ... ```)
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const analysis = JSON.parse(jsonString);

    // Salva no Banco
    doc.analysis = analysis;
    doc.status = 'completed';
    doc.analyzedAt = new Date();
    await doc.save();

    console.log(`✅ Worker: Documento ${documentId} concluído!`);
    return analysis;

  } catch (error) {
    console.error(`❌ Worker Error (Doc ${documentId}):`, error);
    
    // Atualiza status para erro
    try {
        await Document.findByIdAndUpdate(documentId, { status: 'error' });
    } catch (e) { console.error('Erro ao atualizar status de falha'); }
    
    throw error;
  }
}, { 
  connection: redisConnection // 📍 AQUI ESTÁ A CORREÇÃO CRÍTICA
});

module.exports = analyzeWorker;