const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Rota de Checkout (Protegida)
router.post('/create-checkout-session', protect, createCheckoutSession);

// Rota de Webhook (Pública, mas validada por assinatura)
// Nota: O parser do corpo deve ser tratado no index.js para esta rota específica
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;