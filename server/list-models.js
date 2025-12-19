// server/list-models.js

// 1. O FIX DE SSL (Mantenha sempre isso enquanto estiver em localhost)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("❌ Sem chave API no .env");
    return;
  }

  console.log("🔍 Perguntando ao Google quais modelos estão disponíveis...");
  
  // Vamos usar fetch puro para não depender da versão da biblioteca
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("❌ Erro da API:", data.error.message);
      return;
    }

    if (!data.models) {
      console.log("❌ Nenhum modelo encontrado. Verifique se sua chave API está ativa no Google AI Studio.");
      return;
    }

    console.log("\n✅ MODELOS DISPONÍVEIS PARA VOCÊ:");
    console.log("===================================");
    
    // Filtra apenas os modelos que geram texto (gemini)
    const available = data.models
      .filter(m => m.name.includes('gemini'))
      .map(m => m.name.replace('models/', '')); // Remove o prefixo para facilitar a leitura

    available.forEach(name => console.log(`👉 ${name}`));
    console.log("===================================");
    console.log("DICA: Copie um desses nomes e use no seu código.");

  } catch (error) {
    console.error("❌ Erro de conexão:", error.message);
  }
}

listModels();