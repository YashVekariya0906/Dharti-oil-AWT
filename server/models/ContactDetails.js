const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const ContactDetails = sequelize.define('ContactDetails', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: true
  },
  facebook_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instagram_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  youtube_link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  banner_image: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'contact_details',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ContactDetails;
