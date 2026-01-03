const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
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

// Passport Config (Só carrega se tiver chaves)
try {
  if (process.env.GOOGLE_CLIENT_ID) {
    require('./config/passport');
  }
} catch (e) { console.log('Passport config skipped'); }

const app = express();

// 1. INICIALIZAÇÃO DO SENTRY (Versão 8+)
// Precisa ser antes de tudo
if (process.env.SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
    });
  } catch (e) {
    console.log("Sentry init skipped due to version mismatch");
  }
}

// 2. CONFIGURAÇÕES DE SEGURANÇA E PROXY
app.set('trust proxy', 1);

// Limitador Global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false } // Impede erro de IPv6 no Render
});

app.use(globalLimiter);

// Webhook Stripe
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Parsers e Segurança
app.use(express.json({ limit: '10mb' }));
app.use(cors()); 
app.use(mongoSanitize());
app.use(xss());
app.use(passport.initialize());

// Arquivos Estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexão DB
const connectDB = require('./config/db');
connectDB();

// 3. ROTAS
app.use('/api/users', userRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/jurisprudence', jurisprudenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => res.send('API LegalMind AI Online 🛡️'));

// 4. ERROR HANDLER DO SENTRY (Versão 8+)
if (process.env.SENTRY_DSN) {
  try {
    Sentry.setupExpressErrorHandler(app);
  } catch (error) {
    // Se falhar a função nova, ignora silenciosamente para não derrubar o server
    console.log("Sentry error handler setup skipped");
  }
}

// 5. ERROR HANDLER PADRÃO
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