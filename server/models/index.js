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
const Broker = require('./Broker');
const SellingRequest = require('./SellingRequest');
const GlobalPrice = require('./GlobalPrice');

// Define Relationships
// SellingRequest belongs to User
SellingRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(SellingRequest, { foreignKey: 'user_id', as: 'selling_requests' });

// SellingRequest belongs to Broker (User table as broker now)
SellingRequest.belongsTo(User, { foreignKey: 'broker_id', as: 'broker' });
User.hasMany(SellingRequest, { foreignKey: 'broker_id', as: 'broker_requests' });

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
  Broker,
  SellingRequest,
  GlobalPrice,
  syncDatabase
};