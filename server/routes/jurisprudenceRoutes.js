// server/routes/jurisprudenceRoutes.js
const express = require('express');
const router = express.Router();
const { getJurisprudence } = require('../controllers/jurisprudenceController');
const { protect } = require('../middleware/authMiddleware');

// Rota GET protegida (só usuários logados podem buscar)
router.get('/', protect, getJurisprudence);

module.exports = router;