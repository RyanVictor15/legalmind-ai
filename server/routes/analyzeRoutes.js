const express = require('express');
const router = express.Router();
const { analyzeDocument } = require('../controllers/analyzeController');
const upload = require('../config/multer');
const { protect } = require('../middleware/authMiddleware');

// POST /api/analyze
// Protected route: User must be logged in
// Uses 'upload.single' middleware to handle multipart/form-data
router.post('/', protect, upload.single('file'), analyzeDocument);

module.exports = router;