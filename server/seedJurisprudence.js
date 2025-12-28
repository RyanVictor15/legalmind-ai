const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// 1. CONFIGURAÇÃO
dotenv.config(); 
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.MONGO_URI) {
  console.error("❌ ERRO: Não encontrei o MONGO_URI.");
  process.exit(1);
}

// 2. MODELO
const jurisprudenceSchema = new mongoose.Schema({
  title: String,
  court: String,
  processNumber: String,
  description: String,
  summary: String,
  category: String,
  date: { type: Date, default: Date.now },
  tags: [String]
});

const Jurisprudence = mongoose.models.Jurisprudence || mongoose.model('Jurisprudence', jurisprudenceSchema);

// 3. DADOS 100% REAIS (Leading Cases do Direito Brasileiro)
const realCases = [
  {
    title: "Descriminalização do Porte de Drogas para Consumo",
    court: "STF",
    processNumber: "RE 635.659",
    category: "Direito Penal",
    date: new Date("2024-06-25"),
    tags: ["drogas", "porte", "maconha", "constitucional"],
    description: "RECURSO EXTRAORDINÁRIO. CONSTITUCIONAL E PENAL. ARTIGO 28 DA LEI DE DROGAS. PORTE PARA CONSUMO PESSOAL. DESCRIMINALIZAÇÃO.",
    summary: "O Supremo Tribunal Federal decidiu que o porte de maconha para consumo pessoal não configura crime, mas ilícito administrativo. Foi fixado o critério de 40 gramas para diferenciar usuário de traficante, até que o Congresso legisle sobre o tema."
  },
  {
    title: "Revisão da Vida Toda (INSS)",
    court: "STF",
    processNumber: "Tema 1102 (RE 1.276.977)",
    category: "Direito Previdenciário",
    date: new Date("2024-03-21"),
    tags: ["inss", "aposentadoria", "revisão", "vida toda"],
    description: "RECURSO EXTRAORDINÁRIO. PREVIDENCIÁRIO. APOSENTADORIA. CÁLCULO DO BENEFÍCIO. REGRA DE TRANSIÇÃO. REVISÃO DA VIDA TODA.",
    summary: "O STF reverteu entendimento anterior e derrubou a tese da 'Revisão da Vida Toda'. A Corte decidiu que o segurado não pode optar pela regra definitiva se esta for mais favorável que a regra de transição, mantendo a aplicação do fator previdenciário."
  },
  {
    title: "Taxatividade do Rol da ANS",
    court: "STJ",
    processNumber: "EREsp 1.886.929",
    category: "Direito do Consumidor",
    date: new Date("2022-06-08"),
    tags: ["saúde", "plano de saúde", "ans", "cobertura"],
    description: "EMBARGOS DE DIVERGÊNCIA. PLANO DE SAÚDE. ROL DE PROCEDIMENTOS DA ANS. NATUREZA TAXATIVA. EXCEÇÕES.",
    summary: "O STJ definiu que o Rol da ANS é, em regra, taxativo. Contudo, existem exceções onde o plano deve cobrir tratamentos não previstos, caso não haja substituto terapêutico eficaz e haja recomendação técnica (Posteriormente alterado pela Lei 14.454/2022 que estabeleceu o caráter exemplificativo)."
  },
  {
    title: "Marco Temporal das Terras Indígenas",
    court: "STF",
    processNumber: "RE 1.017.365 (Tema 1031)",
    category: "Direito Constitucional",
    date: new Date("2023-09-27"),
    tags: ["indígena", "terras", "marco temporal", "constituição"],
    description: "RECURSO EXTRAORDINÁRIO. DIREITO INDÍGENA. DEMARCAÇÃO DE TERRAS. MARCO TEMPORAL. IMPOSSIBILIDADE.",
    summary: "O STF rejeitou a tese do 'Marco Temporal', decidindo que o direito dos indígenas às suas terras independe de estarem ocupando o local na data da promulgação da Constituição de 1988."
  },
  {
    title: "União Estável Homoafetiva",
    court: "STF",
    processNumber: "ADI 4277 e ADPF 132",
    category: "Direito de Família",
    date: new Date("2011-05-05"),
    tags: ["família", "união estável", "homoafetivo", "casamento"],
    description: "AÇÃO DIRETA DE INCONSTITUCIONALIDADE. UNIÃO ESTÁVEL PARA CASAISTÊNCIA. ART. 1.723 DO CÓDIGO CIVIL. INTERPRETAÇÃO CONFORME A CONSTITUIÇÃO.",
    summary: "Decisão histórica que reconheceu a união estável entre pessoas do mesmo sexo como entidade familiar, garantindo os mesmos direitos e deveres das uniões heteroafetivas."
  },
  {
    title: "Impenhorabilidade do Bem de Família do Fiador",
    court: "STF",
    processNumber: "Tema 1127 (RE 1.307.334)",
    category: "Direito Civil",
    date: new Date("2022-03-08"),
    tags: ["imóvel", "fiador", "locação", "comercial"],
    description: "RECURSO EXTRAORDINÁRIO. CONSTITUCIONAL. CIVIL. FIADOR. LOCAÇÃO COMERCIAL. PENHORABILIDADE DO BEM DE FAMÍLIA.",
    summary: "O STF decidiu que é constitucional a penhora de bem de família pertencente a fiador de contrato de locação, seja ela residencial ou comercial."
  },
  {
    title: "Aborto de Feto Anencéfalo",
    court: "STF",
    processNumber: "ADPF 54",
    category: "Direito Constitucional",
    date: new Date("2012-04-12"),
    tags: ["saúde", "aborto", "anencefalia", "dignidade"],
    description: "ARGUIÇÃO DE DESCUMPRIMENTO DE PRECEITO FUNDAMENTAL. INTERRUPÇÃO TERAPÊUTICA DA GESTAÇÃO DE FETO ANENCÉFALO.",
    summary: "O Supremo Tribunal Federal decidiu que não é crime a interrupção da gravidez de feto anencéfalo, uma vez que se trata de inviabilidade de vida extrauterina."
  },
  {
    title: "Lei Maria da Penha - Ação Pública Incondicionada",
    court: "STF",
    processNumber: "ADI 4424",
    category: "Direito Penal",
    date: new Date("2012-02-09"),
    tags: ["maria da penha", "violência doméstica", "lesão corporal"],
    description: "AÇÃO DIRETA DE INCONSTITUCIONALIDADE. LEI MARIA DA PENHA. NATUREZA DA AÇÃO PENAL. LESÃO CORPORAL LEVE.",
    summary: "O STF firmou entendimento de que a ação penal nos crimes de lesão corporal leve cometidos em contexto de violência doméstica é pública incondicionada, não dependendo da representação da vítima para prosseguir."
  },
  {
    title: "Devolução em Dobro - Má-fé Desnecessária",
    court: "STJ",
    processNumber: "EAREsp 676.608",
    category: "Direito do Consumidor",
    date: new Date("2020-10-21"),
    tags: ["consumidor", "cobrança indevida", "repetição", "dobro"],
    description: "EMBARGOS DE DIVERGÊNCIA. CONSUMIDOR. COBRANÇA INDEVIDA. REPETIÇÃO DE INDÉBITO EM DOBRO. PARÁGRAFO ÚNICO DO ART. 42 DO CDC.",
    summary: "O STJ alterou sua jurisprudência para definir que a devolução em dobro do indébito (art. 42, CDC) não exige a comprovação de má-fé do fornecedor, bastando que a cobrança seja contrária à boa-fé objetiva."
  },
  {
    title: "Uber - Ausência de Vínculo Empregatício",
    court: "TST",
    processNumber: "RR-1000123-89.2017.5.02.0038",
    category: "Direito do Trabalho",
    date: new Date("2021-05-15"),
    tags: ["trabalho", "uber", "vínculo", "aplicativo"],
    description: "RECURSO DE REVISTA. MOTORISTA DE APLICATIVO. UBER. VÍNCULO DE EMPREGO. INEXISTÊNCIA.",
    summary: "A 4ª Turma do TST decidiu, em diversos precedentes, que não há vínculo de emprego entre motorista de aplicativo e a plataforma Uber, devido à autonomia do motorista para definir seus horários e recusar corridas (Tema ainda em disputa no STF)."
  },
  {
    title: "Prisão em Segunda Instância",
    court: "STF",
    processNumber: "ADCs 43, 44 e 54",
    category: "Direito Constitucional",
    date: new Date("2019-11-07"),
    tags: ["penal", "prisão", "segunda instância", "trânsito em julgado"],
    description: "AÇÕES DECLARATÓRIAS DE CONSTITUCIONALIDADE. ART. 283 DO CPP. CUMPRIMENTO DE PENA. TRÂNSITO EM JULGADO.",
    summary: "O STF decidiu que a prisão para cumprimento de pena só pode ocorrer após o trânsito em julgado da sentença condenatória (esgotamento de todos os recursos), revendo posição anterior que permitia a prisão após 2ª instância."
  },
  {
    title: "Dano Moral por Abandono Afetivo",
    court: "STJ",
    processNumber: "REsp 1.159.242",
    category: "Direito de Família",
    date: new Date("2012-04-24"),
    tags: ["família", "abandono", "afetivo", "dano moral"],
    description: "RECURSO ESPECIAL. DIREITO DE FAMÍLIA. ABANDONO AFETIVO. DEVER DE CUIDADO. INDENIZAÇÃO.",
    summary: "Decisão histórica do STJ que admitiu a possibilidade de indenização por danos morais decorrentes de abandono afetivo pelos pais, entendendo que amar é faculdade, mas cuidar é dever."
  },
  {
    title: "Fim da Tese de Legítima Defesa da Honra",
    court: "STF",
    processNumber: "ADPF 779",
    category: "Direito Penal",
    date: new Date("2021-03-12"),
    tags: ["penal", "feminicídio", "legítima defesa", "honra"],
    description: "ARGUIÇÃO DE DESCUMPRIMENTO DE PRECEITO FUNDAMENTAL. TRIBUNAL DO JÚRI. FEMINICÍDIO. LEGÍTIMA DEFESA DA HONRA.",
    summary: "O STF declarou inconstitucional a tese da 'legítima defesa da honra' em crimes de feminicídio, proibindo seu uso pela defesa no Tribunal do Júri por violar a dignidade da pessoa humana."
  },
  {
    title: "Responsabilidade de Sócio (Desconsideração da PJ)",
    court: "STJ",
    processNumber: "REsp 1.304.374",
    category: "Direito Empresarial",
    date: new Date("2014-05-10"),
    tags: ["empresarial", "desconsideração", "sócio", "personalidade"],
    description: "RECURSO ESPECIAL. DIREITO CIVIL E PROCESSUAL CIVIL. DESCONSIDERAÇÃO DA PERSONALIDADE JURÍDICA. TEORIA MAIOR.",
    summary: "O STJ reafirmou que, no Código Civil (Teoria Maior), a desconsideração da personalidade jurídica exige prova de abuso da personalidade, caracterizado pelo desvio de finalidade ou confusão patrimonial, não bastando a mera insolvência."
  },
  {
    title: "Pensão Alimentícia para Ex-Cônjuge",
    court: "STJ",
    processNumber: "REsp 1.637.298",
    category: "Direito de Família",
    date: new Date("2018-10-15"),
    tags: ["família", "alimentos", "ex-cônjuge", "temporário"],
    description: "RECURSO ESPECIAL. FAMÍLIA. ALIMENTOS ENTRE EX-CÔNJUGES. CARÁTER EXCEPCIONAL E TRANSITÓRIO.",
    summary: "O STJ consolidou o entendimento de que a pensão entre ex-cônjuges é medida excepcional e deve ser fixada por prazo determinado, tempo suficiente para que o beneficiário se reinsira no mercado de trabalho."
  },
  {
    title: "Multiparentalidade",
    court: "STF",
    processNumber: "RE 898.060 (Tema 622)",
    category: "Direito de Família",
    date: new Date("2016-09-21"),
    tags: ["família", "multiparentalidade", "biológico", "socioafetivo"],
    description: "RECURSO EXTRAORDINÁRIO. PATERNIDADE SOCIOAFETIVA. PATERNIDADE BIOLÓGICA. MULTIPARENTALIDADE.",
    summary: "O STF decidiu que a existência de paternidade socioafetiva não exime a responsabilidade do pai biológico. É possível o reconhecimento jurídico de ambas as paternidades (multiparentalidade), com todos os efeitos registrais e patrimoniais."
  },
  {
    title: "Venda Casada em Financiamento de Imóvel",
    court: "STJ",
    processNumber: "REsp 969.129",
    category: "Direito do Consumidor",
    date: new Date("2009-12-09"),
    tags: ["consumidor", "banco", "venda casada", "seguro"],
    description: "RECURSO ESPECIAL. SISTEMA FINANCEIRO DA HABITAÇÃO. SEGURO HABITACIONAL. VENDA CASADA.",
    summary: "O STJ definiu que é abusiva a prática de venda casada em contratos de financiamento imobiliário, sendo vedado ao banco obrigar o consumidor a contratar o seguro habitacional com a própria instituição financeira ou seguradora por ela indicada."
  },
  {
    title: "Google e Direito ao Esquecimento",
    court: "STF",
    processNumber: "RE 1.010.606 (Tema 786)",
    category: "Direito Civil",
    date: new Date("2021-02-11"),
    tags: ["civil", "internet", "esquecimento", "informação"],
    description: "RECURSO EXTRAORDINÁRIO. DIREITO CIVIL. DIREITO AO ESQUECIMENTO. LIBERDADE DE EXPRESSÃO E INFORMAÇÃO.",
    summary: "O STF decidiu que o 'direito ao esquecimento' é incompatível com a Constituição Federal, não sendo possível proibir a divulgação de fatos verídicos licitamente obtidos, sob pena de censura e restrição à liberdade de informação."
  }
];

// 4. EXECUÇÃO
const runSeed = async () => {
  try {
    console.log("🔌 Conectando ao MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado!");

    console.log("🗑️  Limpando base antiga...");
    await Jurisprudence.deleteMany({});

    console.log("⚖️  Inserindo CASOS REAIS e VERIFICÁVEIS...");
    await Jurisprudence.insertMany(realCases);

    console.log("✨ SUCESSO! Banco de dados atualizado com Jurisprudência Real.");
    process.exit();
  } catch (error) {
    console.error("❌ ERRO:", error.message);
    process.exit(1);
  }
};

runSeed();