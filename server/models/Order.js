const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
    defaultValue: 'Pending',
  },
  shipping_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  contact_number: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'orders',
  timestamps: true,
});

module.exports = Order;
