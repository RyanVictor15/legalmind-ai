const Document = require('../models/Document');
const User = require('../models/User'); // Necessário para atualizar o saldo
const { Queue } = require('bullmq');
const pdf = require('pdf-parse');
const dotenv = require('dotenv');

dotenv.config();

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
};
if (process.env.REDIS_PASSWORD) redisConnection.password = process.env.REDIS_PASSWORD;

const analyzeQueue = new Queue('analyzeQueue', { connection: redisConnection });

// --- 1. ENVIAR ARQUIVO (COM LÓGICA DE CRÉDITO INTELIGENTE) ---
const analyzeDocument = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Verifica Saldo: Bloqueia APENAS se não for PRO e não tiver créditos
    if (!user.isPro && user.credits <= 0) {
      return res.status(403).json({ 
        message: 'Seu limite mensal acabou. Faça o upgrade para continuar.' 
      });
    }

    if (!req.file) return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    
    let content = '';
    if (req.file.mimetype === 'application/pdf') {
      try {
        const pdfData = await pdf(req.file.buffer);
        content = pdfData.text;
      } catch (e) { return res.status(400).json({ message: 'Erro ao ler PDF.' }); }
    } else {
      content = req.file.buffer.toString('utf-8');
    }

    if (!content.trim()) return res.status(400).json({ message: 'Arquivo vazio.' });

    // Desconta Crédito (APENAS se não for PRO)
    if (!user.isPro) {
      user.credits = Math.max(0, user.credits - 1);
      user.usageCount = (user.usageCount || 0) + 1; // Mantém seu contador histórico
      await user.save();
    }

    const doc = await Document.create({
      user: req.user._id,
      filename: req.file.originalname,
      content: content,
      status: 'pending'
    });

    await analyzeQueue.add('analyze-job', { documentId: doc._id });

    res.status(201).json({ 
      message: 'Processando...',
      documentId: doc._id,
      remainingCredits: user.credits // Envia o saldo novo para o frontend
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// --- 2. PEGAR RESULTADO ÚNICO ---
const getAnalysisResult = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Não encontrado.' });
    if (doc.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Acesso negado.' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar resultado.' });
  }
};

// --- 3. HISTÓRICO (ESSENCIAL PARA A PÁGINA "MEUS CASOS") ---
const getHistory = async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // Formata os dados para o frontend (History.jsx)
    const formatted = docs.map(doc => ({
      _id: doc._id,
      filename: doc.filename,
      createdAt: doc.createdAt,
      status: doc.status,
      // Mapeia os campos da IA
      riskScore: doc.analysis?.score || 0,
      verdict: doc.analysis?.sentiment || 'Pendente',
      summary: doc.analysis?.summary || 'Processando...',
      strategicAdvice: doc.analysis?.recommendations ? doc.analysis.recommendations[0] : ''
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar histórico.' });
  }
};

module.exports = { analyzeDocument, getAnalysisResult, getHistory };