const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const DeliveryCharge = sequelize.define('DeliveryCharge', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  charge_360001: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  charge_360002: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  charge_360003: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  charge_360004: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  upi_id: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  }
}, {
  tableName: 'delivery_charge',
  timestamps: true,
});

module.exports = DeliveryCharge;
