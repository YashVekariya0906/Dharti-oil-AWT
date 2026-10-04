const express = require('express');
const router = express.Router();
const { getConfig } = require('../controllers/configController');

// GET /api/config
router.get('/', getConfig);

module.exports = router;
