// server/test-ai.js

// 1. O FIX DE SEGURANÇA (Obrigatório no seu PC)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const dotenv = require('dotenv');
dotenv.config();

async function discoverModels() {
  const key = process.env.GEMINI_API_KEY;
  console.log("🔑 Usando chave final:", key ? "..." + key.slice(-4) : "NÃO ENCONTRADA");

  // URL direta da API do Google para listar modelos
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

  try {
    console.log("📡 Conectando ao Google para listar modelos...");
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("❌ ERRO DA API:", data.error.message);
      return;
    }

    console.log("\n✅ MODELOS DISPONÍVEIS PARA VOCÊ:");
    console.log("===================================");
    
    const models = data.models || [];
    // Filtra apenas os modelos 'gemini'
    const geminiModels = models.filter(m => m.name.includes('gemini'));

    if (geminiModels.length === 0) {
      console.log("Nenhum modelo Gemini encontrado. A lista completa é:");
      models.forEach(m => console.log(m.name));
    } else {
      geminiModels.forEach(m => {
        // Limpa o nome para ficar fácil de copiar
        console.log(`👉 ${m.name.replace('models/', '')}`);
      });
    }
    console.log("===================================");
    console.log("DICA: Copie um nome acima (ex: gemini-1.5-flash) e coloque no seu controller.");

  } catch (error) {
    console.error("❌ ERRO DE CONEXÃO:");
    console.error(error);
  }
}

discoverModels();