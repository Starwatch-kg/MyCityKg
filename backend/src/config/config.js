const path = require('path');

const config = {
  // Server configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  apiVersion: process.env.API_VERSION || 'v1',

  // Database configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mycitykg',
    testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/mycitykg_test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    },
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Firebase configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: process.env.FIREBASE_AUTH_URI,
    tokenUri: process.env.FIREBASE_TOKEN_URI,
    authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  },

  // Cloudinary configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Email configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
    from: {
      email: process.env.FROM_EMAIL || 'noreply@mycitykg.com',
      name: process.env.FROM_NAME || 'MyCityKg',
    },
  },

  // Google Maps configuration
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
  },

  // OpenWeatherMap configuration
  openWeather: {
    apiKey: process.env.OPENWEATHER_API_KEY,
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp',
    ],
    uploadDir: path.join(__dirname, '../../uploads'),
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3002'],
  },

  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
  },

  // Admin configuration
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@mycitykg.com',
    password: process.env.ADMIN_PASSWORD || 'admin123456',
  },

  // Webhook configuration
  webhooks: {
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID,
    },
  },

  // Third-party services
  services: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
    },
    analytics: {
      id: process.env.ANALYTICS_ID,
    },
  },

  // Application constants
  constants: {
    reportCategories: [
      'road',
      'lighting',
      'waste',
      'park',
      'building',
      'water',
      'transport',
      'other',
    ],
    reportPriorities: ['low', 'medium', 'high', 'critical'],
    reportStatuses: ['new', 'in_progress', 'resolved', 'rejected'],
    volunteerTaskTypes: [
      'cleaning',
      'repair',
      'painting',
      'planting',
      'monitoring',
      'education',
      'other',
    ],
    volunteerStatuses: ['active', 'pending', 'completed', 'cancelled'],
    userRoles: ['user', 'volunteer', 'moderator', 'admin'],
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Cache configuration
  cache: {
    ttl: 300, // 5 minutes
    maxKeys: 1000,
  },

  // Validation configuration
  validation: {
    maxTitleLength: 200,
    maxDescriptionLength: 1000,
    minTitleLength: 5,
    minDescriptionLength: 10,
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && config.nodeEnv === 'production') {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = config;
