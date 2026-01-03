const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');

// Configuração Base do Store (Redis)
const createStore = () => new RedisStore({
  sendCommand: (...args) => redisClient.call(...args),
});

// Configuração comum para evitar o erro "ERR_ERL_KEY_GEN_IPV6"
const commonConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  // 📍 AQUI ESTÁ A CORREÇÃO DO ERRO DE DEPLOY
  // Desativa a validação estrita de IP que conflita com o Proxy do Render
  validate: {
    xForwardedForHeader: false,
    default: false
  }
};

// 1. LIMITADOR GLOBAL
const globalLimiter = rateLimit({
  ...commonConfig,
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { message: 'Muitas requisições deste IP. Tente novamente em 15 minutos.' },
  store: createStore(),
});

// 2. LIMITADOR DE LOGIN
const authLimiter = rateLimit({
  ...commonConfig,
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: { message: 'Muitas tentativas de login. Conta bloqueada por 1 hora.' },
  store: createStore(),
});

// 3. LIMITADOR DA IA
const aiLimiter = rateLimit({
  ...commonConfig,
  windowMs: 60 * 60 * 1000, // 1 hora
  max: async (req) => {
    // Se o usuário for Pro, limite alto. Se for Free, limite baixo.
    if (req.user && req.user.isPro) {
      return 100;
    }
    return 10;
  },
  message: { message: 'Limite de análises de IA atingido. Faça upgrade para continuar.' },
  store: createStore(),
  // Importante: Manter keyGenerator padrão ou definir um simples baseada em User ID se logado
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

module.exports = { globalLimiter, authLimiter, aiLimiter };