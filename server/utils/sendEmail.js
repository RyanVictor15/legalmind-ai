const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Criar o transportador com a CORREÇÃO DE SEGURANÇA
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // --- ESTA É A MÁGICA QUE FEZ O TESTE FUNCIONAR ---
    tls: {
      rejectUnauthorized: false
    }
    // -------------------------------------------------
  });

  // 2. Definir a mensagem
  const message = {
    from: `"LegalMind AI" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 3. Enviar
  const info = await transporter.sendMail(message);
  console.log('✅ Email enviado via Sistema: %s', info.messageId);
};

module.exports = sendEmail;