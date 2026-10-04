const express = require('express');
const router = express.Router();
const { getGlobalPrice, updateGlobalPrice } = require('../controllers/globalPriceController');

// GET /api/admin/global-price
router.get('/admin/global-price', getGlobalPrice);

// POST /api/admin/global-price
router.post('/admin/global-price', updateGlobalPrice);

module.exports = router;
