const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateLegalAnalysis = async (text, filename) => {
  // Lista de modelos para tentativa de fallback (caso um falhe)
  const modelsToTry = ["gemini-1.5-flash", "gemini-pro"];
  
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 IA: Tentando modelo ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
        Você é um Analista Jurídico Sênior (Brasil).
        Analise o seguinte documento: "${filename}".
        Texto extraído: "${text.substring(0, 20000).replace(/"/g, "'")}"
        
        Sua tarefa: Retornar APENAS um JSON válido. Não use Markdown. Não explique nada fora do JSON.
        Estrutura obrigatória:
        {
          "summary": "Resumo detalhado dos fatos e pedidos (máx 500 caracteres)",
          "riskScore": (número de 0 a 100, onde 100 é êxito garantido),
          "verdict": "Favorable" ou "Unfavorable" ou "Neutral",
          "keywords": { "positive": ["lista", "de", "pontos", "fortes"], "negative": ["lista", "de", "pontos", "fracos"] },
          "strategicAdvice": "Conselho estratégico prático para o advogado."
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let textOutput = response.text();

      // --- LIMPEZA BLINDADA DE JSON ---
      // Remove blocos de código markdown (```json ... ```) se existirem
      textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Encontra onde começa o { e onde termina o } para ignorar textos fora
      const firstBrace = textOutput.indexOf('{');
      const lastBrace = textOutput.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        textOutput = textOutput.substring(firstBrace, lastBrace + 1);
      }

      console.log("✅ IA: Resposta gerada com sucesso.");
      return JSON.parse(textOutput);

    } catch (error) {
      console.warn(`⚠️ Erro no modelo ${modelName}:`, error.message);
      lastError = error;
      // Tenta o próximo modelo...
    }
  }

  // Se tudo falhar, retorna um objeto de erro seguro (não derruba o servidor)
  console.error("❌ IA: Falha total.");
  return {
    summary: "Não foi possível processar a análise automática neste momento devido a uma instabilidade na IA. O texto foi salvo.",
    riskScore: 0,
    verdict: "Neutral",
    keywords: { positive: [], negative: ["Erro de Análise"] },
    strategicAdvice: "Tente novamente em alguns instantes."
  };
};

module.exports = { generateLegalAnalysis };