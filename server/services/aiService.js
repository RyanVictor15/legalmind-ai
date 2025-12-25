// Removemos a dependência da biblioteca @google/generative-ai
// Usaremos fetch nativo do Node.js

const generateLegalAnalysis = async (text, filename) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no Environment");
  }

  // URL Direta da API (Bypassing SDK)
  // Usamos o modelo gemini-1.5-flash que é o padrão atual
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const promptText = `
    Role: Senior Legal Analyst.
    Task: Analyze the provided legal document text and output a JSON response.
    Language: Portuguese (Brazil).
    
    Document Name: ${filename}
    Text Content: "${text.substring(0, 15000).replace(/"/g, "'").replace(/\n/g, " ")}" 
    
    Output Format (Strict JSON):
    {
      "summary": "Resumo conciso do caso",
      "riskScore": 0-100 (integer),
      "verdict": "Favorable" | "Unfavorable" | "Neutral",
      "keywords": {
         "positive": ["ponto", "forte"],
         "negative": ["ponto", "fraco"]
      },
      "strategicAdvice": "Conselho estratégico curto"
    }
  `;

  const requestBody = {
    contents: [{
      parts: [{ text: promptText }]
    }],
    // Configurações de Segurança (Hardcoded para permitir tudo)
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ],
    // Força a resposta em JSON (Feature nova do 1.5)
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  try {
    console.log("🤖 Enviando requisição direta (RAW HTTP) para o Gemini...");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro na API do Google (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    
    // Extrai o texto da resposta bruta
    const textOutput = data.candidates[0].content.parts[0].text;
    console.log("✅ Resposta RAW recebida com sucesso!");

    // Parse garantido
    try {
        return JSON.parse(textOutput);
    } catch (e) {
        // Limpeza extra caso venha markdown mesmo com o mimeType configurado
        const cleanJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
    }

  } catch (error) {
    console.error("❌ ERRO NO FETCH DIRETO:", error.message);
    
    // Fallback de emergência para não quebrar o front
    return {
        summary: "Erro ao conectar com a IA. Detalhes técnicos nos logs do servidor.",
        riskScore: 0,
        verdict: "Neutral",
        keywords: { positive: [], negative: ["Erro de Conexão"] },
        strategicAdvice: "Verifique a chave de API e a disponibilidade do serviço."
    };
  }
};

module.exports = { generateLegalAnalysis };