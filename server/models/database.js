const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbHost = (process.env.DB_HOST || '127.0.0.1').toLowerCase() === 'localhost'
  ? '127.0.0.1'
  : process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'dharti_oil',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    ...(process.env.DB_SSL === 'true' && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: true, // More secure, requires CA match
          ca: process.env.DB_CA_CERT ? [fs.readFileSync(path.join(__dirname, '..', process.env.DB_CA_CERT))] : undefined
        }
      }
    })
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to MySQL database with Sequelize!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

module.exports = sequelize;