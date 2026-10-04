const { GlobalPrice } = require('../models');

// GET global price
const getGlobalPrice = async (req, res) => {
  try {
    let globalPrice = await GlobalPrice.findOne();
    if (!globalPrice) {
      globalPrice = await GlobalPrice.create({ current_price: 0 });
    }
    res.json(globalPrice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST update global price
const updateGlobalPrice = async (req, res) => {
  try {
    const { current_price } = req.body;

    if (!current_price && current_price !== 0) {
      console.log(' Current price is required');
      return res.status(400).json({ message: 'Current price is required' });
    }

    console.log('  Updating global price to:', current_price);

    let globalPrice = await GlobalPrice.findOne();
    if (globalPrice) {
      await GlobalPrice.update({ current_price }, { where: { id: globalPrice.id } });
      console.log(' Global price updated');
    } else {
      globalPrice = await GlobalPrice.create({ current_price });
      console.log(' Global price created');
    }

    const updated = await GlobalPrice.findOne();
    res.json({ message: 'Global Price updated successfully!', globalPrice: updated });
  } catch (error) {
    console.error(' Error updating global price:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getGlobalPrice, updateGlobalPrice };
