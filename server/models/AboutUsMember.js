const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const AboutUsMember = sequelize.define('AboutUsMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  bio: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  member_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'about_us_members',
  timestamps: false
});

module.exports = AboutUsMember;
