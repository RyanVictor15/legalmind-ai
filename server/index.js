const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
const passport = require('passport');
const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

// Workers e Rotas
require('./workers/analyzeWorker');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const jurisprudenceRoutes = require('./routes/jurisprudenceRoutes');
const authRoutes = require('./routes/authRoutes');
const organizationRoutes = require('./routes/organizationRoutes');

dotenv.config();

// Se a configuração do passport existir, carregue-a. Se não, pule (para evitar erro sem chaves)
try {
  if (process.env.GOOGLE_CLIENT_ID) {
    require('./config/passport');
  }
} catch (e) {
  console.log('Passport config skipped');
}

const app = express();

// 📍 CORREÇÃO 1: CONFIAR NO PROXY DO RENDER
// Isso garante que o Rate Limit pegue o IP real do usuário, não do Render
app.set('trust proxy', 1);

// 📍 CORREÇÃO 2: SENTRY (Sintaxe V8+)
// Se não tiver DSN, não inicializa para não quebrar
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // Sintaxe nova (substitui new Sentry.Integrations.Http)
      Sentry.httpIntegration(),
      Sentry.expressIntegration({ app }),
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });

  // Middleware de Requisição do Sentry
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// 1. LIMITADOR GLOBAL (DDoS Protection)
// Definido inline aqui ou importado, mas precisa estar após o 'trust proxy'
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false } // Desativa a validação estrita que causou o erro
});

// Middlewares Globais
app.use(globalLimiter);

// Webhook Stripe (Precisa ser Raw)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(cors()); // Em produção, configure a origin corretamente depois
app.use(mongoSanitize());
app.use(xss());
app.use(passport.initialize());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexão DB
const connectDB = require('./config/db');
connectDB();

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/jurisprudence', jurisprudenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => res.send('API LegalMind AI Online 🛡️'));

// 📍 SENTRY: ERROR HANDLER (Se estiver ativo)
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Tratamento de Erro Padrão
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;