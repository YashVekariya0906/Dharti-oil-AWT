const express = require('express');
const router = express.Router();
const { getFooter, updateFooter } = require('../controllers/footerController');

// GET /api/footer
router.get('/', getFooter);

// POST /api/footer/update
router.post('/update', updateFooter);

module.exports = router;
