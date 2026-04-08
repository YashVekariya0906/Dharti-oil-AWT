const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const OilCakePrice = sequelize.define('OilCakePrice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  price_per_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  min_quantity_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 20
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'oil_cake_price',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = OilCakePrice;
