const mongoose = require('mongoose');

const analysisSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  filename: { type: String, required: true },
  summary: { type: String },
  riskScore: { type: Number },
  verdict: { type: String },
  strategicAdvice: { type: String },
  fullAnalysis: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);