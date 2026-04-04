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
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const DeliveryCharge = require('./DeliveryCharge');

// Define Relationships
// SellingRequest belongs to User
SellingRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(SellingRequest, { foreignKey: 'user_id', as: 'selling_requests' });

// SellingRequest belongs to Broker (User table as broker now)
SellingRequest.belongsTo(User, { foreignKey: 'broker_id', as: 'broker' });
User.hasMany(SellingRequest, { foreignKey: 'broker_id', as: 'broker_requests' });

// ContactInquiry belongs to User
ContactInquiry.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ContactInquiry, { foreignKey: 'user_id', as: 'contact_inquiries' });

// Order Relationships
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });

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
  Order,
  OrderItem,
  DeliveryCharge,
  syncDatabase
};