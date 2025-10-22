const { Sequelize } = require('sequelize');
const config = require('../config/database');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions || {}
  }
);

// Import models
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Report = require('./Report')(sequelize, Sequelize.DataTypes);
const VolunteerTask = require('./VolunteerTask')(sequelize, Sequelize.DataTypes);
const Category = require('./Category')(sequelize, Sequelize.DataTypes);
const Comment = require('./Comment')(sequelize, Sequelize.DataTypes);

// Define associations
const db = {
  sequelize,
  Sequelize,
  User,
  Report,
  VolunteerTask,
  Category,
  Comment
};

// User associations
User.hasMany(Report, { foreignKey: 'userId', as: 'reports' });
User.hasMany(VolunteerTask, { foreignKey: 'createdBy', as: 'createdTasks' });
User.hasMany(VolunteerTask, { foreignKey: 'assignedTo', as: 'assignedTasks' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });

// Report associations
Report.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Report.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Report.hasMany(Comment, { foreignKey: 'reportId', as: 'comments' });

// VolunteerTask associations
VolunteerTask.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
VolunteerTask.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
VolunteerTask.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Category associations
Category.hasMany(Report, { foreignKey: 'categoryId', as: 'reports' });
Category.hasMany(VolunteerTask, { foreignKey: 'categoryId', as: 'tasks' });

// Comment associations
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Comment.belongsTo(Report, { foreignKey: 'reportId', as: 'report' });

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connection has been established successfully.');
  } catch (error) {
    logger.error('Unable to connect to PostgreSQL database:', error);
    throw error;
  }
};

// Sync database (only in development)
const syncDatabase = async (force = false) => {
  try {
    if (env === 'development') {
      await sequelize.sync({ force });
      logger.info('Database synchronized successfully.');
    }
  } catch (error) {
    logger.error('Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  ...db,
  testConnection,
  syncDatabase
};
