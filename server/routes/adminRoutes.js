const express = require('express');
const router = express.Router();
const { getSystemStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// Middleware: Verify Admin Privileges
// Checks against the 'isAdmin' boolean in the User model
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ 
      status: 'error', 
      message: 'Access denied: Admin privileges required.' 
    });
  }
};

// Protected Route (Login + Admin)
router.get('/stats', protect, adminOnly, getSystemStats);

module.exports = router;