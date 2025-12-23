const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Jurisprudence = require('../models/Jurisprudence');

// Ajuste o caminho do .env conforme necessário
dotenv.config({ path: './.env' }); 

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`🔌 MongoDB Conectado: ${conn.connection.host}`);

    // Limpar dados antigos
    await Jurisprudence.deleteMany();
    console.log('🧹 Coleção limpa.');

    const courts = ['STJ', 'STF', 'TJSP', 'TJRJ', 'TJMG', 'TRT-2'];
    const areas = ['Cível', 'Penal', 'Trabalhista', 'Tributário', 'Consumidor', 'Família'];
    const temas = [
        'Dano Moral em Voo', 'Divórcio Litigioso', 'Inscrição Indevida Serasa', 
        'Erro Médico', 'Horas Extras', 'Isenção de Imposto de Renda',
        'Guarda Compartilhada', 'Fraude Bancária', 'Usucapião Extrajudicial'
    ];

    const cases = [];

    // Gerar 50 casos variados
    for (let i = 0; i < 50; i++) {
        const court = courts[Math.floor(Math.random() * courts.length)];
        const area = areas[Math.floor(Math.random() * areas.length)];
        const tema = temas[Math.floor(Math.random() * temas.length)];
        const ano = Math.floor(Math.random() * (2024 - 2018) + 2018);
        
        cases.push({
            court: court,
            processNumber: `${Math.floor(Math.random() * 9000000)}-${Math.floor(Math.random() * 90)}.${ano}.8.26.0000`,
            area: area,
            date: new Date(`${ano}-${Math.floor(Math.random() * 12 + 1)}-15`),
            tags: [tema.split(' ')[0], area, 'Recurso'],
            summary: `DECISÃO DE ${court}. ${tema.toUpperCase()}. AÇÃO DE ${area.toUpperCase()}. Entendimento consolidado de que a situação fática apresentada configura o direito pleiteado. Precedentes citados. Recurso ${Math.random() > 0.5 ? 'PROVIDO' : 'DESPROVIDO'} para ${Math.random() > 0.5 ? 'reformar' : 'manter'} a sentença de primeiro grau.`
        });
    }

    await Jurisprudence.insertMany(cases);
    console.log('✅ 50 Casos de Jurisprudência inseridos com sucesso!');
    process.exit();

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

seedDB();