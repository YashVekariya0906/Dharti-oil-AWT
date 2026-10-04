const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const AboutUs = sequelize.define('AboutUs', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  company_intro: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  about_banner_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  about_intro_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  infra_title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'Infrastructure'
  },
  infra_description: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  infra_image_1: { type: DataTypes.STRING(500), allowNull: true },
  infra_image_2: { type: DataTypes.STRING(500), allowNull: true },
  infra_image_3: { type: DataTypes.STRING(500), allowNull: true },
  infra_image_4: { type: DataTypes.STRING(500), allowNull: true },
  infra_image_5: { type: DataTypes.STRING(500), allowNull: true },
  infra_image_6: { type: DataTypes.STRING(500), allowNull: true },
  mgmt_title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'Management Behind Dharti Amrut'
  },
  faq_data: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      const raw = this.getDataValue('faq_data');
      try {
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    },
    set(value) {
      this.setDataValue('faq_data', JSON.stringify(value));
    }
  }
}, {
  tableName: 'about_us',
  timestamps: false
});

module.exports = AboutUs;
