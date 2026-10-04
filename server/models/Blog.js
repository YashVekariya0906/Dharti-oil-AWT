const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  banner_image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Dharti Oil Team'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    allowNull: false,
    defaultValue: 'published'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'blog_details',
  timestamps: false // We're handling timestamps manually
});

module.exports = Blog;