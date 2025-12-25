const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // Necessário para caminhos de arquivo

// 1. Carregar variáveis de ambiente
dotenv.config(); 

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Rotas
const analyzeRoutes = require('./routes/analyzeRoutes');
const userRoutes = require('./routes/userRoutes');
const jurisprudenceRoutes = require('./routes/jurisprudenceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Conectar ao Banco
connectDB();

const app = express();

// Segurança
app.use(helmet({ 
  contentSecurityPolicy: false, 
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" } // Permite carregar arquivos
}));

// CORS
app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:5173', 
  credentials: true 
}));

// Webhook Stripe (Raw Body) - DEVE vir antes do parser JSON global
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Parser Global
app.use(express.json({ limit: '10kb' }));

// Sanitização
app.use(mongoSanitize());
app.use(xss());

// --- CORREÇÃO CRÍTICA: Servir arquivos estáticos (Uploads) ---
// Isso permite que o frontend baixe os PDFs acessando /uploads/arquivo.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/analyze', analyzeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jurisprudence', jurisprudenceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Tratamento de Erros
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// --- INÍCIO DO BLOCO DE TESTE (Pode apagar depois) ---
const { GoogleGenerativeAI } = require('@google/generative-ai');

app.get('/api/test-ai', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Sem chave API configurada" });

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Lista dos nomes mais prováveis
  const candidates = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro",
    "gemini-1.0-pro"
  ];

  let results = [];

  for (const modelName of candidates) {
    try {
      console.log(`Testando: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      // Tenta gerar um simples "Oi"
      await model.generateContent("Oi");
      results.push({ model: modelName, status: "✅ FUNCIONANDO", message: "Este é o nome correto!" });
    } catch (error) {
      results.push({ model: modelName, status: "❌ FALHOU", error: error.message.split('[')[0] });
    }
  }

  res.json({
    libraryVersion: require('./package.json').dependencies['@google/generative-ai'],
    testResults: results
  });
});
// --- FIM DO BLOCO DE TESTE ---

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});