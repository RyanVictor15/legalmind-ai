const generateLegalAnalysis = async (text, filename) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no Environment");
  }

  // LISTA DE MODELOS PARA TENTAR VIA FETCH (Do mais novo para o mais compatível)
  const models = [
    "gemini-1.5-flash", // Tenta o rápido primeiro
    "gemini-pro"        // Se der 404, usa o clássico (UNIVERSAL)
  ];

  let lastError = null;

  // --- LOOP DE TENTATIVAS (FETCH DIRETO) ---
  for (const modelName of models) {
    try {
      console.log(`🤖 Tentando conectar via HTTP direto no modelo: ${modelName}...`);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const requestBody = {
        contents: [{
          parts: [{ 
            text: `
              Role: Senior Legal Analyst.
              Task: Return a JSON analysis.
              Lang: Portuguese (Brazil).
              Doc: ${filename}
              Text: "${text.substring(0, 15000).replace(/"/g, "'").replace(/\n/g, " ")}" 
              
              JSON Format:
              {
                "summary": "Resumo",
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

      // Se der erro 404 ou 400, lança erro para cair no catch e tentar o próximo modelo
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      
      // Se chegou aqui, FUNCIONOU!
      console.log(`✅ SUCESSO com ${modelName}!`);
      
      const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      
      // Tenta limpar o JSON (remove markdown ```json)
      const cleanJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      
      try {
        return JSON.parse(cleanJson);
      } catch (e) {
        // Se o JSON falhar, retorna objeto manual com o texto
        return {
            summary: textOutput.substring(0, 500),
            riskScore: 50,
            verdict: "Neutral",
            keywords: { positive: [], negative: [] },
            strategicAdvice: "Análise feita, erro visual. Leia o resumo."
        };
      }

    } catch (error) {
      console.warn(`⚠️ Falha no modelo ${modelName}: ${error.message}`);
      lastError = error;
      // O loop continua automaticamente para o próximo (gemini-pro)
    }
  }

  // Se saiu do loop, os dois falharam
  console.error("❌ TODOS OS MODELOS FALHARAM.");
  throw new Error("Erro na IA: " + (lastError ? lastError.message : "Falha desconhecida"));
};

module.exports = { generateLegalAnalysis };