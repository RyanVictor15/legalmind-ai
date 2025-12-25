const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// Inicializa o cliente com a chave do Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateLegalAnalysis = async (text, filename) => {
  try {
    console.log("🤖 Iniciando análise com Gemini 1.5 Flash...");

    // MODELO FIXO: Este é o modelo mais estável e gratuito do momento
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
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
      Language: Portuguese (Brazil).
      
      Document Name: ${filename}
      Text Content: "${text.substring(0, 15000).replace(/"/g, "'")}" 
      
      Output Format (Strict JSON):
      {
        "summary": "Resumo conciso do caso em português",
        "riskScore": 0-100 (integer),
        "verdict": "Favorable" | "Unfavorable" | "Neutral",
        "keywords": {
           "positive": ["ponto", "forte"],
           "negative": ["ponto", "fraco"]
        },
        "strategicAdvice": "Conselho estratégico curto"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textOutput = response.text();

    console.log("✅ Resposta da IA recebida!");

    // Limpeza do JSON (Remove crases do Markdown)
    const jsonString = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("⚠️ Erro no formato JSON, usando fallback:", e);
        return {
            summary: textOutput.substring(0, 500),
            riskScore: 50,
            verdict: "Neutral",
            keywords: { positive: ["Análise Realizada"], negative: ["Erro Visual"] },
            strategicAdvice: "A IA analisou o texto, mas o formato visual falhou. Leia o resumo acima."
        };
    }

  } catch (error) {
    // LOG DETALHADO: Vai nos dizer exatamente o que houve se falhar
    console.error("❌ ERRO FATAL NA IA:", error);
    
    // Se der erro de 'Not Found' aqui, é certeza que é Cache do Render
    throw new Error(`Falha na IA (${error.status || 'Erro'}): ${error.message}`);
  }
};

module.exports = { generateLegalAnalysis };