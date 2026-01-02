const Stripe = require('stripe');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. CRIAR SESSÃO DE CHECKOUT (Para comprar)
const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

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

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${clientUrl}/billing?success=true`, // Redireciona para área de faturamento
      cancel_url: `${clientUrl}/billing?canceled=true`,
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

// 📍 2. CRIAR SESSÃO DO PORTAL (NOVO - Para gerenciar)
const createCustomerPortalSession = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.stripeCustomerId) {
      return res.status(400).json({ message: 'Usuário não possui histórico de faturamento.' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // Cria a sessão do portal hospedado pelo Stripe
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${clientUrl}/billing`, // Para onde voltar após editar
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error('Stripe Portal Error:', error);
    res.status(500).json({ message: 'Erro ao acessar portal de faturamento.' });
  }
};

// 3. WEBHOOK (Mantido igual)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook Signature Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId || session.subscription_data?.metadata?.userId;
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            isPro: true,
            usageCount: 0,
            subscriptionId: session.subscription,
            subscriptionStatus: 'active',
            stripeCustomerId: session.customer // Garante que salvamos o customer ID correto
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await User.findOneAndUpdate({ subscriptionId: subscription.id }, {
          isPro: false,
          subscriptionStatus: 'canceled'
        });
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await User.findOneAndUpdate({ stripeCustomerId: invoice.customer }, {
            subscriptionStatus: 'past_due' // Não tira o acesso na hora, mas marca
        });
        break;
      }
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook Handler Error:', error);
    res.status(500).send('Webhook Handler Error');
  }
};

module.exports = { createCheckoutSession, handleWebhook, createCustomerPortalSession };