const analyzeQueue = require('../queues/analyzeQueue');
const User = require('../models/User');
const Document = require('../models/Document');
const fs = require('fs');

const FREE_LIMIT = 3;

// Controlador Principal (Versão Fila/Assíncrona)
const analyzeDocument = async (req, res) => {
  // 1. Validação Básica
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
  }

  try {
    // 2. Validação de Créditos (Paywall)
    // Continuamos fazendo isso aqui para rejeitar rápido se não tiver crédito
    const user = await User.findById(req.user._id);
    
    if (!user.isPro && user.usageCount >= FREE_LIMIT) {
      // Limpa arquivo se foi rejeitado
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      
      return res.status(403).json({ 
        message: 'Limite gratuito atingido. Faça o upgrade para continuar.',
        isLimitReached: true 
      });
    }

    // 3. ENFILEIRAMENTO (A Mágica da Fase 3)
    // Em vez de processar agora, jogamos para o Redis/BullMQ
    await analyzeQueue.add('process-document', {
      filePath: req.file.path, // Caminho do arquivo temporário
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      userId: req.user._id // Passamos o ID para o Worker saber de quem é
    });

    console.log(`📥 Arquivo ${req.file.originalname} enviado para a fila.`);

    // 4. RESPOSTA IMEDIATA
    // Retornamos 202 (Accepted) dizendo "Estamos trabalhando nisso"
    res.status(202).json({ 
      message: 'Documento recebido! A IA está processando em segundo plano.',
      status: 'processing'
    });

  } catch (error) {
    console.error('❌ Erro ao enfileirar:', error);
    // Limpeza de emergência
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Erro interno ao iniciar processamento.' });
  }
};

// Histórico (Mantém igual, pois apenas lê do banco)
const getHistory = async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar histórico.' });
  }
};

module.exports = { analyzeDocument, getHistory };