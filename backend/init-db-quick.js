const { sequelize, Category } = require('./src/models');

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
  }
];

async function initDatabase() {
  try {
    console.log('Syncing database...');
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');

    console.log('Creating categories...');
    for (const categoryData of categories) {
      await Category.create(categoryData);
      console.log(`Created category: ${categoryData.name}`);
    }

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
