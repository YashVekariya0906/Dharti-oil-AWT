const { SiteConfig } = require('../models');

// GET website configuration
const getConfig = async (req, res) => {
  try {
    const config = await SiteConfig.findOne();
    if (config) {
      res.json(config.toJSON());
    } else {
      res.status(404).json({ message: 'Configuration not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getConfig };
