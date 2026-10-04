const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Navbar = sequelize.define('Navbar', {
  nav_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nav_logo_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  I1_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  I2_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  I3_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  I4_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  I5_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  intro_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'navbar',
  timestamps: false
});

module.exports = Navbar;