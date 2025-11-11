const jwt = require('jsonwebtoken');
const axios = require('axios');

// Middleware to verify JWT token and get user info from main backend
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify token with main backend
    const response = await axios.get(`${process.env.MAIN_BACKEND_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 200) {
      req.user = response.data; // User info from main backend
      next();
    } else {
      return res.status(403).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check if user is moderator or admin
const requireModerator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if user has moderator privileges
  // This would typically check against user roles in the main system
  // For now, we'll implement a basic check
  if (req.user.role === 'ADMIN' || req.user.role === 'MODERATOR') {
    next();
  } else {
    return res.status(403).json({ error: 'Moderator privileges required' });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
};

module.exports = {
  authenticateToken,
  requireModerator,
  requireAdmin
};