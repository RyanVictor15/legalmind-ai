const User = require('../models/User');
const Document = require('../models/Document');

// @desc    Get system statistics
// @route   GET /api/admin/stats
const getSystemStats = async (req, res) => {
  try {
    // Total user count
    const totalUsers = await User.countDocuments();
    
    // Pro users count
    const proUsers = await User.countDocuments({ isPro: true });
    
    // Total documents analyzed
    const totalDocuments = await Document.countDocuments();
    
    // List 5 most recent users
    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt isPro');

    res.status(200).json({
      status: 'success',
      data: {
        users: {
          total: totalUsers,
          pro: proUsers,
          free: totalUsers - proUsers
        },
        documents: {
          total: totalDocuments
        },
        latestUsers
      }
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error fetching system statistics.' 
    });
  }
};

module.exports = { getSystemStats };