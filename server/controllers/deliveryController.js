const { DeliveryCharge } = require('../models');

// GET delivery charge (public)
const getDeliveryCharge = async (req, res) => {
  try {
    let charges = await DeliveryCharge.findOne();
    if (!charges) {
      charges = await DeliveryCharge.create({});
    }
    res.json(charges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST update delivery charge (admin)
const updateDeliveryCharge = async (req, res) => {
  try {
    const { charge_360001, charge_360002, charge_360003, charge_360004, upi_id } = req.body;
    let charges = await DeliveryCharge.findOne();
    if (charges) {
      await DeliveryCharge.update({
        charge_360001: charge_360001 || 0,
        charge_360002: charge_360002 || 0,
        charge_360003: charge_360003 || 0,
        charge_360004: charge_360004 || 0,
        upi_id: upi_id || ''
      }, { where: { id: charges.id } });
    } else {
      await DeliveryCharge.create({
        charge_360001: charge_360001 || 0,
        charge_360002: charge_360002 || 0,
        charge_360003: charge_360003 || 0,
        charge_360004: charge_360004 || 0,
        upi_id: upi_id || ''
      });
    }
    const updated = await DeliveryCharge.findOne();
    res.json({ message: 'Delivery properties updated successfully!', charges: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDeliveryCharge, updateDeliveryCharge };
