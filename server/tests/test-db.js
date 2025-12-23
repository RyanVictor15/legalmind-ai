const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo = null;

// Conecta ao banco em memória
const connect = async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  
  // Garante desconexão anterior para evitar erros
  if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
  }
  await mongoose.connect(uri);
};

// Limpa dados entre testes (para um teste não afetar outro)
const clear = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    // CORREÇÃO: Adicione o objeto vazio {} dentro do deleteMany
    await collections[key].deleteMany({}); 
  }
};

// Desliga tudo no final
const close = async () => {
  if (mongo) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
  }
};

module.exports = { connect, clear, close };