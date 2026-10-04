const { OilCakePrice, OilCakeRequest, User } = require('../models');

// GET current oil cake price (public)
const getOilCakePrice = async (req, res) => {
  try {
    let priceRecord = await OilCakePrice.findOne({ where: { id: 1 } });
    if (!priceRecord) {
      priceRecord = await OilCakePrice.create({ id: 1, price_per_kg: 0, min_quantity_kg: 20, is_available: false });
    }
    res.json(priceRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT update oil cake price (admin)
const updateOilCakePrice = async (req, res) => {
  try {
    const { price_per_kg, min_quantity_kg, is_available } = req.body;
    let priceRecord = await OilCakePrice.findOne({ where: { id: 1 } });
    if (!priceRecord) {
      priceRecord = await OilCakePrice.create({
        id: 1, price_per_kg,
        min_quantity_kg: min_quantity_kg || 20,
        is_available: is_available !== undefined ? is_available : true
      });
    } else {
      await priceRecord.update({
        price_per_kg: price_per_kg !== undefined ? price_per_kg : priceRecord.price_per_kg,
        min_quantity_kg: min_quantity_kg !== undefined ? min_quantity_kg : priceRecord.min_quantity_kg,
        is_available: is_available !== undefined ? is_available : priceRecord.is_available
      });
    }
    res.json({ message: 'Oil cake price updated successfully.', priceRecord });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST create oil cake request (user)
const createOilCakeRequest = async (req, res) => {
  try {
    const { user_id, quantity_kg, delivery_address, contact_number, notes } = req.body;
    if (!user_id || !quantity_kg || !contact_number) {
      return res.status(400).json({ message: 'Missing required fields (User ID, Quantity, or Contact Number).' });
    }

    const priceRecord = await OilCakePrice.findOne({ where: { id: 1 } });
    if (!priceRecord || !priceRecord.is_available) {
      return res.status(400).json({ message: 'Oil Cake is not available for purchase right now.' });
    }

    const minQty = parseFloat(priceRecord.min_quantity_kg) || 20;
    if (parseFloat(quantity_kg) < minQty) {
      return res.status(400).json({ message: `Minimum order quantity is ${minQty} KG.` });
    }

    const price_per_kg = parseFloat(priceRecord.price_per_kg);
    const total_amount = price_per_kg * parseFloat(quantity_kg);

    const request = await OilCakeRequest.create({
      user_id,
      quantity_kg: parseFloat(quantity_kg),
      price_per_kg,
      total_amount,
      delivery_address,
      contact_number,
      notes: notes || null,
      status: 'Pending'
    });

    res.json({ message: 'Oil cake purchase request submitted successfully!', request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET oil cake requests for a user
const getUserOilCakeRequests = async (req, res) => {
  try {
    const requests = await OilCakeRequest.findAll({
      where: { user_id: req.params.user_id },
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all oil cake requests (admin)
const getAdminOilCakeRequests = async (req, res) => {
  try {
    const requests = await OilCakeRequest.findAll({
      include: [{ model: User, as: 'user', attributes: ['username', 'emali', 'moblie_no'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT update oil cake request status (admin)
const updateOilCakeRequestStatus = async (req, res) => {
  try {
    const { status, admin_note } = req.body;
    const request = await OilCakeRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    await request.update({ status, admin_note: admin_note || request.admin_note });
    res.json({ message: 'Status updated successfully.', request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getOilCakePrice,
  updateOilCakePrice,
  createOilCakeRequest,
  getUserOilCakeRequests,
  getAdminOilCakeRequests,
  updateOilCakeRequestStatus
};
