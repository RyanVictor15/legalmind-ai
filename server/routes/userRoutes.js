const express = require('express');
const router = express.Router();

// 1. IMPORTAR TODAS AS FUNÇÕES DO CONTROLLER
// (Adicionei 'completeOnboarding' que estava faltando na sua lista)
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  forgotPassword,
  resetPassword,
  upgradeToPro,
  verifyTwoFactor,
  deleteAccount,
  completeOnboarding // 📍 IMPORTANTE: Adicionado aqui
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');

// 2. IMPORTAR A BLINDAGEM (ZOD)
const validateRequest = require('../middleware/validateRequest');
const { registerSchema, loginSchema, onboardingSchema } = require('../schemas/userSchemas');

// Auth Routes (Agora protegidas pelo Zod)
// O validateRequest verifica os dados ANTES de chamar o controller
router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);

router.post('/verify-2fa', verifyTwoFactor);

// Profile Routes (Protected)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Upgrade Route
router.put('/upgrade', protect, upgradeToPro);

// Password Management Routes
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Account Management
router.delete('/profile', protect, deleteAccount);

// Onboarding Route (Agora protegida pelo Zod)
router.post('/onboarding', protect, validateRequest(onboardingSchema), completeOnboarding);

module.exports = router;