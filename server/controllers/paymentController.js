const Stripe = require('stripe');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. CRIAR SESSÃO DE CHECKOUT
const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Cria cliente no Stripe se não existir
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

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Cria a sessão de pagamento
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Certifique-se que isso está no .env
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${clientUrl}/dashboard?success=true`,
      cancel_url: `${clientUrl}/dashboard?canceled=true`,
      subscription_data: {
        metadata: { userId: userId.toString() }
      }
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ message: 'Erro ao iniciar pagamento.' });
  }
};

// 2. WEBHOOK (Onde a mágica da aprovação acontece)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // 📍 SEGURANÇA MÁXIMA: Valida se o evento veio mesmo do Stripe
    // Nota: req.body aqui precisa ser o buffer raw. Se falhar, verifique o server/index.js
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Processa o evento validado
  try {
    switch (event.type) {
      
      case 'checkout.session.completed': {
        const session = event.data.object;
        // Recupera userId dos metadados ou do cliente
        const userId = session.metadata?.userId || session.subscription_data?.metadata?.userId;
        
        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            user.isPro = true;
            user.usageCount = 0; // Reseta o uso ao virar Pro
            user.subscriptionId = session.subscription;
            user.subscriptionStatus = 'active';
            await user.save();
            console.log(`💰 Usuário ${user.email} virou PRO!`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const user = await User.findOne({ subscriptionId: subscription.id });
        if (user) {
          user.isPro = false;
          user.subscriptionStatus = 'canceled';
          await user.save();
          console.log(`❌ Assinatura cancelada: ${user.email}`);
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const user = await User.findOne({ stripeCustomerId: invoice.customer });
        if (user) {
            // Não removemos o Pro imediatamente, mas marcamos como pendente
            user.subscriptionStatus = 'past_due';
            await user.save();
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook Handler Error:', error);
    res.status(500).send('Webhook Handler Error');
  }
};

module.exports = { createCheckoutSession, handleWebhook };