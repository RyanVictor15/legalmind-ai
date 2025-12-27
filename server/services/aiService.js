// server/services/aiService.js
const generateLegalAnalysis = async (text, filename) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // --- AQUI ESTÁ A CORREÇÃO ---
  // O erro mostrou que sua conta não aceita "gemini-1.5-flash".
  // Estamos forçando o uso do "gemini-pro" (que é o que funcionou no seu teste antigo).
  const model = "gemini-pro"; 
  
  console.log(`🤖 Iniciando análise usando modelo: ${model}`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `
    ATUE COMO ADVOGADO SÊNIOR.
    Analise o documento: "${filename}".
    Texto: "${text.substring(0, 25000).replace(/"/g, "'").replace(/\n/g, " ")}"

    RETORNE APENAS UM JSON VÁLIDO NESTE FORMATO EXATO:
    {
      "summary": "Resumo jurídico detalhado.",
      "riskScore": 75,
      "verdict": "Favorável",
      "keywords": { "positive": ["A"], "negative": ["B"] },
      "strategicAdvice": "Conselho."
    }
  `;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // REMOVEMOS 'responseMimeType' POIS O GEMINI-PRO NÃO ACEITA (Gera erro 400)
        generationConfig: {
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Se der erro aqui, vai aparecer no log qual modelo tentou usar
      throw new Error(`Google API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Tratamento de segurança caso a IA devolva vazio
    if (!data.candidates || !data.candidates[0].content) {
      throw new Error("A IA não retornou conteúdo.");
    }

    let textOutput = data.candidates[0].content.parts[0].text;

    // Limpeza para remover ```json e ```
    textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Extrai apenas o JSON (entre a primeira { e a última })
    const firstBrace = textOutput.indexOf('{');
    const lastBrace = textOutput.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      textOutput = textOutput.substring(firstBrace, lastBrace + 1);
      return JSON.parse(textOutput);
    } else {
      throw new Error("Formato inválido.");
    }

  } catch (error) {
    console.error("❌ Erro:", error.message);
    return {
      summary: `Erro na análise: ${error.message}`,
      riskScore: 0,
      verdict: "Incerto",
      strategicAdvice: "Tente novamente."
    };
  }
};

module.exports = { generateLegalAnalysis };