const express = require('express');
const router = express.Router();
const { analyzeDocument, getHistory } = require('../controllers/analyzeController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiters'); // 📍 Importar Limitador IA

// Rota de Análise (Protegida + Limitada)
// Ordem importa: 1. Protege (Identifica User) -> 2. Limita (Verifica Cota) -> 3. Controller
router.post('/', protect, aiLimiter, analyzeDocument);

// Rota de Histórico (Apenas Protegida)
router.get('/history', protect, getHistory);

module.exports = router;