const generateLegalAnalysis = async (text, filename) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY faltando");

  // 1. FUNÇÃO DE AUTO-DESCOBERTA DE MODELO
  // Pergunta ao Google quais modelos sua chave pode acessar
  async function getBestModel() {
    try {
      console.log("🔍 Consultando lista de modelos disponíveis na sua conta...");
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const response = await fetch(listUrl);
      const data = await response.json();

      if (!data.models) {
        console.error("❌ Erro ao listar modelos:", data);
        return "gemini-1.5-flash"; // Fallback cego
      }

      // Procura o primeiro modelo que suporte 'generateContent'
      const bestModel = data.models.find(m => 
        m.supportedGenerationMethods && 
        m.supportedGenerationMethods.includes("generateContent") &&
        m.name.includes("gemini") // Dá preferência aos modelos Gemini
      );

      if (bestModel) {
        // O nome vem como 'models/gemini-pro', removemos o prefixo se precisar
        const modelName = bestModel.name.replace("models/", "");
        console.log(`✅ Modelo detectado e selecionado: ${modelName}`);
        return modelName;
      }
      
      return "gemini-pro"; // Último recurso
    } catch (e) {
      console.error("⚠️ Falha na auto-descoberta, usando padrão:", e.message);
      return "gemini-1.5-flash";
    }
  }

  try {
    // 2. DESCOBRE O MODELO REAL
    const modelName = await getBestModel();

    // 3. FAZ A REQUISIÇÃO
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    console.log(`🤖 Iniciando análise com: ${modelName}`);

    const requestBody = {
      contents: [{
        parts: [{ 
          text: `
            Role: Senior Legal Analyst.
            Task: Return a JSON analysis.
            Lang: Portuguese (Brazil).
            Doc: ${filename}
            Text: "${text.substring(0, 15000).replace(/"/g, "'").replace(/\n/g, " ")}" 
            
            Strict JSON Output:
            {
              "summary": "Resumo conciso",
              "riskScore": 50,
              "verdict": "Neutral",
              "keywords": {"positive":[], "negative":[]},
              "strategicAdvice": "Conselho"
            }
          ` 
        }]
      }],
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // 4. TRATAMENTO DA RESPOSTA
    const cleanJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      return JSON.parse(cleanJson);
    } catch (e) {
      return {
        summary: textOutput.substring(0, 500),
        riskScore: 50,
        verdict: "Neutral",
        keywords: { positive: [], negative: [] },
        strategicAdvice: "Erro de formatação visual. Leia o resumo."
      };
    }

  } catch (error) {
    console.error("❌ ERRO FINAL:", error.message);
    throw new Error("Falha na IA: " + error.message);
  }
};

module.exports = { generateLegalAnalysis };