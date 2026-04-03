const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const SellingRequest = sequelize.define('SellingRequest', {
  request_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock_per_mound: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  our_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  customer_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  broker_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(
      'Pending', 'Accepted', 'Scheduled', 'Reached', 'Completed', 'Cancelled',
      'AdminRejected', 'BrokerRejected', 'BrokerRejectionConfirmed'
    ),
    allowNull: false,
    defaultValue: 'Pending'
  },
  visit_day: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  visit_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  reached_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_visited: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  delivered_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  broker_comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  final_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  sample_photos: {
    type: DataTypes.TEXT, // Store JSON string of URLs
    allowNull: true
  },
  // Admin rejection fields
  admin_reject_reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  admin_reject_comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Broker rejection fields
  broker_reject_reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  broker_reject_comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  broker_reject_photos: {
    type: DataTypes.TEXT, // JSON array of photo URLs
    allowNull: true
  }
}, {
  tableName: 'selling_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SellingRequest;
