const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');

// Rotas
const userRoutes = require('./routes/userRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const jurisprudenceRoutes = require('./routes/jurisprudenceRoutes'); // Se tiver esta rota

// Configuração
dotenv.config();
const app = express();

// 📍 1. SEGURANÇA: HELMET (Headers HTTP Seguros)
app.use(helmet());

// 📍 2. SEGURANÇA: LIMITADOR DE REQUISIÇÕES (DDoS / Brute Force Protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, por favor tente novamente em 15 minutos.'
});
app.use('/api', limiter);

// Limitador Específico para Login (Mais estrito)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Bloqueia após 10 tentativas falhadas
  message: 'Muitas tentativas de login. Conta bloqueada temporariamente.'
});
app.use('/api/users/login', authLimiter);

// 📍 3. WEBHOOK STRIPE (Precisa do RAW body antes do parser JSON global)
// O middleware do webhook está dentro das rotas, mas o express.raw deve vir aqui se não for tratado lá
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// 📍 4. PARSERS E SANITIZAÇÃO
app.use(express.json({ limit: '10mb' })); // Limite de 10mb para JSON
app.use(cors()); // Habilita Cross-Origin Resource Sharing

// Data Sanitization contra NoSQL Injection (Ex: email: {"$gt": ""})
app.use(mongoSanitize());

// Data Sanitization contra XSS (Cross-Site Scripting)
app.use(xss());

// 📍 5. SERVIR FICHEIROS ESTÁTICOS (Uploads - Opcional se usar S3)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📍 6. ROTAS DA API
app.use('/api/users', userRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/jurisprudence', jurisprudenceRoutes);

// Rota Base
app.get('/', (req, res) => {
  res.send('API LegalMind AI a funcionar com Segurança Máxima 🛡️');
});

// Tratamento de Erros Global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error', 
    message: err.message || 'Erro interno do servidor.' 
  });
});

// 📍 7. CONEXÃO AO BANCO E SERVIDOR
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Conectado');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor a correr na porta ${PORT}`);
      console.log(`🛡️  Modo de Segurança: ATIVADO`);
    });
  })
  .catch((err) => console.log('❌ Erro MongoDB:', err));