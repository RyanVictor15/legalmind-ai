const Analysis = require('../models/Analysis');
const { generateLegalAnalysis } = require('../services/aiService');
const fs = require('fs');
const pdfParse = require('pdf-parse');

// @desc    Analisar documento e SALVAR no histórico
const analyzeDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    let text = '';
    
    // 1. Ler o arquivo (PDF ou Texto)
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else {
      text = fs.readFileSync(req.file.path, 'utf8');
    }

    // 2. Chamar a IA
    const analysisResult = await generateLegalAnalysis(text, req.file.originalname);

    // 3. Salvar no Banco
    const savedAnalysis = await Analysis.create({
      user: req.user._id,
      filename: req.file.originalname,
      summary: analysisResult.summary,
      riskScore: analysisResult.riskScore,
      verdict: analysisResult.verdict,
      strategicAdvice: analysisResult.strategicAdvice,
      fullAnalysis: analysisResult
    });

    // 4. Limpar arquivo temporário
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // 5. Retornar
    res.json(savedAnalysis.fullAnalysis);

  } catch (error) {
    // Limpeza em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    
    console.error("Erro no controller:", error);
    res.status(500).json({ 
      message: error.message || 'Erro no processamento do arquivo' 
    });
  }
};

// @desc    Buscar histórico do usuário
const getHistory = async (req, res) => {
  try {
    const history = await Analysis.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { analyzeDocument, getHistory };