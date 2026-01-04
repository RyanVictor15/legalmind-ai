const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  // 📍 AQUI ESTAVA O POSSÍVEL ERRO: Este campo PRECISA existir
  content: {
    type: String,
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'error'],
    default: 'pending'
  },
  analysis: {
    type: Object // Onde guardamos o JSON da IA
  },
  type: {
    type: String,
    default: 'contract'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  analyzedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Document', documentSchema);