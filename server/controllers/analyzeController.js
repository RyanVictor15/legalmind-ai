const Document = require('../models/Document');
const User = require('../models/User'); // Importamos o User para mexer nos créditos
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

const analyzeDocument = async (req, res) => {
  try {
    // 1. VERIFICAÇÃO DE SALDO (A Lógica Real)
    const user = await User.findById(req.user._id);
    
    if (user.credits <= 0) {
      return res.status(403).json({ 
        message: 'Seu limite mensal de análises acabou. Volte mês que vem ou faça o upgrade.' 
      });
    }

    // 2. Processamento do Arquivo (Igual antes)
    if (!req.file) return res.status(400).json({ message: 'Nenhum arquivo.' });
    
    let content = '';
    if (req.file.mimetype === 'application/pdf') {
      try {
        const pdfData = await pdf(req.file.buffer);
        content = pdfData.text;
      } catch (e) { return res.status(400).json({ message: 'Erro ao ler PDF.' }); }
    } else {
      content = req.file.buffer.toString('utf-8');
    }

    if (!content || content.trim().length === 0) return res.status(400).json({ message: 'Arquivo vazio.' });

    // 3. DESCONTA O CRÉDITO
    user.credits = user.credits - 1;
    await user.save();

    // 4. Salva Documento
    const doc = await Document.create({
      user: req.user._id,
      filename: req.file.originalname,
      content: content,
      status: 'pending'
    });

    await analyzeQueue.add('analyze-job', { documentId: doc._id });

    // 5. Retorna o novo saldo para o Frontend atualizar a tela
    res.status(201).json({ 
      message: 'Processando...',
      documentId: doc._id,
      status: 'pending',
      remainingCredits: user.credits // <--- Envia o saldo novo
    });

  } catch (error) {
    console.error(error);
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

// Precisamos criar rota para pegar saldo atual também
const getUserCredits = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json({ credits: user.credits });
}

module.exports = { analyzeDocument, getAnalysisResult, getUserCredits };