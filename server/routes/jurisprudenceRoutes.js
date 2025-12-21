const express = require('express');
const router = express.Router();
const { getJurisprudence } = require('../controllers/jurisprudenceController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/jurisprudence
// Protected route to fetch legal precedents
router.get('/', protect, getJurisprudence);

module.exports = router;