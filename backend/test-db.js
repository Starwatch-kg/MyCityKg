const path = require('path');
const { Sequelize } = require('sequelize');

const dbPath = path.join(__dirname, 'src', 'database.sqlite');
console.log('Database path:', dbPath);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Create a simple table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    `);
    
    console.log('Test table created');
    
    // Insert test data
    await sequelize.query(`INSERT INTO test_table (name) VALUES ('test')`);
    
    // Query data
    const [results] = await sequelize.query('SELECT * FROM test_table');
    console.log('Test data:', results);
    
    await sequelize.close();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();
