const logger = require('../utils/logger');

/**
 * 404 Not Found handler middleware
 * Handles requests to undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const message = `Маршрут ${req.originalUrl} не найден`;
  
  // Log the 404 error
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Send 404 response
  res.status(404).json({
    success: false,
    message,
    error: {
      statusCode: 404,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = notFoundHandler;
