// server/test-email.js

// 1. O MESMO FIX QUE SALVOU A IA (Desliga verificação de SSL)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testarEnvio() {
    console.log("1. Iniciando teste de e-mail...");
    console.log(`   User: ${process.env.EMAIL_USER}`);
    // Não mostramos a senha inteira, só o tamanho para conferir
    console.log(`   Senha: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length + ' caracteres' : 'NÃO ENCONTRADA'}`);

    // Configuração com o FIX de segurança para o seu PC
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // --- AQUI ESTÁ O SEGREDO ---
        tls: {
            rejectUnauthorized: false
        }
        // ---------------------------
    });

    try {
        console.log("2. Tentando conectar com o Gmail...");
        
        const info = await transporter.sendMail({
            from: `"Teste LegalMind" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Manda para você mesmo
            subject: "Teste de Conexão - LegalMind",
            text: "Se você recebeu isso, o sistema de e-mail está funcionando!",
        });

        console.log("✅ SUCESSO TOTAL!");
        console.log("ID da Mensagem:", info.messageId);
        console.log("Verifique sua caixa de entrada agora.");

    } catch (error) {
        console.error("❌ FALHA NO ENVIO:");
        console.error(error);
    }
}

testarEnvio();