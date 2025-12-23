const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in headers
  // ...
if (
  req.headers.authorization &&
  req.headers.authorization.startsWith('Bearer')
) {
  try {
    // CORREÇÃO: Adicione um ESPAÇO dentro das aspas do split
    token = req.headers.authorization.split(' ')[1]; 
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
// ...

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ 
          status: 'error', 
          message: 'Not authorized, user not found' 
        });
      }

      next();
    } catch (error) {
      console.error(`❌ Auth Error: ${error.message}`);
      
      // Differentiate between expired and invalid tokens
      const message = error.name === 'TokenExpiredError' 
        ? 'Session expired, please login again' 
        : 'Not authorized, token failed';

      return res.status(401).json({ status: 'error', message });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Not authorized, no token provided' 
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      status: 'error', 
      message: 'Access denied: Admin privileges required' 
    });
  }
};

module.exports = { protect, admin };