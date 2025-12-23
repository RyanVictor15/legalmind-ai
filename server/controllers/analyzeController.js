const fs = require('fs');
const pdf = require('pdf-parse');
const Document = require('../models/Document');
const User = require('../models/User'); // Importar User para atualizar contagem
const { generateLegalAnalysis } = require('../services/aiService');

// @desc    Analisar Documento com IA
// @route   POST /api/analyze
// @access  Protected
const analyzeDocument = async (req, res) => {
  let filePath = null;

  try {
    // 1. Validar Usuário e Limites (LÓGICA NOVA)
    const user = await User.findById(req.user._id);
    
    // Se não for PRO e já tiver usado 3 ou mais vezes -> BLOQUEIA
    if (!user.isPro && user.usageCount >= 3) {
        // Se houver arquivo uploadado, deleta para não acumular lixo
        if (req.file) fs.unlinkSync(req.file.path);
        
        return res.status(403).json({ 
            status: 'error', 
            message: 'Limite do plano gratuito atingido (3/3). Faça upgrade para continuar.',
            code: 'LIMIT_REACHED'
        });
    }

    // 2. Validar Upload
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Nenhum arquivo enviado.' });
    }
    filePath = req.file.path;

    // 3. Extrair Texto
    let extractedText = '';
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      extractedText = data.text;
    } else {
      extractedText = fs.readFileSync(filePath, 'utf8');
    }

    if (!extractedText.trim()) {
      throw new Error('O documento parece estar vazio ou ilegível.');
    }

    // 4. Chamar Serviço de IA
    const analysisResult = await generateLegalAnalysis(extractedText, req.file.originalname);

    // 5. Salvar no Banco
    const newDoc = await Document.create({
      userId: req.user._id,
      filename: req.file.originalname,
      filePath: filePath,
      originalText: extractedText.substring(0, 1000), // Preview
      
      // Dados da IA
      aiSummary: analysisResult.summary,
      riskAnalysis: analysisResult.riskScore,
      verdict: analysisResult.verdict,
      keywords: analysisResult.keywords,
      strategicAdvice: analysisResult.strategicAdvice
    });

    // 6. Incrementar Uso do Usuário (LÓGICA NOVA)
    // Usamos $inc para ser atômico e seguro
    await User.findByIdAndUpdate(req.user._id, { $inc: { usageCount: 1 } });

    res.json({
      status: 'success',
      data: newDoc
    });

  } catch (error) {
    console.error('Controller Error:', error);
    if (filePath && fs.existsSync(filePath)) {
        // Limpeza em caso de erro (opcional, mas boa prática)
        // fs.unlinkSync(filePath); 
    }
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Erro ao processar documento.' 
    });
  }
};

module.exports = { analyzeDocument };