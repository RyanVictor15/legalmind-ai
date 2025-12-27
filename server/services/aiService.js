// server/services/aiService.js
// ESTRATÉGIA: AUTO-DISCOVERY (Descobre o modelo disponível automaticamente)

const generateLegalAnalysis = async (text, filename) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Chave API ausente.");

  try {
    // PASSO 1: Perguntar ao Google "O que eu posso usar?"
    // Isso evita o erro 404 de "Modelo não encontrado"
    console.log("🔍 Consultando lista de modelos disponíveis na sua conta...");
    
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listResponse = await fetch(listUrl);
    
    if (!listResponse.ok) {
      throw new Error(`Erro ao listar modelos: ${listResponse.status}`);
    }

    const listData = await listResponse.json();
    
    // Filtra um modelo que seja 'gemini' e suporte 'generateContent'
    const availableModel = listData.models?.find(m => 
      m.name.includes('gemini') && 
      m.supportedGenerationMethods.includes('generateContent')
    );

    if (!availableModel) {
      throw new Error("Nenhum modelo Gemini disponível para esta Chave API.");
    }

    // O nome vem como 'models/gemini-1.5-flash-001', por exemplo.
    // Nós usamos ele EXATAMENTE como veio.
    const modelName = availableModel.name.replace('models/', '');
    console.log(`✅ Modelo encontrado e selecionado: ${modelName}`);

    // PASSO 2: Usar o modelo encontrado
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const prompt = `
      ATUE COMO ADVOGADO.
      Analise: "${filename}".
      Texto: "${text.substring(0, 20000).replace(/"/g, "'").replace(/\n/g, " ")}"

      RETORNE APENAS JSON:
      {
        "summary": "Resumo jurídico.",
        "riskScore": 50,
        "verdict": "Favorável",
        "keywords": { "positive": [], "negative": [] },
        "strategicAdvice": "Conselho."
      }
    `;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Google Error (${modelName}): ${response.status} - ${err}`);
    }

    const data = await response.json();
    let textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Limpeza Manual (Garantia)
    textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    const start = textOutput.indexOf('{');
    const end = textOutput.lastIndexOf('}');

    if (start !== -1 && end !== -1) {
      return JSON.parse(textOutput.substring(start, end + 1));
    } else {
      throw new Error("Formato de resposta inválido.");
    }

  } catch (error) {
    console.error("❌ Erro IA:", error.message);
    return {
      summary: `Erro: ${error.message}`,
      riskScore: 0,
      verdict: "Erro",
      keywords: { positive: [], negative: [] },
      strategicAdvice: "Verifique sua chave ou permissões no Google AI Studio."
    };
  }
};

module.exports = { generateLegalAnalysis };