const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { z } = require('zod'); // Import Zod
const User = require('../models/User');
const Document = require('../models/Document');
const Stripe = require('stripe');
const { sendWelcomeEmail } = require('../services/emailService');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- ZOD SCHEMAS ---
const registerSchema = z.object({
  firstName: z.string().min(2, "First name too short"),
  lastName: z.string().min(2, "Last name too short"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// --- HELPERS ---
const generateToken = (id, tokenVersion) => {
  return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGISTER
const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    if (user) {
      // Tenta enviar e-mail, mas não trava se falhar
      try {
        await sendWelcomeEmail(user.email, user.firstName);
      } catch (emailError) {
        console.error("Erro ao enviar email de boas-vindas:", emailError);
      }

      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isPro: user.isPro,
        token: generateToken(user._id, user.tokenVersion),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isPro: user.isPro,
        avatar: user.avatar,
        token: generateToken(user._id, user.tokenVersion),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. PROFILE
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isPro: user.isPro,
      avatar: user.avatar,
      preferences: user.preferences,
      hasOnboarded: user.hasOnboarded
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// 4. UPDATE PROFILE
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      isPro: updatedUser.isPro,
      token: generateToken(updatedUser._id, updatedUser.tokenVersion),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// 5. FORGOT PASSWORD
const forgotPassword = async (req, res) => {
    // Implementação básica placeholder (será expandida depois)
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
    }
    // Lógica de enviar email de recuperação viria aqui
    res.json({ message: "Email de recuperação enviado (simulado)." });
};

// 6. RESET PASSWORD
const resetPassword = async (req, res) => {
    res.json({ message: "Reset de senha (simulado)." });
};

// 7. UPGRADE TO PRO (Manual/Debug)
const upgradeToPro = async (req, res) => {
    const user = await User.findById(req.user._id);
    if(user){
        user.isPro = true;
        await user.save();
        res.json({ message: "Upgrade realizado com sucesso!", isPro: true });
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

// 8. 2FA (Placeholder)
const verifyTwoFactor = async (req, res) => {
    res.json({ message: "2FA verificado (simulado)" });
};

// 9. DELETE ACCOUNT
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 1. CANCELAR STRIPE (Se houver assinatura)
    if (user.subscriptionId && user.subscriptionStatus === 'active') {
        try {
            await stripe.subscriptions.cancel(user.subscriptionId);
        } catch (stripeError) {
            console.error("Erro ao cancelar no Stripe:", stripeError);
            // Continuamos a deletar localmente mesmo se o Stripe falhar
        }
    }

    // 2. APAGAR DOCUMENTOS
    const docsDeleted = await Document.deleteMany({ user: user._id });
    console.log(`📄 ${docsDeleted.deletedCount} documentos apagados.`);

    // 3. APAGAR O USUÁRIO
    await User.findByIdAndDelete(user._id);
    console.log(`👤 Usuário ${user.email} deletado permanentemente.`);

    res.json({ message: 'Conta excluída com sucesso.' });

  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({ message: 'Erro ao processar exclusão de conta.' });
  }
};

// 10. ONBOARDING
const completeOnboarding = async (req, res) => {
  try {
    const { role, specialty, mainGoal } = req.body;
    
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Atualiza preferências e marca como concluído
    user.preferences = { role, specialty, mainGoal };
    user.hasOnboarded = true;
    
    await user.save();

    res.json({ 
      message: 'Perfil atualizado com sucesso.',
      user: {
        ...user._doc, // Retorna dados atualizados para o frontend
        token: req.token // Opcional, dependendo da sua estratégia de refresh
      }
    });

  } catch (error) {
    console.error("Erro Onboarding:", error);
    res.status(500).json({ message: 'Erro ao salvar onboarding.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  upgradeToPro,
  verifyTwoFactor,
  deleteAccount,
  completeOnboarding
};