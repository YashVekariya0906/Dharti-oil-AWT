const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'dharti_oil',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Run the SQL initialisation script (CREATE TABLE IF NOT EXISTS + seed data).
// This is idempotent — safe to run on every startup.
const initializeDatabase = require('../scripts/initializeDatabase');

const testConnection = async () => {
  try {
    // Run schema + seed initialisation first, before Sequelize touches anything
    await initializeDatabase();
    await sequelize.authenticate();
    console.log('Connected to MySQL database with Sequelize!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

module.exports = sequelize;