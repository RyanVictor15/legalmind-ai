const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
//const passport = require('passport');
const Sentry = require('@sentry/node'); // 📍 SENTRY
const { nodeProfilingIntegration } = require('@sentry/profiling-node'); // 📍 SENTRY

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
//require('./config/passport');

const app = express();

// 📍 1. SENTRY: INICIALIZAÇÃO (Deve vir antes de tudo)
Sentry.init({
  dsn: process.env.SENTRY_DSN, // Pegar no painel do Sentry
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0, // Em produção, diminua para 0.1 ou 0.2
  profilesSampleRate: 1.0,
});

// 📍 2. SENTRY: REQUEST HANDLER (Primeiro Middleware Real)
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Segurança e Middleware Padrão
app.use(helmet());

// Limitadores (Importados da sua config)
const { globalLimiter, authLimiter } = require('./middleware/rateLimiters');
app.use('/api', globalLimiter);
app.use('/api/users/login', authLimiter);

// Webhook Stripe
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Parsers Globais
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(mongoSanitize());
app.use(xss());
//app.use(passport.initialize());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use('/api/users', userRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/jurisprudence', jurisprudenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/organizations', organizationRoutes);
//app.use('/auth', authRoutes);

app.get('/', (req, res) => res.send('API LegalMind AI Online 🛡️'));

// 📍 3. SENTRY: ERROR HANDLER (Deve vir ANTES de qualquer outro tratador de erro)
app.use(Sentry.Handlers.errorHandler());

// Tratamento de Erro Padrão (Fallback)
app.use((err, req, res, next) => {
  // O Sentry já capturou o erro acima, aqui nós só respondemos ao usuário
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error', 
    message: 'Erro interno do servidor. O suporte foi notificado.' 
  });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Conectado');
    app.listen(PORT, () => console.log(`🚀 Servidor na porta ${PORT}`));
  })
  .catch((err) => console.log('❌ Erro MongoDB:', err));