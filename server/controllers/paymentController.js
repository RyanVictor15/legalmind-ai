const Stripe = require('stripe');
const User = require('../models/User');

// Inicializa Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. CRIAR SESSÃO DE CHECKOUT
const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Cria ou recupera Customer no Stripe
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { userId: userId.toString() }
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Cria a sessão de pagamento
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          // ID do preço deve ser criado no Dashboard do Stripe
          // Substitua pelo ID real do seu produto "Enterprise Plan"
          price: process.env.STRIPE_PRICE_ID, 
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?payment=canceled`,
      metadata: { userId: userId.toString() }
    });

    res.json({ status: 'success', url: session.url });

  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ status: 'error', message: 'Unable to create checkout session' });
  }
};

// 2. WEBHOOK (Ouvir confirmação do Stripe)
// Nota: Esta função não usa 'res.json' padrão pois o Stripe exige resposta crua
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verifica se o evento veio mesmo do Stripe
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`⚠️ Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Processa o evento
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        
        // Ativa o plano Pro
        await User.findByIdAndUpdate(userId, {
          isPro: true,
          subscriptionId: session.subscription,
          subscriptionStatus: 'active'
        });
        console.log(`✅ User ${userId} upgraded to PRO via Webhook.`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const user = await User.findOne({ subscriptionId: subscription.id });
        if (user) {
          user.isPro = false;
          user.subscriptionStatus: 'canceled';
          await user.save();
          console.log(`❌ User ${user._id} subscription canceled.`);
        }
        break;
      }
      
      // Adicione outros casos como 'invoice.payment_failed' se necessário
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Webhook Handler Error:', error);
    res.status(500).json({ error: 'Webhook Handler Failed' });
  }
};

module.exports = { createCheckoutSession, handleWebhook };