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
const OilCakePrice = require('./OilCakePrice');
const OilCakeRequest = require('./OilCakeRequest');

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

// OilCakeRequest Relationships
OilCakeRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(OilCakeRequest, { foreignKey: 'user_id', as: 'oil_cake_requests' });

// Sync database (create tables automatically)
const syncDatabase = async () => {
  // Manual migration for payment_proof column
  try {
    const [results] = await sequelize.query("SHOW COLUMNS FROM `selling_requests` LIKE 'payment_proof'");
    if (results.length === 0) {
      await sequelize.query("ALTER TABLE `selling_requests` ADD COLUMN `payment_proof` VARCHAR(255) NULL");
      console.log('Manually added payment_proof column to selling_requests table.');
    }
  } catch (err) {
    console.log('Manual column addition skipped or failed:', err.message);
  }

  // Manual creation of oil_cake_price table
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`oil_cake_price\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`price_per_kg\` DECIMAL(10,2) NOT NULL DEFAULT 0,
        \`min_quantity_kg\` DECIMAL(10,2) NOT NULL DEFAULT 20,
        \`is_available\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` DATETIME NOT NULL,
        \`updated_at\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('oil_cake_price table ensured.');
  } catch (err) {
    console.log('oil_cake_price table creation skipped:', err.message);
  }

  // Manual creation of oil_cake_requests table
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`oil_cake_requests\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`user_id\` INT NOT NULL,
        \`quantity_kg\` DECIMAL(10,2) NOT NULL,
        \`price_per_kg\` DECIMAL(10,2) NOT NULL,
        \`total_amount\` DECIMAL(10,2) NOT NULL,
        \`delivery_address\` TEXT NULL,
        \`contact_number\` VARCHAR(15) NOT NULL,
        \`notes\` TEXT NULL,
        \`status\` ENUM('Pending','Confirmed','Processing','Delivered','Cancelled','Rejected') NOT NULL DEFAULT 'Pending',
        \`admin_note\` TEXT NULL,
        \`created_at\` DATETIME NOT NULL,
        \`updated_at\` DATETIME NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`fk_oilcake_user\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('oil_cake_requests table ensured.');
  } catch (err) {
    console.log('oil_cake_requests table creation skipped:', err.message);
  }

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
  OilCakePrice,
  OilCakeRequest,
  syncDatabase
};