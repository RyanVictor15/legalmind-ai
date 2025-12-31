const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ ERRO CRÍTICO: GEMINI_API_KEY não encontrada no .env");
}

const genAI = new GoogleGenerativeAI(apiKey);

// CONFIGURAÇÃO DO MODELO
// Usamos o 'gemini-1.5-flash' para garantir velocidade e evitar erros de cota (429).
const MODEL_NAME = "gemini-1.5-flash"; 

const generationConfig = {
  temperature: 0.4, // Mais preciso, menos criativo
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json", // Força resposta JSON limpa
};

/**
 * Gera análise jurídica estruturada.
 */
const generateLegalAnalysis = async (text, filename) => {
  try {
    if (!text || text.length < 50) {
      throw new Error("O texto extraído é muito curto ou vazio.");
    }

    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: generationConfig
    });

    const prompt = `
      Você é um Assistente Jurídico Sênior (LegalMind AI). Analise o documento anexo: "${filename}".
      
      CONTEXTO (Primeiros 30k caracteres):
      ${text.substring(0, 30000)}

      TAREFA:
      Forneça uma análise técnica e imparcial em formato JSON estrito.
      
      JSON SCHEMA OBRIGATÓRIO:
      {
        "summary": "Resumo executivo do documento (máx 3 parágrafos).",
        "riskScore": (número 0-100, onde 100 é risco crítico),
        "verdict": "Veredito curto (ex: Favorável, Risco Moderado, Crítico)",
        "strategicAdvice": "Conselho prático para o advogado.",
        "keywords": {
          "positive": ["lista", "termos", "bons"],
          "negative": ["lista", "termos", "ruins"]
        }
      }
    `;

    console.log(`🤖 Enviando para IA (${MODEL_NAME})...`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textOutput = response.text();

    // Tratamento e Parse do JSON
    let cleanJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const jsonResponse = JSON.parse(cleanJson);
      
      // Validação de segurança dos campos
      return {
        summary: jsonResponse.summary || "Resumo indisponível.",
        riskScore: typeof jsonResponse.riskScore === 'number' ? jsonResponse.riskScore : 50,
        verdict: jsonResponse.verdict || "Em análise",
        strategicAdvice: jsonResponse.strategicAdvice || "Sem conselho específico.",
        keywords: jsonResponse.keywords || { positive: [], negative: [] }
      };

    } catch (parseError) {
      console.error("❌ Erro de Parse JSON:", parseError);
      return {
        summary: "Erro ao processar resposta da IA. Tente novamente.",
        riskScore: 0,
        verdict: "Erro Técnico",
        strategicAdvice: "Ocorreu uma falha na formatação da resposta.",
        keywords: { positive: [], negative: [] }
      };
    }

  } catch (error) {
    console.error(`❌ Erro AI Service:`, error.message);
    
    if (error.message.includes('429') || error.message.includes('Quota')) {
      throw new Error("Sistema sobrecarregado (Cota da IA). Aguarde 1 minuto.");
    }
    
    throw new Error("Falha na comunicação com a Inteligência Artificial.");
  }
};

module.exports = { generateLegalAnalysis };