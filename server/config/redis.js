const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, // Recomendado para BullMQ
};

// Só adiciona a senha se ela existir (para evitar erro com string vazia)
if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

const redisClient = new Redis(redisConfig);

redisClient.on('connect', () => {
  console.log('✅ Redis Connected:', process.env.REDIS_HOST || 'Localhost');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

module.exports = redisClient;