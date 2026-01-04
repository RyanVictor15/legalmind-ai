const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiters');
const { analyzeDocument, getAnalysisResult, getHistory } = require('../controllers/analyzeController');

const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } 
});

// 1. Rota de Histórico (IMPORTANTE: Deve vir ANTES do /:id)
router.get('/history', protect, getHistory);

// 2. Upload
router.post('/', protect, aiLimiter, upload.single('file'), analyzeDocument);

// 3. Resultado Específico
router.get('/:id', protect, getAnalysisResult);

module.exports = router;