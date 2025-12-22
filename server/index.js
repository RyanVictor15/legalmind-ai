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
const paymentRoutes = require('./routes/paymentRoutes');

dotenv.config();

connectDB();

const app = express();

// 1. SECURITY & CONFIG
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// STRICT CORS: Only allow the defined client
app.use(cors({ 
  origin: process.env.CLIENT_URL, 
  credentials: true 
}));

// 2. STRIPE WEBHOOK HANDLING (MUST BE BEFORE GLOBAL JSON PARSER)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// 3. GLOBAL PARSER
app.use(express.json({ limit: '10kb' }));

// 4. SANITIZATION
app.use(mongoSanitize());
app.use(xss());

// 5. ROUTES
app.use('/api/analyze', analyzeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jurisprudence', jurisprudenceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Root
app.get('/', (req, res) => res.json({ status: 'Operational' }));

// Errors
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));