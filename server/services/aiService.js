const generateLegalAnalysis = async (text, filename) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Chave de API não configurada no servidor.");

  // Usamos o 'gemini-pro' porque é o mais compatível com contas antigas e novas
  const model = "gemini-pro"; 

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Prompt específico para garantir JSON
  const prompt = `
    ATUE COMO UM ADVOGADO SÊNIOR ESPECIALISTA.
    Analise o documento jurídico abaixo: "${filename}".
    Conteúdo extraído: "${text.substring(0, 25000).replace(/"/g, "'").replace(/\n/g, " ")}"

    SUA MISSÃO:
    Retorne APENAS um objeto JSON válido (sem markdown, sem texto antes ou depois).
    Siga estritamente este formato:
    {
      "summary": "Resumo detalhado dos fatos, fundamentos e pedidos (máx 600 caracteres).",
      "riskScore": (número inteiro 0-100),
      "verdict": "Favorável" | "Desfavorável" | "Incerto",
      "keywords": { "positive": ["ponto1", "ponto2"], "negative": ["risco1", "risco2"] },
      "strategicAdvice": "Conselho prático para o advogado."
    }
  `;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // Não usamos responseMimeType aqui para evitar erro 400 no gemini-pro
        generationConfig: { temperature: 0.2 }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0].content) {
      throw new Error("A IA não retornou conteúdo.");
    }

    let textOutput = data.candidates[0].content.parts[0].text;

    // --- LIMPEZA BLINDADA DE JSON ---
    // Remove ```json, ``` e espaços extras
    textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Garante que pegamos apenas o objeto JSON
    const firstBrace = textOutput.indexOf('{');
    const lastBrace = textOutput.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      textOutput = textOutput.substring(firstBrace, lastBrace + 1);
      console.log("✅ Análise Jurídica concluída com sucesso.");
      return JSON.parse(textOutput);
    } else {
      throw new Error("Formato inválido recebido da IA.");
    }

  } catch (error) {
    console.error("❌ Erro na IA:", error.message);
    
    // Retorna um erro formatado para não quebrar o Frontend
    return {
      summary: `Não foi possível concluir a análise automática. Detalhe: ${error.message}`,
      riskScore: 0,
      verdict: "Incerto",
      keywords: { positive: [], negative: ["Erro Técnico"] },
      strategicAdvice: "Verifique se o documento é legível e tente novamente."
    };
  }
};

module.exports = { generateLegalAnalysis };