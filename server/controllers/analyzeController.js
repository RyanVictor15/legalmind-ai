const Document = require('../models/Document');
const { Queue } = require('bullmq');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// 📍 CONFIGURAÇÃO DO REDIS (Corrigida para BullMQ)
const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, // <--- ESSA LINHA É OBRIGATÓRIA PRO BULLMQ NÃO DAR ERRO 500
};

if (process.env.REDIS_PASSWORD) {
  redisConnection.password = process.env.REDIS_PASSWORD;
}

// Inicializa a Fila com a conexão correta
const analyzeQueue = new Queue('analyzeQueue', { 
  connection: redisConnection 
});

const analyzeDocument = async (req, res) => {
  try {
    // 1. Validação Básica
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    // 2. Cria o registro no MongoDB (Status: Pending)
    const doc = await Document.create({
      user: req.user._id, // Pega o ID do usuário logado
      filename: req.file.originalname,
      content: req.file.buffer.toString('utf-8'), // Lê o buffer do arquivo
      status: 'pending',
      type: 'contract'
    });

    // 3. Envia para a Fila (Redis)
    await analyzeQueue.add('analyze-job', { 
      documentId: doc._id,
      userId: req.user._id 
    });

    // 4. Responde rápido para o Frontend
    res.status(201).json({ 
      message: 'Documento recebido! A IA está processando.',
      documentId: doc._id,
      status: 'pending'
    });

  } catch (error) {
    console.error('❌ Erro no Controller de Análise:', error);
    // Em produção, isso ajuda a ver o erro real no log do Render
    res.status(500).json({ 
        message: 'Erro ao processar envio do arquivo.',
        error: error.message 
    });
  }
};

const getAnalysisResult = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id);

    if (!doc) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }

    // Verifica se o documento pertence ao usuário
    if (doc.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    res.json(doc);

  } catch (error) {
    console.error('Erro ao buscar resultado:', error);
    res.status(500).json({ message: 'Erro ao buscar resultado.' });
  }
};

module.exports = { analyzeDocument, getAnalysisResult };