const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Em produção, use process.env.MONGO_URI.
    // Para dev local, usaremos uma string padrão se não houver ENV.
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/legal-sentiment', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;