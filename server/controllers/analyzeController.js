// server/controllers/analyzeController.js

// 1. CORREÇÃO DE REDE/SSL (Obrigatório)
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const fs = require('fs');
const pdf = require('pdf-parse');
const Sentiment = require('sentiment');
const Document = require('../models/Document');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const sentiment = new Sentiment();

const analyzeWithGemini = async (text) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // --- MUDANÇA ESTRATÉGICA: USAR O ALIAS 'LATEST' ---
    // Esse nome apareceu na sua lista, então ele EXISTE com certeza.
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Você é um Assistente Jurídico Sênior (Legal Operations). Analise o texto jurídico abaixo extraído de um arquivo processual.
      
      Gere uma resposta ESTRITAMENTE em formato JSON (sem markdown, sem aspas extras no início/fim) com estes 3 campos exatos:
      1. "summary": Um resumo executivo do caso focado nos fatos principais (máximo 3 linhas).
      2. "risk": Um número inteiro de 0 a 100 representando a probabilidade de êxito da parte autora (0 = Perda certa, 100 = Ganho certo).
      3. "advice": Uma sugestão estratégica curta e direta para o advogado (ex: citar súmula X, pedir prova pericial, alegar prescrição).

      Texto do Documento:
      "${text.substring(0, 30000)}" 
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textResponse = response.text();

    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(textResponse);

  } catch (error) {
    console.error("Erro na IA do Google:", error);
    
    // Se der erro de COTA (429), mostramos uma mensagem específica
    if (error.message && error.message.includes('429')) {
        return {
            summary: "Limite de uso gratuito atingido momentaneamente.",
            risk: 50,
            advice: "Aguarde 1 minuto e tente novamente (Restrição do Google)."
        };
    }

    return {
      summary: "Erro ao processar inteligência. O modelo pode estar indisponível.",
      risk: 50,
      advice: "Tente novamente mais tarde."
    };
  }
};

const getVerdict = (score) => {
  if (score > 1) return 'Favorável';
  if (score < -1) return 'Desfavorável';
  return 'Neutro';
};

const analyzeDocument = async (req, res) => {
  try {
    const user = req.user; 
    
    if (!user) return res.status(401).json({ error: 'Usuário não identificado.' });

    // Paywall Check
    if (!user.isPro && user.usageCount >= 3) {
      return res.status(403).json({ error: 'LIMIT_REACHED' });
    }

    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    let extractedText = '';

    if (fileExtension === 'pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      extractedText = pdfData.text;
    } else if (fileExtension === 'txt') {
      extractedText = fs.readFileSync(filePath, 'utf8');
    } else {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Formato inválido. Use PDF ou TXT.' });
    }

    const resultSentiment = sentiment.analyze(extractedText);
    const aiResult = await analyzeWithGemini(extractedText);

    const analysisResult = new Document({
      filename: req.file.originalname,
      filePath: req.file.path.replace(/\\/g, "/"), 
      originalText: extractedText,
      sentimentScore: resultSentiment.score,
      sentimentComparative: resultSentiment.comparative,
      verdict: getVerdict(resultSentiment.score),
      keywords: { positive: resultSentiment.positive, negative: resultSentiment.negative },
      aiSummary: aiResult.summary,
      riskAnalysis: aiResult.risk,
      strategicAdvice: aiResult.advice,
      userId: user._id
    });

    await analysisResult.save();

    user.usageCount = user.usageCount + 1;
    await user.save();

    res.status(200).json(analysisResult);

  } catch (error) {
    console.error("Erro no analyzeController:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};

const getHistory = async (req, res) => {
  try {
      const documents = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
      res.status(200).json(documents);
  } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar dados.' });
  }
};

module.exports = { analyzeDocument, getHistory };