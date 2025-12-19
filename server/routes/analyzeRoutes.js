const express = require('express');
const router = express.Router();
const upload = require('../config/multer'); // Configuração de upload
const { analyzeDocument, getHistory } = require('../controllers/analyzeController'); // Funções lógicas
const { protect } = require('../middleware/authMiddleware'); // O Segurança

// Rota POST (Upload) - Protegida pelo middleware 'protect'
router.post('/', protect, upload.single('document'), analyzeDocument);

// Rota GET (Histórico) - Também protegida
router.get('/history', protect, getHistory);

module.exports = router;