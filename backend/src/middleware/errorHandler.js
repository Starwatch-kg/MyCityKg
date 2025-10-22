const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.logError(error, req);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Ресурс не найден';
    error = {
      message,
      statusCode: 404,
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Дублирующиеся данные';
    error = {
      message,
      statusCode: 400,
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400,
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Недействительный токен';
    error = {
      message,
      statusCode: 401,
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Токен истек';
    error = {
      message,
      statusCode: 401,
    };
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Файл слишком большой';
    error = {
      message,
      statusCode: 400,
    };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Слишком много файлов';
    error = {
      message,
      statusCode: 400,
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Неожиданное поле файла';
    error = {
      message,
      statusCode: 400,
    };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Слишком много запросов, попробуйте позже';
    error = {
      message,
      statusCode: 429,
    };
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Внутренняя ошибка сервера';

  // Prepare error response
  const errorResponse = {
    success: false,
    message,
  };

  // Add error details in development
  if (config.nodeEnv === 'development') {
    errorResponse.error = {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };

    if (req) {
      errorResponse.request = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        params: req.params,
        query: req.query,
      };
    }
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 errors for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const message = `Маршрут ${req.originalUrl} не найден`;
  
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json({
    success: false,
    message,
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error handler
 */
const handleValidationError = (errors) => {
  const message = errors.array().map(error => error.msg).join(', ');
  return new AppError(message, 400);
};

/**
 * Database connection error handler
 */
const handleDatabaseError = (error) => {
  logger.error('Database connection error:', error);
  
  if (error.name === 'MongoNetworkError') {
    return new AppError('Проблемы с подключением к базе данных', 503);
  }
  
  if (error.name === 'MongoTimeoutError') {
    return new AppError('Превышено время ожидания базы данных', 503);
  }
  
  return new AppError('Ошибка базы данных', 500);
};

/**
 * External API error handler
 */
const handleExternalAPIError = (error, service) => {
  logger.error(`External API error (${service}):`, error);
  
  if (error.code === 'ECONNREFUSED') {
    return new AppError(`Сервис ${service} недоступен`, 503);
  }
  
  if (error.code === 'ETIMEDOUT') {
    return new AppError(`Превышено время ожидания сервиса ${service}`, 503);
  }
  
  return new AppError(`Ошибка внешнего сервиса ${service}`, 502);
};

/**
 * File upload error handler
 */
const handleFileUploadError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new AppError('Файл слишком большой', 400);
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Слишком много файлов', 400);
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Неожиданное поле файла', 400);
  }
  
  if (error.message && error.message.includes('Only images are allowed')) {
    return new AppError('Разрешены только изображения', 400);
  }
  
  return new AppError('Ошибка загрузки файла', 400);
};

/**
 * Security error handler
 */
const handleSecurityError = (error, req) => {
  logger.logSecurityEvent('Security violation', {
    error: error.message,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.url,
    method: req.method,
  });
  
  return new AppError('Нарушение безопасности', 403);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  handleValidationError,
  handleDatabaseError,
  handleExternalAPIError,
  handleFileUploadError,
  handleSecurityError,
};
