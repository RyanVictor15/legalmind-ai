const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Configuração do Redis
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
    // 1. Garante conexão com Mongo
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // 2. Busca o documento
    const doc = await Document.findById(documentId);
    if (!doc) throw new Error('Documento não encontrado no Banco de Dados.');

    // 🔴 3. VERIFICAÇÃO DE SEGURANÇA (AQUI ESTAVA O ERRO)
    // Se o doc.content for null ou undefined, definimos uma string vazia para não quebrar
    const docContent = doc.content || "";

    if (docContent.trim().length === 0) {
      throw new Error('O documento está vazio ou é um PDF escaneado (imagem) sem texto selecionável.');
    }

    // --- LÓGICA DA IA ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Atue como um advogado sênior. Analise juridicamente este texto e retorne APENAS um JSON válido.
      Não use markdown. Não use crases.
      
      Texto do documento: "${docContent.substring(0, 15000)}"
      
      Formato JSON exigido:
      {
        "sentiment": "Favorável" | "Desfavorável" | "Neutro",
        "score": (número de 0 a 100 indicando viabilidade),
        "summary": "Resumo executivo de 2 linhas",
        "keyRisks": ["Risco 1", "Risco 2 (cite artigos se houver)"],
        "recommendations": ["Recomendação 1", "Recomendação 2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Limpeza do JSON
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let analysis;
    try {
        analysis = JSON.parse(jsonString);
    } catch (e) {
        console.error("Erro ao fazer parse do JSON da IA:", text);
        throw new Error("A IA não retornou um JSON válido.");
    }

    // Salva no Banco
    doc.analysis = analysis;
    doc.status = 'completed';
    doc.analyzedAt = new Date();
    await doc.save();

    console.log(`✅ Worker: Documento ${documentId} concluído com sucesso!`);
    return analysis;

  } catch (error) {
    console.error(`❌ Worker Error (Doc ${documentId}):`, error.message);
    
    // Atualiza status para erro no banco para o frontend saber
    try {
        await Document.findByIdAndUpdate(documentId, { status: 'failed' });
    } catch (e) { console.error('Erro ao salvar status de falha'); }
    
    throw error;
  }
}, { 
  connection: redisConnection 
});

module.exports = analyzeWorker;