const Document = require('../models/Document');
const { Queue } = require('bullmq');
const pdf = require('pdf-parse');
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
    console.log("📥 Recebendo arquivo..."); // Log 1

    if (!req.file) {
      console.log("❌ Nenhum arquivo no request.");
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    console.log(`📂 Arquivo: ${req.file.originalname} | Tipo: ${req.file.mimetype} | Tamanho: ${req.file.size}`);

    let content = '';

    // Lógica de Extração
    if (req.file.mimetype === 'application/pdf') {
      try {
        const pdfData = await pdf(req.file.buffer);
        content = pdfData.text;
      } catch (e) {
        console.error("❌ Erro ao ler PDF:", e);
        return res.status(400).json({ message: 'Erro ao ler o PDF.' });
      }
    } else {
      // Assume que é texto (TXT, MD, etc)
      content = req.file.buffer.toString('utf-8');
    }

    // Limpeza básica
    content = content.trim();

    // LOG CRUCIAL: Mostra o que foi lido
    console.log(`📝 Texto extraído (primeiros 50 chars): "${content.substring(0, 50)}..."`);
    console.log(`📏 Tamanho total do texto: ${content.length} caracteres`);

    if (content.length === 0) {
      console.log("❌ Texto vazio após extração.");
      return res.status(400).json({ message: 'O arquivo está vazio.' });
    }

    // Salva no Banco
    const doc = await Document.create({
      user: req.user._id,
      filename: req.file.originalname,
      content: content, // <--- Aqui o texto vai para o banco
      status: 'pending',
      type: 'contract'
    });

    console.log(`💾 Documento salvo no Mongo. ID: ${doc._id}`);

    // Envia para Fila
    await analyzeQueue.add('analyze-job', { 
      documentId: doc._id,
      userId: req.user._id 
    });

    console.log(`🚀 Enviado para a fila BullMQ.`);

    res.status(201).json({ 
      message: 'Processando...',
      documentId: doc._id,
      status: 'pending'
    });

  } catch (error) {
    console.error('❌ ERRO GERAL NO CONTROLLER:', error);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

const getAnalysisResult = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Não encontrado.' });
    
    // Verifica permissão
    if (doc.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar resultado.' });
  }
};

module.exports = { analyzeDocument, getAnalysisResult };