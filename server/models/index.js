const sequelize = require('./database');

// Import all models
const SiteConfig = require('./SiteConfig');
const Navbar = require('./Navbar');
const Product = require('./Product');
const User = require('./User');
const FooterSettings = require('./FooterSettings');
const ShopDetails = require('./ShopDetails');
const Blog = require('./Blog');
const ContactDetails = require('./ContactDetails');
const ContactInquiry = require('./ContactInquiry');

// Sync database (create tables automatically)
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
    console.log('Database synchronized successfully!');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

// Export models and sync function
module.exports = {
  sequelize,
  SiteConfig,
  Navbar,
  Product,
  User,
  FooterSettings,
  ShopDetails,
  Blog,
  ContactDetails,
  ContactInquiry,
  syncDatabase
};