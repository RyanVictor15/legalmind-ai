const asyncHandler = require('express-async-handler');
const Analysis = require('../models/Analysis'); // Importa o modelo que criamos acima
const { generateLegalAnalysis } = require('../services/aiService');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const analyzeDocument = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('Arquivo ausente'); }

  try {
    let text = '';
    // Leitura do arquivo (PDF ou Texto)
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(fs.readFileSync(req.file.path));
      text = data.text;
    } else {
      text = fs.readFileSync(req.file.path, 'utf8');
    }

    // Chama a IA
    const aiResult = await generateLegalAnalysis(text, req.file.originalname);

    // --- SALVA NO BANCO DE DADOS ---
    await Analysis.create({
      user: req.user._id,
      filename: req.file.originalname,
      summary: aiResult.summary,
      riskScore: aiResult.riskScore,
      verdict: aiResult.verdict,
      strategicAdvice: aiResult.strategicAdvice,
      fullAnalysis: aiResult
    });

    // Limpa arquivo temporário
    fs.unlinkSync(req.file.path);
    
    // Devolve resposta
    res.json(aiResult);

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500);
    throw new Error(error.message);
  }
});

// Função para listar os casos salvos
const getHistory = asyncHandler(async (req, res) => {
  const history = await Analysis.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(history);
});

module.exports = { analyzeDocument, getHistory };