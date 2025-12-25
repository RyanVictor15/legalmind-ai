const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// Inicializa o cliente com sua chave (garanta que a chave no Render está certa!)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateLegalAnalysis = async (text, filename) => {
  // LISTA DE MODELOS PARA TENTAR (Do mais novo para o mais antigo)
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
  
  let lastError = null;

  // Loop inteligente: Tenta um por um
  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Tentando analisar com modelo: ${modelName}...`);
      
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
      });

      const prompt = `
        Role: Senior Legal Analyst.
        Task: Analyze this legal document and output valid JSON.
        Language: Portuguese (Brazil).
        Document Name: ${filename}
        Text: "${text.substring(0, 15000).replace(/"/g, "'")}" 
        
        Output Format (Strict JSON):
        {
          "summary": "Resumo do caso",
          "riskScore": 85,
          "verdict": "Favorable",
          "keywords": { "positive": ["a", "b"], "negative": ["c", "d"] },
          "strategicAdvice": "Conselho aqui"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textOutput = response.text();

      console.log(`✅ Sucesso com ${modelName}!`);
      
      // Limpeza do JSON
      const jsonString = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
          return JSON.parse(jsonString);
      } catch (e) {
          // Se o JSON falhar, mas a IA respondeu, devolvemos o texto mesmo assim
          return {
              summary: textOutput.substring(0, 500),
              riskScore: 50,
              verdict: "Neutral",
              keywords: { positive: [], negative: [] },
              strategicAdvice: "Análise feita, mas formato visual falhou. Leia o resumo."
          };
      }

    } catch (error) {
      console.warn(`⚠️ Falha ao usar modelo ${modelName}:`, error.message);
      lastError = error;
      // O loop continua para o próximo modelo...
    }
  }

  // Se chegou aqui, todos falharam
  console.error("❌ Todos os modelos de IA falharam.");
  throw new Error(`Falha crítica na IA. Detalhe: ${lastError ? lastError.message : 'Erro desconhecido'}`);
};

module.exports = { generateLegalAnalysis };