// server/scripts/makeAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: './.env' }); // Lê o .env da pasta server

// DIGITE AQUI O EMAIL QUE VOCÊ USA NO SISTEMA
const TARGET_EMAIL = "ryanvictor1517@gmail.com"; 

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado ao Banco...");

    const user = await User.findOne({ email: TARGET_EMAIL });

    if (!user) {
      console.log(`❌ Usuário ${TARGET_EMAIL} não encontrado! Verifique o email.`);
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();

    console.log(`✅ SUCESSO! O usuário ${user.firstName} agora é ADMINISTRADOR.`);
    process.exit();
  } catch (error) {
    console.error("Erro:", error);
    process.exit(1);
  }
};

makeAdmin();