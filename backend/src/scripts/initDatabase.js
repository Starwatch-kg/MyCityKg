const { sequelize, Category } = require('../models');
const logger = require('../utils/logger');

const categories = [
  {
    name: 'Дороги',
    nameKy: 'Жолдор',
    nameEn: 'Roads',
    description: 'Проблемы с дорогами, ямы, разметка',
    icon: 'road',
    color: '#FF6B6B',
    priority: 10
  },
  {
    name: 'Освещение',
    nameKy: 'Жарык',
    nameEn: 'Lighting',
    description: 'Проблемы с уличным освещением',
    icon: 'lightbulb',
    color: '#FFD93D',
    priority: 9
  },
  {
    name: 'Мусор',
    nameKy: 'Таштанды',
    nameEn: 'Waste',
    description: 'Проблемы с вывозом мусора, свалки',
    icon: 'trash',
    color: '#6BCF7F',
    priority: 8
  },
  {
    name: 'Парки',
    nameKy: 'Саякаттар',
    nameEn: 'Parks',
    description: 'Проблемы в парках и скверах',
    icon: 'tree',
    color: '#4ECDC4',
    priority: 7
  },
  {
    name: 'Здания',
    nameKy: 'Имараттар',
    nameEn: 'Buildings',
    description: 'Проблемы с жилыми и общественными зданиями',
    icon: 'building',
    color: '#45B7D1',
    priority: 6
  },
  {
    name: 'Водоснабжение',
    nameKy: 'Суу менен камсыздоо',
    nameEn: 'Water Supply',
    description: 'Проблемы с водоснабжением и канализацией',
    icon: 'water',
    color: '#96CEB4',
    priority: 5
  },
  {
    name: 'Транспорт',
    nameKy: 'Транспорт',
    nameEn: 'Transport',
    description: 'Проблемы с общественным транспортом',
    icon: 'bus',
    color: '#FFEAA7',
    priority: 4
  },
  {
    name: 'Другое',
    nameKy: 'Башка',
    nameEn: 'Other',
    description: 'Другие городские проблемы',
    icon: 'question',
    color: '#DDA0DD',
    priority: 1
  }
];

async function initDatabase() {
  try {
    logger.info('Initializing database...');
    
    // Sync database
    await sequelize.sync({ force: true });
    logger.info('Database synced successfully');
    
    // Create categories
    for (const categoryData of categories) {
      await Category.create(categoryData);
      logger.info(`Created category: ${categoryData.name}`);
    }
    
    logger.info('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
