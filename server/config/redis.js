const IORedis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null, // Obrigatório para BullMQ
});

connection.on('connect', () => console.log('✅ Redis Conectado'));
connection.on('error', (err) => console.error('❌ Erro Redis:', err));

module.exports = connection;