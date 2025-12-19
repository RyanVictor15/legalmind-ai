// server/models/Document.js
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filePath: { type: String },
  originalText: { 
    type: String, 
    required: true 
  },
  
  // --- DADOS DA ANÁLISE ---
  sentimentScore: { type: Number },
  sentimentComparative: { type: Number },
  verdict: { type: String },
  keywords: {
    positive: [String],
    negative: [String]
  },

  // --- DADOS DA IA (PREMIUM) ---
  aiSummary: { type: String },
  riskAnalysis: { type: Number },
  strategicAdvice: { type: String },

  // --- O ELO PERDIDO (VINCULO COM O USUÁRIO) ---
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Isso diz que é um ID de usuário
    ref: 'User', // Aponta para a tabela de Usuários
    required: true // OBRIGA a ter um dono
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('Document', DocumentSchema);