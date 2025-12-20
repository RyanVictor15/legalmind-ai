// Arquivo: server/test-models.js
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ ERRO: Nenhuma chave API encontrada no arquivo .env");
  process.exit(1);
}

console.log("🔍 Verificando modelos disponíveis para sua chave...");

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("❌ Erro da API:", data.error.message);
      return;
    }

    console.log("✅ Modelos disponíveis na sua conta:");
    if (data.models) {
        data.models.forEach(model => {
            // Mostra apenas modelos que geram texto (generateContent)
            if (model.supportedGenerationMethods.includes("generateContent")) {
                console.log(`   - ${model.name.replace("models/", "")}`);
            }
        });
    } else {
        console.log("   Nenhum modelo encontrado.");
    }

  } catch (error) {
    console.error("❌ Erro de conexão:", error.message);
  }
}

listModels();