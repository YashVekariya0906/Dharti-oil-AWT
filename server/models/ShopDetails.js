const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const ShopDetails = sequelize.define('ShopDetails', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  main_title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  main_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  product_highlights: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tin15_title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tin15_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  can15_title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  can15_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  can5_title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  can5_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bottle1_title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  bottle1_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quality_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usage_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  why_choose: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'shop_details',
  timestamps: false
});

module.exports = ShopDetails;