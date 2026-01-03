const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

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

    console.log(`📄 Lendo conteúdo (${docContent.length} caracteres)...`);

    // --- CHAMADA PARA A IA ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Você é um assistente jurídico (LegalMind).
      Analise o texto abaixo (Petição ou Contrato) e retorne APENAS um JSON válido.
      NÃO use blocos de código markdown (\`\`\`json). Apenas o JSON puro.
      
      TEXTO: "${docContent.substring(0, 20000).replace(/"/g, "'")}"
      
      FORMATO JSON:
      {
        "sentiment": "Favorável" | "Desfavorável" | "Neutro",
        "score": (número 0-100),
        "summary": "Resumo curto em pt-br",
        "keyRisks": ["Risco 1", "Risco 2"],
        "recommendations": ["Recomendação 1", "Recomendação 2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("🤖 IA Respondeu. Processando JSON...");

    // LIMPEZA AGRESSIVA DO JSON (Para evitar travar)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    // Remove qualquer texto antes do primeiro '{' ou depois do último '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch (e) {
      console.error("❌ Erro JSON Parse. Texto recebido:", text);
      // Fallback em caso de erro no JSON
      analysis = {
        sentiment: "Neutro",
        score: 50,
        summary: "A IA leu o documento mas houve um erro na formatação da resposta. Tente novamente.",
        keyRisks: ["Erro de formatação"],
        recommendations: ["Reenviar arquivo"]
      };
    }

    // Salva e Finaliza
    doc.analysis = analysis;
    doc.status = 'completed';
    doc.analyzedAt = new Date();
    await doc.save();

    console.log(`✅ SUCESSO! Doc ${documentId} finalizado.`);
    return analysis;

  } catch (error) {
    console.error(`❌ ERRO FATAL no Worker (Doc ${documentId}):`, error.message);
    try {
        await Document.findByIdAndUpdate(documentId, { status: 'failed' });
    } catch (e) { }
    throw error;
  }
}, { connection: redisConnection });

module.exports = analyzeWorker;