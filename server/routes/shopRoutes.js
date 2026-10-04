const express = require('express');
const router = express.Router();
const { getShopDetails, updateShopDetails } = require('../controllers/shopController');

// GET /api/shop-details
router.get('/', getShopDetails);

// POST /api/shop-details/update
router.post('/update', updateShopDetails);

module.exports = router;
