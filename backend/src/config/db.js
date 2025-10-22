const { sequelize, testConnection, syncDatabase } = require('../models');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    // Test database connection
    await testConnection();
    logger.info('PostgreSQL connection has been established successfully.');

    // Sync database in development
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase();
      logger.info('Database synchronized successfully.');
    }

    return sequelize;
  } catch (error) {
    logger.error('Unable to connect to PostgreSQL database:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
