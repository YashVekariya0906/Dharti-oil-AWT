const express = require('express');
const router = express.Router();
const { getDeliveryCharge, updateDeliveryCharge } = require('../controllers/deliveryController');

// GET /api/delivery-charge
router.get('/delivery-charge', getDeliveryCharge);

// POST /api/admin/delivery-charge
router.post('/admin/delivery-charge', updateDeliveryCharge);

module.exports = router;
