const { ShopDetails } = require('../models');

// GET shop details
const getShopDetails = async (req, res) => {
  try {
    const shopDetails = await ShopDetails.findOne();
    if (shopDetails) {
      res.json(shopDetails.toJSON());
    } else {
      res.status(404).json({ message: 'Shop details not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST update shop details
const updateShopDetails = async (req, res) => {
  try {
    const {
      main_title, main_description, product_highlights,
      tin15_title, tin15_description, can15_title, can15_description,
      can5_title, can5_description, bottle1_title, bottle1_description,
      quality_description, usage_description, why_choose
    } = req.body;

    const existingShopDetails = await ShopDetails.findOne();

    if (existingShopDetails) {
      await ShopDetails.update({
        main_title, main_description, product_highlights,
        tin15_title, tin15_description, can15_title, can15_description,
        can5_title, can5_description, bottle1_title, bottle1_description,
        quality_description, usage_description, why_choose
      }, {
        where: { id: existingShopDetails.id }
      });
      res.json({ message: 'Shop details updated successfully', id: existingShopDetails.id });
    } else {
      const newShopDetails = await ShopDetails.create({
        main_title, main_description, product_highlights,
        tin15_title, tin15_description, can15_title, can15_description,
        can5_title, can5_description, bottle1_title, bottle1_description,
        quality_description, usage_description, why_choose
      });
      res.json({ message: 'Shop details created successfully', id: newShopDetails.id });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getShopDetails, updateShopDetails };
