const mongoose = require('mongoose');

const JurisprudenceSchema = new mongoose.Schema({
  court: { type: String, required: true }, // e.g., STJ, STF, TJSP
  processNumber: { type: String, required: true }, // e.g., REsp 1.888.999
  summary: { type: String, required: true }, // Full case syllabus/summary
  area: { type: String }, // e.g., Civil, Criminal, Labor
  date: { type: Date },
  tags: [String], // Keywords for search optimization
  createdAt: { type: Date, default: Date.now }
});

// Create text index for fast search on summary, process number, and tags
JurisprudenceSchema.index({ summary: 'text', processNumber: 'text', tags: 'text' });

module.exports = mongoose.model('Jurisprudence', JurisprudenceSchema);