const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const FooterSettings = sequelize.define('FooterSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  facebook_link: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  instagram_link: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  home_link: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  shop_link: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  about_link: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  contact_link: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  blog_link: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  privacy_policy_link: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  return_exchange_link: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  working_days: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  working_hours: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'footer_settings',
  timestamps: false
});

module.exports = FooterSettings;