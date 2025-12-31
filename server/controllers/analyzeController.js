const fs = require('fs');
const pdfParse = require('pdf-parse');
const Document = require('../models/Document');
const User = require('../models/User'); // Precisamos do Model de Usuário para atualizar créditos
const { generateLegalAnalysis } = require('../services/aiService');

// Configuração do Limite Gratuito
const FREE_LIMIT = 3;

const analyzeDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
  }

  const filePath = req.file.path;

  try {
    // 📍 1. VERIFICAÇÃO DE CRÉDITOS (O PAYWALL)
    // Buscamos o usuário atualizado no banco
    const user = await User.findById(req.user._id);
    
    // Se NÃO for Pro e já estourou o limite...
    if (!user.isPro && user.usageCount >= FREE_LIMIT) {
      // Deleta o arquivo imediatamente para não ocupar espaço
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      
      return res.status(403).json({ 
        message: 'Limite gratuito atingido. Faça o upgrade para continuar.',
        isLimitReached: true // Flag para o frontend abrir o modal de pagamento
      });
    }

    console.log(`📄 Processando: ${req.file.originalname} (Uso: ${user.usageCount}/${FREE_LIMIT})`);

    // 2. EXTRAÇÃO
    let textContent = '';
    if (req.file.mimetype === 'application/pdf') {
       const dataBuffer = fs.readFileSync(filePath);
       const pdfData = await pdfParse(dataBuffer);
       textContent = pdfData.text;
    } else {
       textContent = fs.readFileSync(filePath, 'utf-8');
    }
    
    // Limpeza
    textContent = textContent.replace(/\n\s*\n/g, '\n');

    // 3. IA (Gera Custo)
    const analysis = await generateLegalAnalysis(textContent, req.file.originalname);

    // 4. PERSISTÊNCIA DO DOCUMENTO
    const newDoc = await Document.create({
        user: req.user._id,
        filename: req.file.originalname,
        originalContent: textContent.substring(0, 5000),
        summary: analysis.summary,
        riskScore: analysis.riskScore,
        verdict: analysis.verdict,
        strategicAdvice: analysis.strategicAdvice,
        keywords: analysis.keywords
    });

    // 📍 5. COBRANÇA (Incrementa Contador)
    // Se não for Pro, aumenta o contador de uso
    if (!user.isPro) {
      user.usageCount += 1;
      await user.save();
    }

    res.status(201).json(newDoc);

  } catch (error) {
    console.error('❌ Erro Analyze:', error);
    res.status(500).json({ message: error.message || 'Erro interno.' });

  } finally {
    // 6. LIMPEZA
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) { console.error('Erro cleanup:', e); }
  }
};

const getHistory = async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar histórico.' });
  }
};

module.exports = { analyzeDocument, getHistory };