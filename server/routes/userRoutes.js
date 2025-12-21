const express = require('express');
const router = express.Router();

// Import ALL Controller functions
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  forgotPassword,
  resetPassword,
  upgradeToPro,
  verifyTwoFactor,
  deleteAccount 
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');

// Auth Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
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

module.exports = router;