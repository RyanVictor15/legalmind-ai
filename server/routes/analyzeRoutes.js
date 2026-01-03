const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiters');
const { analyzeDocument, getAnalysisResult } = require('../controllers/analyzeController');

// Precisamos do Multer para processar o upload do arquivo
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limite
});

// 1. Rota de Upload (POST /api/analyze)
// Usa: Proteção de Login -> Limite de IA -> Processamento do Arquivo -> Controller
router.post('/', 
  protect, 
  aiLimiter, 
  upload.single('file'), 
  analyzeDocument
);

// 2. Rota de Resultado (GET /api/analyze/:id)
// Usa: Proteção de Login -> Controller
router.get('/:id', 
  protect, 
  getAnalysisResult
);

module.exports = router;