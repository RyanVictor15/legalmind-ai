const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filePath: { type: String },
  originalText: { 
    type: String, 
    required: true 
  },
  
  // --- ANALYSIS DATA ---
  sentimentScore: { type: Number },
  sentimentComparative: { type: Number },
  verdict: { type: String },
  keywords: {
    positive: [String],
    negative: [String]
  },

  // --- AI PREMIUM DATA ---
  aiSummary: { type: String },
  riskAnalysis: { type: Number },
  strategicAdvice: { type: String },

  // --- USER RELATIONSHIP ---
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('Document', DocumentSchema);