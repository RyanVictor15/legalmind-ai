const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateLegalAnalysis = async (text, filename) => {
  try {
    // --- ATENÇÃO: CONFIGURAÇÃO DE SEGURANÇA ADICIONADA ---
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    // Structured Prompt for Legal Analysis
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
        "riskScore": 0-100 (integer, high means high success probability),
        "verdict": "Favorable" | "Unfavorable" | "Neutral",
        "keywords": {
           "positive": ["lista", "de", "pontos", "fortes"],
           "negative": ["lista", "de", "pontos", "fracos"]
        },
        "strategicAdvice": "Conselho estratégico em um parágrafo"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textOutput = response.text();

    console.log("Raw AI Response:", textOutput); // Log para debug no Render

    // Limpeza para garantir JSON válido (remove crases de markdown)
    const jsonString = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Erro ao fazer parse do JSON da IA:", e);
        // Fallback caso a IA não retorne JSON perfeito
        return {
            summary: textOutput.substring(0, 500),
            riskScore: 50,
            verdict: "Neutral",
            keywords: { positive: [], negative: [] },
            strategicAdvice: "A IA retornou uma análise não estruturada. Verifique o resumo."
        };
    }

  } catch (error) {
    console.error("Erro no Serviço de IA:", error);
    throw new Error('Falha ao gerar análise com IA: ' + error.message);
  }
};

module.exports = { generateLegalAnalysis };