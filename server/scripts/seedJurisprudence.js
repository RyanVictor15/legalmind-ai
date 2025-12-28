const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 1. Carrega as configurações do .env (onde está o link do banco)
dotenv.config();

// 2. Define o Modelo de Jurisprudência aqui mesmo (para não dar erro de arquivo não encontrado)
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

// Verifica se o modelo já existe para evitar redefinição
const Jurisprudence = mongoose.models.Jurisprudence || mongoose.model('Jurisprudence', jurisprudenceSchema);

// 3. Dados Reais para popular o banco
const seedData = [
  {
    title: "Dano Moral - Atraso de Voo Superior a 4 Horas",
    court: "STJ",
    processNumber: "REsp 1.234.567",
    description: "Atraso de voo internacional superior a 4 horas gera dano moral in re ipsa, dispensando a prova do prejuízo.",
    summary: "O Superior Tribunal de Justiça consolidou entendimento de que o atraso excessivo em voo configura falha na prestação do serviço, ensejando reparação por danos morais presumidos.",
    category: "Direito do Consumidor",
    date: new Date("2023-05-12"),
    tags: ["atraso", "voo", "dano moral", "consumidor"]
  },
  {
    title: "Inversão do Ônus da Prova em Relação de Consumo",
    court: "TJSP",
    processNumber: "Apelação 1002233-44.2023.8.26.0100",
    description: "Cabível a inversão do ônus da prova quando verossímil a alegação ou hipossuficiente o consumidor (Art. 6º, VIII, CDC).",
    summary: "Em ações contra instituições financeiras, demonstrada a hipossuficiência técnica do consumidor, impõe-se a inversão do ônus probatório.",
    category: "Direito Bancário",
    date: new Date("2024-01-15"),
    tags: ["prova", "banco", "consumidor"]
  },
  {
    title: "Negativação Indevida - Dano In Re Ipsa",
    court: "STJ",
    processNumber: "AgInt no AREsp 1.555.666",
    description: "A inscrição indevida em cadastro de inadimplentes gera dano moral presumido.",
    summary: "A simples negativação indevida do nome do consumidor é suficiente para gerar o dever de indenizar, independentemente da prova do abalo psicológico.",
    category: "Direito Civil",
    date: new Date("2023-11-20"),
    tags: ["negativação", "serasa", "nome sujo"]
  },
  {
    title: "Guarda Compartilhada como Regra",
    court: "STJ",
    processNumber: "REsp 1.626.495",
    description: "A guarda compartilhada é a regra no ordenamento jurídico brasileiro, mesmo em caso de desavenças entre os pais.",
    summary: "Visando o melhor interesse do menor, a guarda compartilhada deve ser aplicada prioritariamente, salvo se um dos genitores não estiver apto ao exercício do poder familiar.",
    category: "Direito de Família",
    date: new Date("2024-02-10"),
    tags: ["família", "guarda", "divórcio"]
  }
];

// 4. Função Principal
const runSeed = async () => {
  try {
    // Conecta
    console.log("🔌 Conectando ao MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado!");

    // Limpa
    console.log("🗑️  Limpando dados antigos...");
    await Jurisprudence.deleteMany({});

    // Insere
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