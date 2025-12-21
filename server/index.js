const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Routes
const analyzeRoutes = require('./routes/analyzeRoutes');
const userRoutes = require('./routes/userRoutes');
const jurisprudenceRoutes = require('./routes/jurisprudenceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // Nova Rota

dotenv.config();

// Pre-Flight Check (Validation)
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ FATAL: STRIPE_SECRET_KEY is missing in .env');
  process.exit(1);
}

connectDB();

const app = express();

// 1. SECURITY & CONFIG
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || '*' })); // Restrict in production

// 2. STRIPE WEBHOOK HANDLING (MUST BE BEFORE GLOBAL JSON PARSER)
// We need the raw body specifically for the webhook route to verify signature
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// 3. GLOBAL PARSER (For all other routes)
app.use(express.json({ 
  limit: '10kb',
  verify: (req, res, buf) => {
    // Opcional: guardar rawBody se precisar validar assinaturas em outras rotas JSON
    req.rawBody = buf.toString();
  }
}));

// 4. SANITIZATION & LIMITER
app.use(mongoSanitize());
app.use(xss());
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. API ROUTES
app.use('/api/analyze', analyzeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jurisprudence', jurisprudenceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes); // Mount Payment Routes

// Root
app.get('/', (req, res) => res.status(200).json({ status: 'Operational', mode: process.env.NODE_ENV }));

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});