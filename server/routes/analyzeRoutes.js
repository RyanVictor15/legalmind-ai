// server/routes/analyzeRoutes.js
const express = require('express');
const router = express.Router();
const analyzeController = require('../controllers/analyzeController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// GARANTIA: Cria a pasta uploads se ela não existir via código
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// CONFIGURAÇÃO DEFINITIVA: Armazenamento em Disco (DiskStorage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Salva na pasta server/uploads
  },
  filename: function (req, file, cb) {
    // Gera nome único: data-nomeoriginal
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ROTAS
router.post('/', protect, upload.single('document'), analyzeController.analyzeDocument);
router.get('/history', protect, analyzeController.getHistory);

module.exports = router;