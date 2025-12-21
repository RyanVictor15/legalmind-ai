const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Options like useNewUrlParser are deprecated in new Mongoose versions
      // but keeping strictQuery is good practice
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Connection Events
    mongoose.connection.on('error', (err) => {
      console.error(`🔥 MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;