// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getSystemStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// Middleware extra: Verifica se é Admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado: Apenas administradores.' });
  }
};

// Rota protegida (Login + Admin)
router.get('/stats', protect, adminOnly, getSystemStats);

module.exports = router;