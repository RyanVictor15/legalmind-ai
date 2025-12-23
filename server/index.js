const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv'); // 1. Importar primeiro
const path = require('path');

// 2. CRÍTICO: Carregar variáveis ANTES de importar qualquer rota ou controller
dotenv.config(); 

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Routes (Agora é seguro importar, pois process.env já existe)
const analyzeRoutes = require('./routes/analyzeRoutes');
const userRoutes = require('./routes/userRoutes');
const jurisprudenceRoutes = require('./routes/jurisprudenceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Connect to Database
connectDB();

const app = express();

// Security & Config
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// Strict CORS
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:5173', 
  credentials: true 
}));

// Stripe Webhook (Raw Body)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Global Parser
app.use(express.json({ limit: '10kb' }));

// Sanitization
app.use(mongoSanitize());
app.use(xss());

// Routes Mount
app.use('/api/analyze', analyzeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jurisprudence', jurisprudenceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Export app for testing, only listen if not testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;