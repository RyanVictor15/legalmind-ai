// server/controllers/analyzeController.js

// 1. CORREÇÃO DE REDE/SSL (Obrigatório)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const pdf = require('pdf-parse');
const Sentiment = require('sentiment');
const Document = require('../models/Document');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const sentiment = new Sentiment();

const analyzeWithGemini = async (text) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Modelo Estável
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      ATUE COMO UM ADVOGADO SÊNIOR ESPECIALISTA EM LEIS BRASILEIRAS.
      
      Analise o texto abaixo:
      """
      ${text.substring(0, 30000)}
      """

      --- PARTE 1: ANÁLISE TEXTUAL ---
      Escreva uma análise jurídica completa formatada em MARKDOWN.
      Siga a estrutura:
      # 1. 📋 Resumo Executivo
      # 2. ⚠️ Pontos de Atenção e Riscos
      # 3. ⚖️ Fundamentação Legal (Cite Leis Brasileiras)
      # 4. 💡 Sugestões de Melhoria
      # 5. 📊 Veredito Final

      --- PARTE 2: DADOS ESTRUTURADOS ---
      Ao final, pule duas linhas e escreva EXATAMENTE: "---DADOS_JSON---"
      Logo após, forneça APENAS um JSON válido com esta estrutura exata:
      {
        "successProbability": (Número INTEIRO de 0 a 100. Onde 0 é causa perdida e 100 é causa ganha),
        "verdictShort": ("Favorável", "Moderado" ou "Desfavorável"),
        "sentimentKeywords": {
          "positive": ["lista", "palavras", "boas"],
          "negative": ["lista", "palavras", "ruins"]
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const fullText = response.text();

    // Separação Texto vs JSON
    const parts = fullText.split("---DADOS_JSON---");
    const markdownAnalysis = parts[0].trim();
    
    // Valor padrão caso falhe o JSON
    let jsonFinal = { 
        successProbability: 50, 
        verdictShort: "Análise Concluída", 
        sentimentKeywords: { positive: [], negative: [] } 
    };

    if (parts.length > 1) {
      try {
        const jsonString = parts[1].replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonString);
        
        // Garante que os campos existem
        jsonFinal.successProbability = parsed.successProbability || parsed.riskScore || 50;
        jsonFinal.verdictShort = parsed.verdictShort || "Neutro";
        jsonFinal.sentimentKeywords = parsed.sentimentKeywords || { positive: [], negative: [] };

      } catch (e) {
        console.error("Erro ao ler JSON da IA, usando padrão.", e);
      }
    }

    return { markdownAnalysis, jsonFinal };

  } catch (error) {
    console.error("Erro na IA do Google:", error);
    throw error;
  }
};

const getVerdict = (score) => {
  if (score > 1) return 'Favorável';
  if (score < -1) return 'Desfavorável';
  return 'Neutro';
};

exports.analyzeDocument = async (req, res) => {
  try {
    const user = req.user; 
    
    if (!user) return res.status(401).json({ error: 'Usuário não identificado.' });

    if (!user.isPro && user.usageCount >= 3) {
      if (req.file && req.file.path) fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'LIMIT_REACHED' });
    }

    if (!req.file && !req.body.text) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    let extractedText = '';
    let originalName = "Texto Manual";
    let filePathDB = "";

    if (req.file) {
      originalName = req.file.originalname;
      // Garante caminho relativo para o banco
      filePathDB = req.file.path.replace(/\\/g, "/").split('server/')[1] || req.file.path.replace(/\\/g, "/");
      
      if (req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdf(dataBuffer);
        extractedText = pdfData.text;
      } else {
        extractedText = fs.readFileSync(req.file.path, 'utf8');
      }
    } else {
      extractedText = req.body.text;
    }

    // IA REAL
    const { markdownAnalysis, jsonFinal } = await analyzeWithGemini(extractedText);
    const sentimentResult = sentiment.analyze(extractedText);

    const analysisResult = new Document({
      filename: originalName,
      filePath: filePathDB,
      originalText: extractedText,
      
      // Dados visuais
      aiSummary: markdownAnalysis,
      
      // AQUI ESTÁ A CORREÇÃO: Usamos successProbability no campo riskAnalysis
      // (Mantivemos o nome 'riskAnalysis' no banco para não ter que apagar o banco de dados, 
      // mas agora ele guarda a CHANCE DE SUCESSO).
      riskAnalysis: jsonFinal.successProbability, 
      
      verdict: jsonFinal.verdictShort,
      keywords: jsonFinal.sentimentKeywords,
      
      sentimentScore: sentimentResult.score,
      sentimentComparative: sentimentResult.comparative,
      
      userId: user._id
    });

    await analysisResult.save();

    user.usageCount = user.usageCount + 1;
    await user.save();

    res.status(200).json(analysisResult);

  } catch (error) {
    console.error("Erro Final:", error);
    if (error.message && error.message.includes('429')) {
        return res.status(429).json({ message: "IA sobrecarregada. Tente em 1 minuto." });
    }
    res.status(500).json({ message: 'Erro ao processar análise.', error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
      const documents = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
      res.status(200).json(documents);
  } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar dados.' });
  }
};