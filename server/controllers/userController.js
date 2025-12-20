// server/controllers/userController.js
const Document = require('../models/Document');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); // O "Carteiro" real

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// 1. REGISTRAR USUÁRIO
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres.' });
    }
    
    // Verifica se já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Este email já está registrado.' });
    }

    // Cria o usuário
    const user = await User.create({ firstName, lastName, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id),
        isPro: user.isPro,
      });
    } else {
      res.status(400).json({ message: 'Dados inválidos' });
    }
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// 2. LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Verifica senha
    if (user && (await user.matchPassword(password))) {
      
      // GERA CÓDIGO DE 6 DÍGITOS
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Salva o HASH do código no banco (para segurança)
      user.twoFactorCode = crypto.createHash('sha256').update(code).digest('hex');
      user.twoFactorExpires = Date.now() + 10 * 60 * 1000; // Validade de 10 min
      
      await user.save({ validateBeforeSave: false });

      // MANDA O EMAIL
      const message = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2>Seu Código de Segurança:</h2>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #2563eb;">${code}</h1>
          <p>Este código expira em 10 minutos.</p>
        </div>
      `;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Código de Acesso - LegalMind AI',
          message,
        });

        // NÃO MANDA O TOKEN AINDA. Manda aviso que precisa de 2FA.
        res.json({ 
          requires2FA: true, 
          email: user.email,
          message: 'Código enviado para o e-mail.' 
        });

      } catch (emailError) {
        user.twoFactorCode = undefined;
        user.twoFactorExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ message: 'Erro ao enviar código 2FA.' });
      }

    } else {
      res.status(401).json({ message: 'Email ou senha inválidos' });
    }
  } catch (error) {
     console.error('Erro no login:', error);
     res.status(500).json({ message: 'Erro interno no servidor' });
  }
};

// --- 2.5 LOGIN PARTE 2: VERIFICA CÓDIGO E LIBERA ---
const verifyTwoFactor = async (req, res) => {
  const { email, code } = req.body;

  try {
    // Cria o hash do código que o usuário digitou para comparar com o banco
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    const user = await User.findOne({
      email,
      twoFactorCode: hashedCode,
      twoFactorExpires: { $gt: Date.now() }, // Verifica se não expirou
    });

    if (!user) {
      return res.status(400).json({ message: 'Código inválido ou expirado.' });
    }

    // Sucesso! Limpa o código e libera o Token
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user._id), // O CRACHÁ É ENTREGUE AQUI
      isPro: user.isPro,
      isAdmin: user.isAdmin,
      usageCount: user.usageCount
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar código.' });
  }
};

// 3. PERFIL DO USUÁRIO
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isPro: user.isPro,
      usageCount: user.usageCount,
      createdAt: user.createdAt
    });
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
};

// 4. ATUALIZAR PERFIL
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;

    if (req.body.password) {
      if (req.body.password.length < 6) {
         return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres.' });
      }
      user.password = req.body.password;
    }
    
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      isPro: updatedUser.isPro,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'Usuário não encontrado' });
  }
};

// 5. SOLICITAR RECUPERAÇÃO DE SENHA (Definitivo)
const forgotPassword = async (req, res) => {
  console.log("📢 O SITE CHAMOU! Tentando recuperar senha para:", req.body.email);

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Email não encontrado.' });
    }

    // Gerar Token de Reset
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash do token para salvar no banco (Segurança)
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Expira em 10 minutos
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // URL que o usuário vai clicar
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Mensagem HTML Profissional
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #0f172a; text-align: center;">Recuperação de Senha</h2>
        <p style="color: #475569; font-size: 16px;">Olá, <strong>Dr(a). ${user.lastName}</strong>,</p>
        <p style="color: #475569; font-size: 14px;">Recebemos uma solicitação para redefinir a senha da sua conta no <strong>LegalMind AI</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
           <a href="${resetUrl}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Redefinir Minha Senha</a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">Se você não solicitou essa alteração, por favor ignore este e-mail. O link expira em 10 minutos.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #cbd5e1; font-size: 10px; text-align: center;">LegalMind AI Security Center</p>
      </div>
    `;

    try {
      // Envio Real via SMTP (Gmail)
      await sendEmail({
        email: user.email,
        subject: 'Redefinição de Senha - LegalMind AI',
        message,
      });

      res.status(200).json({ success: true, data: 'Email enviado com sucesso!' });
    } catch (emailError) {
      console.error("Erro no envio de email:", emailError);
      // Se o email falhar, limpa o token do banco para não travar o usuário
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Erro ao enviar o e-mail. Tente novamente mais tarde.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno ao processar solicitação.' });
  }
};

// 6. REDEFINIR A SENHA (Definitivo)
const resetPassword = async (req, res) => {
  // Pega o token da URL e faz o hash para comparar com o banco
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }, // Verifica se não expirou
    });

    if (!user) {
      return res.status(400).json({ message: 'Link inválido ou expirado.' });
    }

    if (req.body.password.length < 6) {
       return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    // Define a nova senha
    user.password = req.body.password;
    
    // Limpa os campos de token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Salva (o middleware do Model vai criptografar a senha automaticamente)
    await user.save();

    res.status(200).json({ success: true, data: 'Senha atualizada com sucesso!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao redefinir senha.' });
  }
};

// 7. UPGRADE (Membro PRO)
const upgradeToPro = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.isPro = true;
      user.usageCount = 0; // Reseta contador
      await user.save();
      
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        token: generateToken(user._id),
        isPro: user.isPro
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

    // 1. Apagar todos os documentos/análises desse usuário
    await Document.deleteMany({ userId: userId });

    // 2. Apagar o usuário
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Conta e dados excluídos permanentemente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao excluir conta.' });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  upgradeToPro, 
  forgotPassword, 
  resetPassword,
  deleteAccount
};