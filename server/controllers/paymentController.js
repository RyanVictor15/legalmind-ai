const Stripe = require('stripe');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create Stripe Checkout Session
// @route   POST /api/payments/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Get or Create Stripe Customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { userId: userId.toString() }
      });
      customerId = customer.id;
      
      // Save customer ID immediately
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // 2. Create Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?payment=canceled`,
      metadata: { userId: userId.toString() },
      subscription_data: {
        metadata: { userId: userId.toString() } // Ensure metadata is on subscription too
      }
    });

    res.json({ status: 'success', url: session.url });

  } catch (error) {
    console.error('❌ Stripe Checkout Error:', error);
    res.status(500).json({ status: 'error', message: 'Unable to create checkout session' });
  }
};

// @desc    Handle Stripe Webhooks
// @route   POST /api/payments/webhook
// @access  Public (Stripe signature verified)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // Must be RAW body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`⚠️ Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle Events
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;

        if (userId) {
          await User.findByIdAndUpdate(userId, {
            isPro: true,
            subscriptionId: session.subscription,
            subscriptionStatus: 'active'
          });
          console.log(`✅ User ${userId} upgraded to PRO.`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        // Find user by subscription ID since metadata might not be easily accessible here without expansion
        const user = await User.findOne({ subscriptionId: subscription.id });
        
        if (user) {
          user.isPro = false;
          user.subscriptionStatus = 'canceled'; // FIXED: Was causing syntax error
          await user.save();
          console.log(`❌ User ${user._id} subscription canceled.`);
        }
        break;
      }
      
      // Add 'invoice.payment_failed' handler later for robustness
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('❌ Webhook Handler Logic Error:', error);
    res.status(500).json({ error: 'Webhook Handler Failed' });
  }
};

module.exports = { createCheckoutSession, handleWebhook };