const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const OilCakeRequest = sequelize.define('OilCakeRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Quantity in KG, minimum 20'
  },
  price_per_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Price per KG at time of request'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  delivery_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contact_number: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled', 'Rejected'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  admin_note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'oil_cake_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = OilCakeRequest;
