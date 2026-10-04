const express = require('express');
const router = express.Router();
const { getInvoiceSettings, updateInvoiceSettings } = require('../controllers/invoiceController');

// GET /api/invoice-settings
router.get('/', getInvoiceSettings);

// POST /api/admin/invoice-settings
router.post('/admin', updateInvoiceSettings);

module.exports = router;
