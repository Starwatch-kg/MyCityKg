const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Токен доступа не предоставлен',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Find user
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Аккаунт деактивирован',
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Токен истек',
      });
    }

    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {string|Array} roles - Required role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не авторизован',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав доступа',
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (user && user.isActive) {
      req.user = user;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // Ignore token errors in optional auth
    next();
  }
};

/**
 * Resource ownership middleware
 * Checks if the authenticated user owns the resource or has admin privileges
 * @param {string} resourceField - Field name that contains the user ID
 */
const checkOwnership = (resourceField = 'user') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Пользователь не авторизован',
        });
      }

      // Admin and moderator can access any resource
      if (['admin', 'moderator'].includes(req.user.role)) {
        return next();
      }

      // Get resource ID from params
      const resourceId = req.params.id;
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'ID ресурса не предоставлен',
        });
      }

      // This middleware should be used after the resource is fetched
      // The resource should be attached to req.resource
      if (!req.resource) {
        return res.status(404).json({
          success: false,
          message: 'Ресурс не найден',
        });
      }

      // Check ownership
      const resourceUserId = req.resource[resourceField];
      
      if (!resourceUserId || resourceUserId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Доступ запрещен',
        });
      }

      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера',
      });
    }
  };
};

/**
 * Rate limiting based on user role
 * Different limits for different user roles
 */
const roleBasedRateLimit = () => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req) => {
      if (!req.user) return 10; // Anonymous users
      
      switch (req.user.role) {
        case 'admin':
          return 1000;
        case 'moderator':
          return 500;
        case 'volunteer':
          return 200;
        default:
          return 100;
      }
    },
    message: {
      error: 'Превышен лимит запросов',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.user ? req.user.id.toString() : req.ip;
    },
  });
};

/**
 * Validate API key for external integrations
 */
const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API ключ не предоставлен',
      });
    }

    // TODO: Implement API key validation logic
    // For now, just check against a simple key
    const validApiKey = process.env.API_KEY || 'mycitykg-api-key';
    
    if (apiKey !== validApiKey) {
      return res.status(401).json({
        success: false,
        message: 'Недействительный API ключ',
      });
    }

    next();
  } catch (error) {
    logger.error('API key validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
};

/**
 * Check if user has verified email
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Пользователь не авторизован',
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Требуется подтверждение email',
    });
  }

  next();
};

/**
 * Log user activity
 */
const logActivity = (action) => {
  return (req, res, next) => {
    if (req.user) {
      logger.info(`User activity: ${req.user.email} - ${action}`, {
        userId: req.user.id,
        action,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
      });
    }
    next();
  };
};

module.exports = {
  auth,
  authorize,
  optionalAuth,
  checkOwnership,
  roleBasedRateLimit,
  validateApiKey,
  requireEmailVerification,
  logActivity,
};
