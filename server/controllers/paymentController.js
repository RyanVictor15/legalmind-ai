const Stripe = require('stripe');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. CRIAR SESSÃO DE CHECKOUT (Front chama isso)
const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Identificar ou Criar Cliente Stripe
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

    // URL do Front-end (Prod ou Local)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // ID do Preço no Dashboard do Stripe
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${clientUrl}/dashboard?success=true`,
      cancel_url: `${clientUrl}/pricing?canceled=true`,
      metadata: { userId: userId.toString() } // Importante para o Webhook saber quem pagou
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ message: 'Erro ao criar pagamento.' });
  }
};

// 2. WEBHOOK (Stripe chama isso nos bastidores)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // AQUI ESTÁ A SEGURANÇA: Valida se veio do Stripe mesmo
    // req.body deve ser RAW (configurado no index.js)
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`⚠️ Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Processar Eventos
  try {
    switch (event.type) {
      // PAGAMENTO APROVADO
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId; // Recupera o ID que mandamos no checkout

        if (userId) {
          await User.findByIdAndUpdate(userId, {
            isPro: true,
            usageCount: 0, // Reseta o limite de uso
            subscriptionId: session.subscription,
            subscriptionStatus: 'active'
          });
          console.log(`✅ Pagamento confirmado! Usuário ${userId} agora é PRO.`);
        }
        break;
      }

      // ASSINATURA CANCELADA
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        // Precisamos achar o usuário pela assinatura, pois metadata as vezes não vem na deleção
        const user = await User.findOne({ subscriptionId: subscription.id });
        
        if (user) {
          user.isPro = false;
          user.subscriptionStatus = 'canceled';
          await user.save();
          console.log(`❌ Assinatura cancelada para usuário ${user._id}.`);
        }
        break;
      }
      
      // PAGAMENTO FALHOU (Cartão recusado na renovação)
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const user = await User.findOne({ stripeCustomerId: invoice.customer });
        if (user) {
            user.isPro = false;
            user.subscriptionStatus = 'past_due';
            await user.save();
        }
        break;
      }
    }

    res.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook Logic Error:', error);
    res.status(500).send('Webhook process failed');
  }
};

module.exports = { createCheckoutSession, handleWebhook };