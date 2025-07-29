const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user account deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed.'
    });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Check if user is verified
const isVerified = (req, res, next) => {
  if (req.user && req.user.isEmailVerified) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address first.'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Rate limiting for authentication attempts
const authRateLimit = (req, res, next) => {
  // This would typically be implemented with a rate limiting library
  // For now, we'll just pass through
  next();
};

// Check if user owns the resource
const isOwner = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.'
        });
      }

      if (resource.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only modify your own resources.'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Owner check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking resource ownership.'
      });
    }
  };
};

// Check if user can access contact message
const canAccessContact = async (req, res, next) => {
  try {
    const Contact = require('../models/Contact');
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found.'
      });
    }

    // Admin can access all messages
    if (req.user.role === 'admin') {
      req.contact = contact;
      return next();
    }

    // User can only access their own messages
    if (contact.userId && contact.userId.toString() === req.user._id.toString()) {
      req.contact = contact;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own messages.'
    });
  } catch (error) {
    console.error('Contact access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking contact message access.'
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isVerified,
  optionalAuth,
  authRateLimit,
  isOwner,
  canAccessContact
}; 