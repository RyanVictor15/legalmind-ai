const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Pega o token do cabeçalho
      token = req.headers.authorization.split(' ')[1];

      // Decodifica
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Busca o usuário (sem a senha)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Token inválido ou usuário não existe.' });
      }

      next();
    } catch (error) {
      console.error('Erro de Auth:', error.message);
      res.status(401).json({ message: 'Não autorizado, token falhou.' });
    }
  } else {
    res.status(401).json({ message: 'Não autorizado, sem token.' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Acesso restrito a administradores.' });
  }
};

module.exports = { protect, admin };