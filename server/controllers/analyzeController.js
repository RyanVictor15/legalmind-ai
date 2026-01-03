const Document = require('../models/Document');
const { Queue } = require('bullmq');
const pdf = require('pdf-parse'); // 📍 Importamos o leitor de PDF
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

const analyzeQueue = new Queue('analyzeQueue', { connection: redisConnection });

const analyzeDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Nenhum arquivo.' });

    let content = '';

    // 📍 LÓGICA INTELIGENTE: Detecta se é PDF ou TXT
    if (req.file.mimetype === 'application/pdf') {
      try {
        const pdfData = await pdf(req.file.buffer);
        content = pdfData.text; // Extrai o texto limpo do PDF
      } catch (e) {
        console.error("Erro ao ler PDF:", e);
        return res.status(400).json({ message: 'PDF corrompido ou inválido.' });
      }
    } else {
      // Se for TXT, lê direto
      content = req.file.buffer.toString('utf-8');
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'O arquivo parece estar vazio ou não tem texto selecionável.' });
    }

    // Cria no Banco
    const doc = await Document.create({
      user: req.user._id,
      filename: req.file.originalname,
      content: content, // Salva o texto extraído, não o binário
      status: 'pending',
      type: 'contract'
    });

    // Envia para a Fila
    await analyzeQueue.add('analyze-job', { 
      documentId: doc._id,
      userId: req.user._id 
    });

    res.status(201).json({ 
      message: 'Recebido! Processando...',
      documentId: doc._id,
      status: 'pending'
    });

  } catch (error) {
    console.error('❌ Erro Controller:', error);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

const getAnalysisResult = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Não encontrado.' });
    if (doc.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Sem permissão.' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar.' });
  }
};

module.exports = { analyzeDocument, getAnalysisResult };