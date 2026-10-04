const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const SiteConfig = sequelize.define('SiteConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  logo_text: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  logo_highlight: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  welcome_message: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  discover_text: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'site_config',
  timestamps: false
});

module.exports = SiteConfig;