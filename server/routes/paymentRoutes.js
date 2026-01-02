const express = require('express');
const router = express.Router();
const { 
  createCheckoutSession, 
  handleWebhook, 
  createCustomerPortalSession // Nova importação
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Rotas Protegidas (Exigem Login)
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/create-portal-session', protect, createCustomerPortalSession); // 📍 Nova Rota

// Rota Pública (Webhook do Stripe)
router.post('/webhook', handleWebhook);

module.exports = router;