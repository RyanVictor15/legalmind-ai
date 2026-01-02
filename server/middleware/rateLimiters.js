const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis'); // Reutiliza a conexão existente

// Configuração Base do Store (Redis)
const createStore = () => new RedisStore({
  sendCommand: (...args) => redisClient.call(...args),
});

// 1. LIMITADOR GLOBAL (DDoS Protection)
// Bloqueia IPs que fazem muitas requisições em pouco tempo
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite por IP
  message: { message: 'Muitas requisições deste IP. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(),
});

// 2. LIMITADOR DE LOGIN (Brute Force Protection)
// Mais estrito para evitar descoberta de senha
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 tentativas falhas
  message: { message: 'Muitas tentativas de login. Conta bloqueada por 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(),
});

// 3. LIMITADOR DA IA (Business Logic)
// Define limites diferentes para Free vs Pro
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: async (req) => {
    // Se o usuário for Pro, limite alto. Se for Free, limite baixo.
    if (req.user && req.user.isPro) {
      return 50; // Pro: 50 análises/hora
    }
    return 5; // Free: 5 análises/hora (Anti-abuso)
  },
  message: { message: 'Limite de análises por hora excedido.' },
  keyGenerator: (req) => {
    // Usa o ID do usuário como chave em vez do IP
    return req.user ? req.user._id.toString() : req.ip;
  },
  store: createStore(),
});

module.exports = { globalLimiter, authLimiter, aiLimiter };