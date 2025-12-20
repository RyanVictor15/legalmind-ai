// server/controllers/adminController.js
const User = require('../models/User');
const Document = require('../models/Document');

// @desc    Obter estatísticas do sistema
// @route   GET /api/admin/stats
const getSystemStats = async (req, res) => {
  try {
    // Conta total de usuários
    const totalUsers = await User.countDocuments();
    
    // Conta usuários Pro
    const proUsers = await User.countDocuments({ isPro: true });
    
    // Conta total de documentos analisados
    const totalDocuments = await Document.countDocuments();
    
    // Lista os 5 usuários mais recentes
    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt isPro');

    res.json({
      users: {
        total: totalUsers,
        pro: proUsers,
        free: totalUsers - proUsers
      },
      documents: {
        total: totalDocuments
      },
      latestUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
};

module.exports = { getSystemStats };