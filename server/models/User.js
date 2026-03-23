const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  moblie_no: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  emali: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'user'
  },
  otp_code: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  otp_expiry: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'register',
  timestamps: false
});

module.exports = User;