const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// --- 1. CONFIGURAÇÃO DE AMBIENTE (Blindada) ---
// Tenta ler o .env da pasta atual ou da pasta raiz
dotenv.config(); 
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.MONGO_URI) {
  console.error("❌ ERRO: Não encontrei o MONGO_URI. Verifique seu arquivo .env");
  process.exit(1);
}

// --- 2. MODELO (Definido aqui para evitar erros de importação) ---
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

// --- 3. DADOS PARA GERAR ALEATORIEDADE ---
const courts = ['STJ', 'STF', 'TJSP', 'TJRJ', 'TJMG', 'TRT-2', 'TRF-3'];
const areas = ['Direito Civil', 'Direito Penal', 'Direito do Trabalho', 'Direito Tributário', 'Direito do Consumidor', 'Direito de Família'];
const temas = [
    { title: 'Dano Moral em Atraso de Voo', tags: ['atraso', 'voo', 'consumidor'] },
    { title: 'Divórcio Litigioso com Partilha', tags: ['família', 'divórcio', 'bens'] },
    { title: 'Inscrição Indevida no Serasa', tags: ['negativação', 'dano moral', 'banco'] },
    { title: 'Erro Médico em Cirurgia', tags: ['saúde', 'indenização', 'responsabilidade civil'] },
    { title: 'Horas Extras não Pagas', tags: ['trabalho', 'clt', 'hora extra'] },
    { title: 'Isenção de Imposto de Renda', tags: ['tributário', 'imposto', 'isenção'] },
    { title: 'Guarda Compartilhada', tags: ['família', 'menor', 'guarda'] },
    { title: 'Fraude em Empréstimo Consignado', tags: ['fraude', 'idoso', 'banco'] },
    { title: 'Usucapião Extrajudicial', tags: ['imóvel', 'propriedade', 'civil'] },
    { title: 'Habeas Corpus - Trancamento de Ação', tags: ['penal', 'liberdade', 'hc'] }
];

const decisoes = [
  "Recurso provido para majorar a indenização.",
  "Negado provimento ao recurso, mantendo a sentença.",
  "Concedida a segurança para garantir o direito líquido e certo.",
  "Ação julgada improcedente por falta de provas.",
  "Acordo homologado entre as partes."
];

// --- 4. FUNÇÃO GERADORA ---
const generateCases = (count) => {
  const cases = [];
  for (let i = 0; i < count; i++) {
    const tribunal = courts[Math.floor(Math.random() * courts.length)];
    const area = areas[Math.floor(Math.random() * areas.length)];
    const tema = temas[Math.floor(Math.random() * temas.length)];
    const decisao = decisoes[Math.floor(Math.random() * decisoes.length)];
    
    // Gera ano aleatório entre 2020 e 2024
    const ano = Math.floor(Math.random() * (2024 - 2020 + 1)) + 2020;
    
    cases.push({
      title: `${tema.title} - ${tribunal}`,
      court: tribunal,
      processNumber: `${Math.floor(Math.random() * 9000000)}-${Math.floor(Math.random() * 99)}.${ano}.8.26.0000`,
      category: area,
      date: new Date(`${ano}-${Math.floor(Math.random() * 12 + 1)}-15`),
      tags: [...tema.tags, area.split(' ')[1].toLowerCase()],
      description: `EMENTA: ${area.toUpperCase()}. ${tema.title.toUpperCase()}. ${decisao} Entendimento consolidado de que a situação fática apresentada requer análise detalhada das provas. Aplicação do Código de Processo Civil e legislação pertinente.`,
      summary: `Trata-se de ação versando sobre ${tema.title.toLowerCase()}. O tribunal entendeu que ${decisao.toLowerCase()} A decisão baseou-se em precedentes firmados no ano de ${ano}.`
    });
  }
  return cases;
};

// --- 5. EXECUÇÃO ---
const runSeed = async () => {
  try {
    console.log("🔌 Conectando ao MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado!");

    console.log("🗑️  Limpando base antiga...");
    await Jurisprudence.deleteMany({});

    console.log("🏭 Gerando 50 novos processos...");
    const fakeData = generateCases(50);
    await Jurisprudence.insertMany(fakeData);

    console.log("✨ SUCESSO! 50 Processos inseridos no banco.");
    console.log("   Agora sua página de Jurisprudência vai parecer profissional.");
    process.exit();
  } catch (error) {
    console.error("❌ ERRO:", error.message);
    process.exit(1);
  }
};

runSeed();