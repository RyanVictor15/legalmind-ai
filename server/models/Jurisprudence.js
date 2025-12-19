// server/models/Jurisprudence.js
const mongoose = require('mongoose');

const JurisprudenceSchema = new mongoose.Schema({
  court: { type: String, required: true }, // Ex: STJ, STF, TJSP
  processNumber: { type: String, required: true }, // Ex: REsp 1.888.999
  summary: { type: String, required: true }, // A Ementa completa
  area: { type: String }, // Ex: Civil, Penal, Trabalhista
  date: { type: Date },
  tags: [String], // Palavras-chave para facilitar a busca
  createdAt: { type: Date, default: Date.now }
});

// Cria um índice de texto para permitir buscas rápidas no resumo
JurisprudenceSchema.index({ summary: 'text', processNumber: 'text', tags: 'text' });

module.exports = mongoose.model('Jurisprudence', JurisprudenceSchema);