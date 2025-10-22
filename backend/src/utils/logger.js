const winston = require('winston');
const path = require('path');
const config = require('../config/config');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = config.nodeEnv || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  // Add timestamp
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Add colors to the output
  winston.format.colorize({ all: true }),
  // Define format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    level: level(),
    format,
  }),
];

// Add file transport in production
if (config.nodeEnv === 'production') {
  // Ensure logs directory exists
  const fs = require('fs');
  const logsDir = path.dirname(config.logging.file);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  // Add file transports
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: config.logging.file,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  );
}

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
  // Exit on handled exceptions
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Helper functions for structured logging
logger.logRequest = (req, res, responseTime) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user ? req.user._id : null,
  });
};

logger.logError = (error, req = null) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
  };

  if (req) {
    errorInfo.request = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userId: req.user ? req.user._id : null,
    };
  }

  logger.error('Application Error', errorInfo);
};

logger.logUserActivity = (userId, action, details = {}) => {
  logger.info('User Activity', {
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  });
};

logger.logSecurityEvent = (event, details = {}) => {
  logger.warn('Security Event', {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
};

logger.logPerformance = (operation, duration, details = {}) => {
  logger.info('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    details,
    timestamp: new Date().toISOString(),
  });
};

logger.logDatabaseOperation = (operation, collection, duration, details = {}) => {
  logger.debug('Database Operation', {
    operation,
    collection,
    duration: `${duration}ms`,
    details,
    timestamp: new Date().toISOString(),
  });
};

logger.logExternalAPI = (service, endpoint, method, statusCode, duration, details = {}) => {
  logger.info('External API Call', {
    service,
    endpoint,
    method,
    statusCode,
    duration: `${duration}ms`,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Log application startup
logger.info('Logger initialized', {
  level: level(),
  environment: config.nodeEnv,
  logFile: config.logging.file,
});

module.exports = logger;
