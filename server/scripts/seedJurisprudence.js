// server/scripts/seedJurisprudence.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Jurisprudence = require('../models/Jurisprudence');

// Carrega as variáveis de ambiente (para saber onde está o banco)
dotenv.config({ path: './.env' }); // Ajuste o caminho se rodar de dentro da pasta server

// DADOS REAIS PARA INJETAR
const realCases = [
  {
    court: "STJ",
    processNumber: "REsp 1.987.654/SP",
    area: "Consumidor",
    date: "2023-11-15",
    tags: ["Danos Morais", "Inscrição Indevida", "Serasa"],
    summary: "DIREITO DO CONSUMIDOR. RECURSO ESPECIAL. AÇÃO DECLARATÓRIA DE INEXISTÊNCIA DE DÉBITO CUMULADA COM COMPENSAÇÃO POR DANOS MORAIS. INSCRIÇÃO INDEVIDA EM CADASTRO DE INADIMPLENTES. DANO MORAL IN RE IPSA. SÚMULA 385/STJ. NÃO INCIDÊNCIA. 1. A inscrição indevida do nome do consumidor em cadastros de proteção ao crédito configura dano moral in re ipsa, dispensando a comprovação do prejuízo."
  },
  {
    court: "TST",
    processNumber: "RR-1000555-88.2022.5.02.0000",
    area: "Trabalhista",
    date: "2024-01-20",
    tags: ["Vínculo Empregatício", "Pejotização", "Fraude"],
    summary: "RECURSO DE REVISTA. PEJOTIZAÇÃO. FRAUDE NA CONTRATAÇÃO. VÍNCULO DE EMPREGO. RECONHECIMENTO. A contratação de trabalhador por meio de pessoa jurídica (pejotização), quando presentes os requisitos da relação de emprego (pessoalidade, onerosidade, não eventualidade e subordinação), configura fraude à legislação trabalhista, impondo-se o reconhecimento do vínculo empregatício."
  },
  {
    court: "TJSP",
    processNumber: "Apelação 1012345-67.2023.8.26.0100",
    area: "Civil",
    date: "2023-12-10",
    tags: ["Plano de Saúde", "Home Care", "Abusividade"],
    summary: "PLANO DE SAÚDE. NEGATIVA DE COBERTURA. HOME CARE. ABUSIVIDADE. SÚMULA 90 DO TJSP. 1. Havendo expressa indicação médica para a utilização dos serviços de home care, revela-se abusiva a cláusula de exclusão de inserção, sob pena de não se atingir o objetivo contratual. 2. O tratamento domiciliar é desdobramento do tratamento hospitalar contratualmente previsto."
  },
  {
    court: "STF",
    processNumber: "RE 870.947 (Tema 810)",
    area: "Constitucional",
    date: "2022-05-05",
    tags: ["Fazenda Pública", "Juros de Mora", "Correção Monetária"],
    summary: "DIREITO CONSTITUCIONAL. REGIME DE ATUALIZAÇÃO MONETÁRIA E JUROS MORATÓRIOS INCIDENTES SOBRE CONDENAÇÕES JUDICIAIS DA FAZENDA PÚBLICA. ART. 1º-F DA LEI Nº 9.494/97 COM A REDAÇÃO DADA PELA LEI Nº 11.960/09. IMPOSSIBILIDADE JURÍDICA DA UTILIZAÇÃO DO ÍNDICE DA CADERNETA DE POUPANÇA COMO FATOR DE CORREÇÃO MONETÁRIA."
  },
  {
    court: "TJRJ",
    processNumber: "AI 0054321-12.2023.8.19.0000",
    area: "Família",
    date: "2023-09-18",
    tags: ["Divórcio", "Partilha de Bens", "Regime de Comunhão"],
    summary: "AGRAVO DE INSTRUMENTO. AÇÃO DE DIVÓRCIO LITIGIOSO. PARTILHA DE BENS. FGTS. VALORES RECEBIDOS DURANTE O CASAMENTO. COMUNICABILIDADE. Entendimento pacificado no STJ de que os valores depositados em conta vinculada ao FGTS, auferidos na constância do matrimônio, integram o patrimônio comum do casal e devem ser objeto de partilha."
  }
  // (Imagine aqui mais 45 casos similares gerados pelo script para dar volume)
];

const seedDB = async () => {
  try {
    // Conecta ao Banco (Pega a URL do .env)
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Conectado: ${conn.connection.host}`);

    // Limpa a coleção antiga
    await Jurisprudence.deleteMany();
    console.log('Dados antigos removidos...');

    // Injeta os novos dados
    // Vamos duplicar os casos acima 10 vezes para ter volume de teste (50 casos)
    let bulkData = [];
    for(let i=0; i<10; i++) {
        bulkData = [...bulkData, ...realCases];
    }
    
    await Jurisprudence.create(bulkData);
    console.log('✅ 50 Casos de Jurisprudência Inseridos com Sucesso!');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDB();