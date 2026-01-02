const { Resend } = require('resend');
const dotenv = require('dotenv');

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Configuração de Remetente (Use 'onboarding@resend.dev' para testes se não tiver domínio)
const FROM_EMAIL = process.env.EMAIL_FROM || 'LegalMind AI <onboarding@resend.dev>';

// TEMPLATE: BOAS-VINDAS
const getWelcomeTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; background-color: #f8fafc; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
    .btn { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
    .footer { margin-top: 30px; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #0f172a; margin: 0;">Bem-vindo ao LegalMind AI! ⚖️</h1>
    </div>
    <p>Olá, <strong>${name}</strong>!</p>
    <p>Estamos muito felizes em ter você conosco. O LegalMind foi criado para devolver horas preciosas do seu dia, automatizando a leitura complexa de processos.</p>
    
    <h3>O que você pode fazer agora:</h3>
    <ul>
      <li>📄 Fazer upload de PDFs de até 50MB.</li>
      <li>🧠 Obter resumos jurídicos e análises de risco em segundos.</li>
      <li>🔎 Pesquisar jurisprudência atualizada.</li>
    </ul>

    <div style="text-align: center;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">Acessar Meu Dashboard</a>
    </div>

    <p style="margin-top: 30px;">Se tiver qualquer dúvida, responda a este email. Estamos aqui para ajudar.</p>
    
    <div class="footer">
      © ${new Date().getFullYear()} LegalMind AI. Todos os direitos reservados.
    </div>
  </div>
</body>
</html>
`;

// TEMPLATE: ANÁLISE PRONTA
const getAnalysisReadyTemplate = (name, filename) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; background-color: #f8fafc; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; border-left: 5px solid #10b981; }
    .btn { color: #2563eb; font-weight: bold; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Análise Concluída ✅</h2>
    <p>Olá, ${name}.</p>
    <p>A inteligência artificial finalizou a leitura do documento: <strong>${filename}</strong>.</p>
    <p>O relatório completo de riscos e veredito já está disponível no seu painel.</p>
    <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/history" class="btn">Ver Relatório Agora &rarr;</a></p>
  </div>
</body>
</html>
`;

// --- FUNÇÕES DE ENVIO ---

const sendWelcomeEmail = async (email, name) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY não configurada. Email de boas-vindas ignorado.");
    return;
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Bem-vindo ao futuro da advocacia ⚖️',
      html: getWelcomeTemplate(name)
    });
    console.log(`📧 Email de boas-vindas enviado para ${email} (ID: ${data.id})`);
    return data;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
  }
};

const sendAnalysisNotification = async (email, name, filename) => {
  if (!process.env.RESEND_API_KEY) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Análise Concluída: ${filename}`,
      html: getAnalysisReadyTemplate(name, filename)
    });
    console.log(`📧 Notificação de análise enviada para ${email}`);
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);
  }
};

module.exports = { sendWelcomeEmail, sendAnalysisNotification };