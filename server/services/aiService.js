// server/services/aiService.js
// MODELO: GEMINI-1.0-PRO (Nome Técnico Completo)

const generateLegalAnalysis = async (text, filename) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // AQUI ESTAVA O ERRO: "gemini-pro" é um apelido que foi removido em algumas regiões.
  // AQUI ESTÁ A SOLUÇÃO: Usamos o nome de batismo exato do modelo.
  const model = "gemini-1.5-flash-001"; 
  
  console.log(`🤖 IA: Conectando ao modelo técnico: ${model}...`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `
    ATUE COMO ADVOGADO SÊNIOR.
    Analise o documento: "${filename}".
    Conteúdo: "${text.substring(0, 20000).replace(/"/g, "'").replace(/\n/g, " ")}"

    RETORNE APENAS JSON (SEM MARKDOWN):
    {
      "summary": "Resumo jurídico detalhado.",
      "riskScore": 50,
      "verdict": "Favorável",
      "keywords": { "positive": ["ponto1"], "negative": ["risco1"] },
      "strategicAdvice": "Conselho prático."
    }
  `;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // Modelos 1.0 NÃO aceitam 'responseMimeType', então deixamos sem.
        generationConfig: {
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Validação de segurança
    if (!data.candidates || !data.candidates[0].content) {
      throw new Error("A IA retornou vazio.");
    }

    let textOutput = data.candidates[0].content.parts[0].text;

    // Limpeza Manual de JSON (Obrigatório para o 1.0)
    textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    const start = textOutput.indexOf('{');
    const end = textOutput.lastIndexOf('}');
    
    if (start !== -1 && end !== -1) {
      return JSON.parse(textOutput.substring(start, end + 1));
    } else {
      throw new Error("IA não gerou JSON válido.");
    }

  } catch (error) {
    console.error("❌ Erro IA:", error.message);
    return {
      summary: `Erro técnico: ${error.message}`,
      riskScore: 0,
      verdict: "Erro",
      keywords: { positive: [], negative: [] },
      strategicAdvice: "Verifique a chave API ou tente novamente."
    };
  }
};

module.exports = { generateLegalAnalysis };