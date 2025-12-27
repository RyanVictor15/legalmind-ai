const express = require('express');
const router = express.Router();
const { analyzeDocument, getHistory } = require('../controllers/analyzeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.post('/', protect, upload.single('file'), analyzeDocument);
router.get('/history', protect, getHistory); // <--- Essa é a linha nova

module.exports = router;