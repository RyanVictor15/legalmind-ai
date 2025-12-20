const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decodifica o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Busca o usuário
      const user = await User.findById(decoded.id).select('-password');

      // --- CHECAGEM DE SESSÃO (ITEM 4.5) ---
      // Se o usuário não existir OU a versão do token for velha -> Bloqueia
      // (Se user.tokenVersion for undefined no banco, tratamos como 0)
      const currentVersion = user.tokenVersion || 0;
      
      if (!user || decoded.tokenVersion !== currentVersion) {
        return res.status(401).json({ message: 'Sessão expirada. Logue novamente.' });
      }
      // -------------------------------------

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Não autorizado, token falhou' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, sem token' });
  }
};

module.exports = { protect };