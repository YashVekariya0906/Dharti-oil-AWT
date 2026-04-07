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
const AboutUs = require('./AboutUs');
const AboutUsMember = require('./AboutUsMember');

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
  // First try alter mode (updates existing schemas)
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully (alter mode)!');
    return;
  } catch (alterError) {
    console.warn('Alter sync failed (likely ER_TOO_MANY_KEYS on existing table). Falling back to basic sync...');
  }

  // Fallback: basic sync — creates any new tables that don't exist yet,
  // but does NOT alter existing tables (safe for production data)
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully (basic mode — new tables created)!');
  } catch (syncError) {
    console.error('Error synchronizing database (basic mode):', syncError.message);
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
  AboutUs,
  AboutUsMember,
  syncDatabase
};