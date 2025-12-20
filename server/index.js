// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// --- SEGURANÇA ---
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize'); // NOVO: Item 4.4
const xss = require('xss-clean'); // NOVO: Item 4.4
// ----------------

// Rotas
const analyzeRoutes = require('./routes/analyzeRoutes');
const userRoutes = require('./routes/userRoutes');
const jurisprudenceRoutes = require('./routes/jurisprudenceRoutes');
// const adminRoutes = require('./routes/adminRoutes'); // Descomente se usar

dotenv.config();
connectDB();

const app = express();

// 1. HELMET (Headers de Segurança HTTP)
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitado para evitar conflitos no MVP
  crossOriginEmbedderPolicy: false
}));

// 2. RATE LIMITING (Proteção contra força bruta/DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: {
    message: 'Muitas requisições criadas a partir deste IP, por favor tente novamente após 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// 3. CORS
app.use(cors()); 

// 4. PARSER (Transforma o corpo da req em JSON)
// Importante: A sanitização precisa vir DEPOIS disso
app.use(express.json({ limit: '10kb' })); // Limite de 10kb para evitar travamento com JSON gigante

// 5. SANITIZAÇÃO (Item 4.4 - A Blindagem Real)
// Previne injeção de NoSQL (remove caracteres $ e .)
app.use(mongoSanitize());

// Previne XSS (remove tags <script> maliciosas do body, query e params)
app.use(xss());

// Arquivos Estáticos (Uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/analyze', analyzeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jurisprudence', jurisprudenceRoutes);
// app.use('/api/admin', adminRoutes); 

app.get('/', (req, res) => {
  res.send('API LegalMind AI - Segura e Limitada 🛡️');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});