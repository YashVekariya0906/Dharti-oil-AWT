const { FooterSettings } = require('../models');

// GET footer data
const getFooter = async (req, res) => {
  try {
    const footer = await FooterSettings.findOne();
    if (footer) {
      res.json(footer.toJSON());
    } else {
      res.status(404).json({ message: 'Footer config not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST update footer data
const updateFooter = async (req, res) => {
  try {
    const {
      company_name, address, phone, email, facebook_link, instagram_link,
      home_link, shop_link, about_link, contact_link, blog_link,
      privacy_policy_link, return_exchange_link, working_days, working_hours
    } = req.body;

    const existingFooter = await FooterSettings.findOne();

    if (existingFooter) {
      await FooterSettings.update({
        company_name, address, phone, email, facebook_link, instagram_link,
        home_link, shop_link, about_link, contact_link, blog_link,
        privacy_policy_link, return_exchange_link, working_days, working_hours
      }, {
        where: { id: existingFooter.id }
      });
      res.json({ message: 'Footer updated successfully', id: existingFooter.id });
    } else {
      const newFooter = await FooterSettings.create({
        company_name, address, phone, email, facebook_link, instagram_link,
        home_link, shop_link, about_link, contact_link, blog_link,
        privacy_policy_link, return_exchange_link, working_days, working_hours
      });
      res.json({ message: 'Footer created successfully', id: newFooter.id });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getFooter, updateFooter };
