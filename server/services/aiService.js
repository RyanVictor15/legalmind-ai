const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateLegalAnalysis = async (text, filename) => {
  // LISTA DE MODELOS BLINDADA: Tenta um por um até funcionar
  const modelsToTry = [
    "gemini-1.5-flash", 
    "gemini-1.5-flash-latest",
    "gemini-pro",
    "gemini-1.0-pro"
  ];
  
  // Configurações de segurança no máximo (BLOCK_NONE)
  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ];

  let lastError = null;

  // --- LOOP DE TENTATIVAS ---
  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Tentando modelo: ${modelName}...`);
      
      const model = genAI.getGenerativeModel({ model: modelName, safetySettings });

      const prompt = `
        Role: Senior Legal Analyst.
        Language: Portuguese (Brazil).
        Document: ${filename}
        Text: "${text.substring(0, 15000).replace(/"/g, "'")}" 
        
        Output (Strict JSON):
        {
          "summary": "Resumo do caso",
          "riskScore": 50,
          "verdict": "Neutral",
          "keywords": { "positive": [], "negative": [] },
          "strategicAdvice": "Conselho aqui"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textOutput = response.text();

      console.log(`✅ SUCESSO com o modelo: ${modelName}`);

      // Parse do JSON
      const jsonString = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
          return JSON.parse(jsonString);
      } catch (e) {
          // Fallback se o JSON quebrar
          return {
              summary: textOutput.substring(0, 500),
              riskScore: 50,
              verdict: "Neutral",
              keywords: { positive: [], negative: [] },
              strategicAdvice: "Análise feita, erro na formatação visual."
          };
      }

    } catch (error) {
      console.warn(`⚠️ Falha no modelo ${modelName}:`, error.message);
      lastError = error;
      // Continua para o próximo modelo da lista...
    }
  }

  // Se chegou aqui, todos falharam
  console.error("❌ TODOS OS MODELOS FALHARAM.");
  throw new Error(`Erro Fatal na IA: ${lastError ? lastError.message : 'Chave inválida ou erro interno'}`);
};

module.exports = { generateLegalAnalysis };