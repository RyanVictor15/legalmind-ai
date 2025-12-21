const Jurisprudence = require('../models/Jurisprudence');

// Get Jurisprudence with Filters
const getJurisprudence = async (req, res) => {
  try {
    const { search, court, area } = req.query;
    let query = {};

    // Text Filter (Search in Summary, Tags, and Process Number)
    if (search) {
      query.$or = [
        { summary: { $regex: search, $options: 'i' } }, // 'i' for case-insensitive
        { tags: { $regex: search, $options: 'i' } },
        { processNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Specific Filters
    if (court) query.court = court;
    if (area) query.area = area;

    // Search, sort by date (newest first) and limit to 50 results
    const results = await Jurisprudence.find(query).sort({ date: -1 }).limit(50);

    // Standardized Response
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