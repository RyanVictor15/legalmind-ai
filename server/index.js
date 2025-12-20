// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// --- SEGURANÇA ---
const helmet = require('helmet');
const rateLimit = require('express-rate-limit'); // <--- ITEM 4.2
// ----------------

// Rotas
const analyzeRoutes = require('./routes/analyzeRoutes');
const userRoutes = require('./routes/userRoutes');
const jurisprudenceRoutes = require('./routes/jurisprudenceRoutes');
// const adminRoutes = require('./routes/adminRoutes'); // Descomente se criou

dotenv.config();
connectDB();

const app = express();

// 1. HELMET (Headers de Segurança)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// 2. RATE LIMITING (ITEM 4.2)
// Define a regra: Máximo de 100 requisições a cada 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 chamadas
  message: {
    message: 'Muitas requisições criadas a partir deste IP, por favor tente novamente após 15 minutos.'
  },
  standardHeaders: true, // Retorna info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
});

// Aplica o limitador apenas nas rotas da API (deixa arquivos estáticos livres)
app.use('/api', limiter);

// 3. CORS
app.use(cors()); 

app.use(express.json());

// Arquivos Estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'config/uploads')));

// Rotas
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