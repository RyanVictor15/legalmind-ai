const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Protected route (User must be logged in to pay)
router.post('/create-checkout-session', protect, createCheckoutSession);

// Public route (Stripe calls this, signature validation handles security)
// Note: The raw body parsing is handled in index.js for this specific path
router.post('/webhook', handleWebhook);

module.exports = router;