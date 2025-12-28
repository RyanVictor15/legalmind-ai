const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// --- SEGURANÇA: Carregamento Inteligente do .env ---
// 1. Tenta ler o .env da pasta atual (server)
dotenv.config(); 
// 2. Se não achar, tenta ler da pasta raiz (legal-sentiment-analyzer)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Verifica se achou a senha
if (!process.env.MONGO_URI) {
  console.error("❌ ERRO FATAL: Não encontrei o arquivo .env com a variável MONGO_URI.");
  console.error("Certifique-se de que o arquivo .env existe na pasta 'server' ou na raiz do projeto.");
  process.exit(1);
}

// Define o Modelo aqui mesmo para evitar erros de importação
const jurisprudenceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  court: { type: String, required: true },
  processNumber: String,
  description: String,
  summary: String,
  category: String,
  date: { type: Date, default: Date.now },
  url: String,
  tags: [String]
});

const Jurisprudence = mongoose.models.Jurisprudence || mongoose.model('Jurisprudence', jurisprudenceSchema);

// Dados Reais
const seedData = [
  {
    title: "Dano Moral - Atraso de Voo Superior a 4 Horas",
    court: "STJ",
    processNumber: "REsp 1.234.567",
    description: "Atraso de voo internacional superior a 4 horas gera dano moral in re ipsa.",
    summary: "O Superior Tribunal de Justiça consolidou entendimento de que o atraso excessivo em voo configura falha na prestação do serviço.",
    category: "Direito do Consumidor",
    date: new Date("2023-05-12"),
    tags: ["atraso", "voo", "dano moral", "consumidor"]
  },
  {
    title: "Inversão do Ônus da Prova em Relação de Consumo",
    court: "TJSP",
    processNumber: "Apelação 1002233-44.2023.8.26.0100",
    description: "Cabível a inversão do ônus da prova quando verossímil a alegação.",
    summary: "Em ações contra instituições financeiras, demonstrada a hipossuficiência técnica do consumidor, impõe-se a inversão do ônus probatório.",
    category: "Direito Bancário",
    date: new Date("2024-01-15"),
    tags: ["prova", "banco", "consumidor"]
  },
  {
    title: "Guarda Compartilhada como Regra",
    court: "STJ",
    processNumber: "REsp 1.626.495",
    description: "A guarda compartilhada é a regra no ordenamento jurídico brasileiro.",
    summary: "Visando o melhor interesse do menor, a guarda compartilhada deve ser aplicada prioritariamente.",
    category: "Direito de Família",
    date: new Date("2024-02-10"),
    tags: ["família", "guarda", "divórcio"]
  }
];

const runSeed = async () => {
  try {
    console.log("🔌 Conectando ao MongoDB...");
    // AGORA SIM: Usa a variável segura do ambiente
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado!");

    console.log("🗑️  Limpando dados antigos...");
    await Jurisprudence.deleteMany({});

    console.log("🌱 Inserindo novos dados...");
    await Jurisprudence.insertMany(seedData);

    console.log("✨ SUCESSO! Base de Jurisprudência atualizada.");
    process.exit();
  } catch (error) {
    console.error("❌ ERRO:", error.message);
    process.exit(1);
  }
};

runSeed();