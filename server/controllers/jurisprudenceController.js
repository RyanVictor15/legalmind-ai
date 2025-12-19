// server/controllers/jurisprudenceController.js
const Jurisprudence = require('../models/Jurisprudence');

// Buscar Jurisprudência com Filtros
const getJurisprudence = async (req, res) => {
  try {
    const { search, court, area } = req.query;
    let query = {};

    // Filtro por Texto (Busca na Ementa, Tags e Número)
    if (search) {
      query.$or = [
        { summary: { $regex: search, $options: 'i' } }, // 'i' ignora maiúsculas
        { tags: { $regex: search, $options: 'i' } },
        { processNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtros Específicos
    if (court) query.court = court;
    if (area) query.area = area;

    // Busca, ordena por data (mais recente) e limita a 50 resultados
    const results = await Jurisprudence.find(query).sort({ date: -1 }).limit(50);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar jurisprudência' });
  }
};

module.exports = { getJurisprudence };