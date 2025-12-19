// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Importamos TODAS as funções do Controller
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  forgotPassword, // <--- TEM QUE ESTAR AQUI
  resetPassword,  // <--- TEM QUE ESTAR AQUI
  upgradeToPro
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');

// Rotas de Autenticação
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rotas de Perfil (Protegidas)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Rota de Upgrade
router.put('/upgrade', protect, upgradeToPro);

// --- AS NOVAS ROTAS DE SENHA ---
router.post('/forgot-password', forgotPassword); // O Frontend chama essa
router.put('/reset-password/:resetToken', resetPassword);
// ------------------------------

module.exports = router;