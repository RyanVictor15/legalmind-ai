const Jurisprudence = require('../models/Jurisprudence');
const escapeRegex = require('../utils/escapeRegex');

// @desc    Get Jurisprudence with Safe Search
// @route   GET /api/jurisprudence
// @access  Protected
const getJurisprudence = async (req, res) => {
  try {
    const { search, court, area } = req.query;
    let query = {};

    // 1. SECURITY FIX: Check if 'search' exists AND is a string
    // Prevents Parameter Pollution attacks (passing objects like ?search[$ne]=...)
    if (search && typeof search === 'string') {
      const cleanSearch = escapeRegex(search);
      query.$or = [
        { summary: { $regex: cleanSearch, $options: 'i' } },
        { tags: { $regex: cleanSearch, $options: 'i' } },
        { processNumber: { $regex: cleanSearch, $options: 'i' } }
      ];
    }

    // 2. Filters
    if (court) query.court = court;
    if (area) query.area = area;

    // 3. Optimization
    const results = await Jurisprudence.find(query)
      .sort({ date: -1 })
      .limit(50)
      .select('court processNumber summary area date tags');

    res.json({
      status: 'success',
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('Jurisprudence Search Error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error fetching jurisprudence data.' 
    });
  }
};

module.exports = { getJurisprudence };