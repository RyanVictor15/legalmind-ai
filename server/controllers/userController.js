// server/controllers/userController.js
const User = require('../models/User');
const Document = require('../models/Document');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// --- ATUALIZADO: Token agora leva a versão ---
const generateToken = (id, tokenVersion) => {
  return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGISTRAR
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres.' });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Este email já está registrado.' });
    }

    const user = await User.create({ firstName, lastName, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id, user.tokenVersion), // Versão 0
        isPro: user.isPro,
        twoFactorEnabled: user.twoFactorEnabled
      });
    } else {
      res.status(400).json({ message: 'Dados inválidos' });
    }
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// 2. LOGIN (Incrementa versão e derruba sessões antigas)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      
      // FLUXO COM 2FA
      if (user.twoFactorEnabled) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.twoFactorCode = crypto.createHash('sha256').update(code).digest('hex');
        user.twoFactorExpires = Date.now() + 10 * 60 * 1000;
        
        await user.save({ validateBeforeSave: false });

        const message = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Seu Código de Segurança</h2>
            <h1 style="color: #2563eb;">${code}</h1>
          </div>
        `;

        try {
          await sendEmail({
            email: user.email,
            subject: 'Código de Acesso - LegalMind AI',
            message,
          });

          return res.json({ 
            requires2FA: true, 
            email: user.email,
            message: 'Código de segurança enviado.' 
          });

        } catch (emailError) {
          user.twoFactorCode = undefined;
          user.twoFactorExpires = undefined;
          await user.save({ validateBeforeSave: false });
          return res.status(500).json({ message: 'Erro ao enviar código 2FA.' });
        }
      }

      // LOGIN DIRETO -> DERRUBAR SESSÃO ANTIGA
      user.tokenVersion = (user.tokenVersion || 0) + 1; // INCREMENTA
      await user.save();

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id, user.tokenVersion), // Token novo
        isPro: user.isPro,
        isAdmin: user.isAdmin,
        twoFactorEnabled: user.twoFactorEnabled,
        usageCount: user.usageCount
      });

    } else {
      res.status(401).json({ message: 'Email ou senha inválidos' });
    }
  } catch (error) {
     console.error('Erro no login:', error);
     res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

// 2.5 VERIFICAR 2FA (Também derruba sessão antiga ao validar)
const verifyTwoFactor = async (req, res) => {
  const { email, code } = req.body;

  try {
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    const user = await User.findOne({
      email,
      twoFactorCode: hashedCode,
      twoFactorExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Código inválido ou expirado.' });
    }

    // Sucesso
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    
    // DERRUBAR SESSÃO ANTIGA
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save({ validateBeforeSave: false });

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id, user.tokenVersion),
      isPro: user.isPro,
      isAdmin: user.isAdmin,
      twoFactorEnabled: user.twoFactorEnabled,
      usageCount: user.usageCount
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar código.' });
  }
};

// ... getUserProfile (Mantenha igual, não usa generateToken)
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isPro: user.isPro,
      isAdmin: user.isAdmin,
      twoFactorEnabled: user.twoFactorEnabled,
      usageCount: user.usageCount,
      createdAt: user.createdAt
    });
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
};

// 4. ATUALIZAR PERFIL (Se mudar senha, derruba outros PCs)
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;

    if (req.body.twoFactorEnabled !== undefined) {
      user.twoFactorEnabled = req.body.twoFactorEnabled;
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
         return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres.' });
      }
      user.password = req.body.password;
      // MUDOU SENHA? DERRUBA GERAL!
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }
    
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      isPro: updatedUser.isPro,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      token: generateToken(updatedUser._id, updatedUser.tokenVersion), // Token atualizado
    });
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
};

// ... Mantenha forgotPassword e resetPassword iguais
const forgotPassword = async (req, res) => {
    // ... (Use o código da resposta anterior para esta função)
    // Se quiser, posso repetir aqui, mas para economizar espaço assumo que você tem.
    // Mas para garantir a integridade, vou colocar o bloco resumido:
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email não encontrado.' });
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    await sendEmail({ email: user.email, subject: 'Redefinição de Senha', message: `Link: ${resetUrl}` });
    res.status(200).json({ success: true, data: 'Email enviado!' });
  } catch (error) { res.status(500).json({ message: 'Erro interno.' }); }
};

const resetPassword = async (req, res) => {
    // ... (Lógica padrão)
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
  try {
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Link inválido.' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    // Ao resetar senha, também derruba sessões antigas
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    res.status(200).json({ success: true, data: 'Senha atualizada!' });
  } catch (error) { res.status(500).json({ message: 'Erro ao redefinir.' }); }
};

const upgradeToPro = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.isPro = true;
      user.usageCount = 0;
      await user.save();
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id, user.tokenVersion), // Mantém versão
        isPro: user.isPro,
        twoFactorEnabled: user.twoFactorEnabled
      });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar upgrade' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await Document.deleteMany({ userId: userId });
    await User.findByIdAndDelete(userId);
    res.json({ success: true, message: 'Conta excluída.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir conta.' });
  }
};

module.exports = { 
  registerUser, loginUser, verifyTwoFactor, getUserProfile, 
  updateUserProfile, upgradeToPro, forgotPassword, resetPassword, deleteAccount
};