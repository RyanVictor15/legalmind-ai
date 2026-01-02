const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Lista de membros e seus cargos
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { 
      type: String, 
      enum: ['admin', 'editor', 'viewer'], 
      default: 'editor' 
    },
    joinedAt: { type: Date, default: Date.now }
  }],
  // Convites pendentes (por email)
  invitations: [{
    email: { type: String, required: true },
    role: { type: String, default: 'editor' },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  }],
  // Dados de Assinatura da EMPRESA (sobrescreve a do usuário individual)
  stripeCustomerId: String,
  subscriptionId: String,
  subscriptionStatus: { type: String, default: 'free' },
  planLimits: {
    seats: { type: Number, default: 5 }, // Limite de cadeiras
    documents: { type: Number, default: 100 } // Limite mensal do time
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Organization', organizationSchema);