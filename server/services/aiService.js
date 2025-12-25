const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateLegalAnalysis = async (text, filename) => {
  try {
    // TENTATIVA 1: Usar o modelo Flash Específico (Mais estável)
    // Se falhar, você pode trocar manualmente por "gemini-pro"
    const modelName = "gemini-1.5-flash-latest"; 

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
      Task: Analyze the provided legal document text and output a JSON response.
      Context: The user is a lawyer needing a quick overview.
      Language: Portuguese (Brazil).
      
      Document Name: ${filename}
      Text Content: "${text.substring(0, 15000).replace(/"/g, "'")}" 
      
      Output Format (Strict JSON):
      {
        "summary": "Resumo conciso do caso em português",
        "riskScore": 0-100 (integer),
        "verdict": "Favorable" | "Unfavorable" | "Neutral",
        "keywords": {
           "positive": ["lista", "pontos", "fortes"],
           "negative": ["lista", "pontos", "fracos"]
        },
        "strategicAdvice": "Conselho estratégico curto"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textOutput = response.text();

    console.log("Resposta Bruta da IA:", textOutput);

    const jsonString = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Erro JSON:", e);
        return {
            summary: textOutput.substring(0, 500),
            riskScore: 50,
            verdict: "Neutral",
            keywords: { positive: ["Erro Formato"], negative: ["Tente novamente"] },
            strategicAdvice: "Análise concluída, mas formato visual falhou. Leia o resumo."
        };
    }

  } catch (error) {
    console.error("Erro IA:", error);
    // Se der erro de modelo não encontrado, avisamos claramente
    if (error.message.includes('404') || error.message.includes('not found')) {
        throw new Error('Modelo de IA não encontrado. Tente limpar o Cache do Deploy.');
    }
    throw new Error('Falha na IA: ' + error.message);
  }
};

module.exports = { generateLegalAnalysis };