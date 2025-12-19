// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// Rotas
const analyzeRoutes = require('./routes/analyzeRoutes');
const userRoutes = require('./routes/userRoutes');
// Verifica se o arquivo de rotas de jurisprudência existe antes de importar
// Se der erro aqui, é porque faltou criar o arquivo jurisprudenceRoutes.js
const jurisprudenceRoutes = require('./routes/jurisprudenceRoutes'); 

dotenv.config();
connectDB();

const app = express();

// --- CORREÇÃO DE SEGURANÇA (CORS LIBERADO) ---
// Isso permite que localhost, 127.0.0.1 ou qualquer IP acesse a API.
// Essencial para resolver o "Erro ao Registrar" em desenvolvimento.
app.use(cors()); 

app.use(express.json());

// Servir arquivos estáticos (Uploads)
// Tenta servir da raiz 'uploads' ou de 'config/uploads' para garantir
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'config/uploads')));

// Definição das Rotas
app.use('/api/analyze', analyzeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jurisprudence', jurisprudenceRoutes);

app.get('/', (req, res) => {
  res.send('API Operacional e Liberada.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});