// server/audit-key.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Fix de SSL do Windows
require('dotenv').config();

async function descobrirModelos() {
    const key = process.env.GEMINI_API_KEY;
    console.log(`\n🔑 Testando chave final: ...${key.slice(-4)}`);

    // Vamos perguntar diretamente para a API o que está disponível
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        console.log("📡 Conectando ao Google para listar modelos disponíveis...");
        
        // Usamos fetch nativo para não depender da versão da biblioteca
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ ERRO DA API:", data.error.message);
            return;
        }

        console.log("\n✅ SUCESSO! A CHAVE FUNCIONA. AQUI ESTÃO OS NOMES CORRETOS:");
        console.log("===========================================================");
        
        const models = data.models || [];
        // Filtra apenas modelos que geram texto ('generateContent')
        const textModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));

        if (textModels.length === 0) {
            console.log("Nenhum modelo de texto encontrado. A chave pode ser restrita.");
        } else {
            textModels.forEach(m => {
                // Remove o prefixo 'models/' para te dar o nome limpo
                console.log(`👉 "${m.name.replace('models/', '')}"`);
            });
        }
        console.log("===========================================================");
        console.log("AÇÃO: Copie um dos nomes acima e coloque no analyzeController.js");

    } catch (error) {
        console.error("❌ ERRO DE REDE:", error.message);
    }
}

descobrirModelos();