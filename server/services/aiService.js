// Removemos a dependência da biblioteca problemática
// Usamos fetch nativo do Node.js (Funciona sempre)

const generateLegalAnalysis = async (text, filename) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY faltando no .env");

  // Lista de modelos para tentar (do mais rápido para o mais compatível)
  const models = ["gemini-1.5-flash", "gemini-pro"];

  for (const modelName of models) {
    try {
      console.log(`🤖 Conectando via HTTP ao modelo: ${modelName}...`);
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      const requestBody = {
        contents: [{
          parts: [{ 
            text: `
              Atue como Advogado Sênior Especialista.
              Analise este documento: "${filename}".
              Texto: "${text.substring(0, 25000).replace(/"/g, "'").replace(/\n/g, " ")}" 
              
              Gere um JSON estrito com esta estrutura:
              {
                "summary": "Resumo jurídico detalhado (fatos, direito, pedidos)",
                "riskScore": 75,
                "verdict": "Favorable" | "Unfavorable" | "Neutral",
                "keywords": { "positive": ["ponto1", "ponto2"], "negative": ["risco1"] },
                "strategicAdvice": "Conselho prático para o advogado atuar no caso."
              }
            ` 
          }]
        }],
        generationConfig: {
            temperature: 0.2, // Mais preciso
            responseMimeType: "application/json" // Força JSON no Gemini 1.5
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Erro API Google: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extração segura do texto
      let textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textOutput) throw new Error("IA retornou resposta vazia");

      // LIMPEZA CIRÚRGICA DE JSON
      // Remove ```json no inicio e ``` no final
      textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Garante que pegamos apenas o objeto JSON (entre a primeira { e a última })
      const firstBrace = textOutput.indexOf('{');
      const lastBrace = textOutput.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        textOutput = textOutput.substring(firstBrace, lastBrace + 1);
      }

      console.log(`✅ Sucesso com ${modelName}!`);
      return JSON.parse(textOutput);

    } catch (error) {
      console.warn(`⚠️ Falha no modelo ${modelName}:`, error.message);
      // Continua o loop para tentar o próximo modelo (gemini-pro)
    }
  }

  // Se tudo falhar, retorna erro amigável
  return {
    summary: "Erro de conexão com a IA. Verifique sua chave de API ou tente novamente.",
    riskScore: 0,
    verdict: "Neutral",
    keywords: { positive: [], negative: ["Erro Técnico"] },
    strategicAdvice: "O sistema não conseguiu contatar o Google Gemini."
  };
};

module.exports = { generateLegalAnalysis };