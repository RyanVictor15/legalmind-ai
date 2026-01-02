const express = require('express');
const passport = require('passport');
const generateToken = require('../utils/generateToken');
const router = express.Router();

// 1. Inicia o fluxo (Redireciona para o Google)
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

// 2. Callback (Google devolve o usuário aqui)
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Autenticação bem sucedida
    const user = req.user;
    const token = generateToken(user._id, user.tokenVersion);

    // Redireciona para o Frontend enviando o token na URL (forma segura para OAuth)
    // Em produção, use CLIENT_URL do .env
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    // Monta o objeto de usuário para o frontend já salvar
    const userData = encodeURIComponent(JSON.stringify({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isPro: user.isPro,
      avatar: user.avatar,
      token: token
    }));

    res.redirect(`${clientUrl}/login?social_auth=${userData}`);
  }
);

module.exports = router;