const { SiteConfig } = require('../models');

// GET website configuration
const getConfig = async (req, res) => {
  try {
    let config = await SiteConfig.findOne();
    if (!config) {
      try {
        config = await SiteConfig.create({
          logo_text: 'Dharti',
          logo_highlight: 'Amrut',
          welcome_message: 'Welcome to Dharti Amrut',
          discover_text: 'Discover the purest and natural oils for your health and cooking needs.'
        });
      } catch (createErr) {
        return res.json({
          logo_text: 'Dharti',
          logo_highlight: 'Amrut',
          welcome_message: 'Welcome to Dharti Amrut',
          discover_text: 'Discover the purest and natural oils for your health and cooking needs.'
        });
      }
    }
    res.json(config.toJSON ? config.toJSON() : config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getConfig };
