const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// Use the same path as in database config
const dbPath = path.join(__dirname, 'src', 'database.sqlite');
console.log('Creating database at:', dbPath);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log
});

// Simple Category model
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nameKy: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nameEn: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: 'categories',
  timestamps: true
});

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

async function createDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');
    
    console.log('Syncing database...');
    await sequelize.sync({ force: true });
    console.log('Database synced successfully.');
    
    console.log('Creating categories...');
    for (const categoryData of categories) {
      await Category.create(categoryData);
      console.log(`Created category: ${categoryData.name}`);
    }
    
    console.log('Database creation completed successfully');
    await sequelize.close();
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  }
}

createDatabase();
