const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  product_quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  product_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  product_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  product_discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  product_image: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'products',
  timestamps: false
});

module.exports = Product;