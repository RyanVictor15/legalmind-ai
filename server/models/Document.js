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
  originalContent: {
    type: String,
    select: false // Otimização: Não traz o texto gigante nas listagens por padrão
  },
  
  // Campos da IA
  summary: String,
  riskScore: Number, // 0 a 100
  verdict: String,
  strategicAdvice: String,
  keywords: {
    positive: [String],
    negative: [String]
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// 📍 FASE 3: INDEXAÇÃO DE PERFORMANCE
// Índice Composto: Otimiza a busca de "Histórico do Usuário X ordenado por Data"
// Isso transforma uma busca de O(n) para O(log n) -> Extremamente rápido.
documentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);