// server/services/aiService.js
// VERSÃO: HTTP PURO (SEM BIBLIOTECA)

const generateLegalAnalysis = async (text, filename) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ ERRO: GEMINI_API_KEY não encontrada no .env");
    throw new Error("Chave de API não configurada no servidor.");
  }

  // URL direta da API do Google (v1beta é a mais estável para chaves gratuitas)
  // Usamos o modelo 'gemini-1.5-flash' que é rápido e aceita JSON nativo
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  console.log(`🤖 Iniciando análise via HTTP Direto para: ${filename}`);

  const prompt = `
    ATUE COMO UM ADVOGADO SÊNIOR ESPECIALISTA.
    Analise o documento jurídico abaixo e retorne APENAS um JSON estrito.
    
    DOCUMENTO: "${filename}"
    CONTEÚDO: "${text.substring(0, 30000).replace(/"/g, "'").replace(/\n/g, " ")}"

    FORMATO JSON OBRIGATÓRIO:
    {
      "summary": "Resumo detalhado dos fatos, fundamentos jurídicos e pedidos (máx 600 caracteres).",
      "riskScore": (número inteiro de 0 a 100 indicando chance de êxito),
      "verdict": "Favorable" ou "Unfavorable" ou "Neutral",
      "keywords": {
        "positive": ["lista", "de", "pontos", "fortes"],
        "negative": ["lista", "de", "riscos"]
      },
      "strategicAdvice": "Conselho prático e estratégico para o advogado sobre este caso."
    }
  `;

  const requestBody = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json" // Força o Google a devolver JSON
    }
  };

  try {
    // 1. Faz a requisição direta (como se fosse um navegador/Postman)
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    // 2. Verifica se o Google rejeitou a chave ou deu erro
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API Error: ${response.status} - ${errorText}`);
    }

    // 3. Processa o resultado
    const data = await response.json();
    
    // Verifica se veio resposta válida
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("A IA não retornou nenhum texto (Bloqueio de segurança ou erro interno).");
    }

    let textOutput = data.candidates[0].content.parts[0].text;

    // 4. Limpeza de Segurança (Garante que é JSON puro)
    textOutput = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Pega apenas o conteúdo entre chaves { }
    const firstBrace = textOutput.indexOf('{');
    const lastBrace = textOutput.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      textOutput = textOutput.substring(firstBrace, lastBrace + 1);
    }

    console.log("✅ Análise Jurídica concluída com sucesso!");
    return JSON.parse(textOutput);

  } catch (error) {
    console.error("❌ FALHA CRÍTICA NA IA:", error.message);
    
    // Retorna um JSON de "Erro Bonito" para não quebrar o frontend
    return {
      summary: `Erro técnico ao consultar a IA: ${error.message}. Verifique a validade da chave API.`,
      riskScore: 0,
      verdict: "Neutral",
      keywords: { positive: [], negative: ["Erro de Conexão"] },
      strategicAdvice: "O sistema não conseguiu conectar aos servidores do Google. Tente novamente mais tarde."
    };
  }
};

module.exports = { generateLegalAnalysis };