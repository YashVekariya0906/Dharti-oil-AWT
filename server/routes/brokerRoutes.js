const express = require('express');
const router = express.Router();
const {
  addBroker, getAllBrokers, deleteBroker, verifyBrokerOtp, updateBroker, getBrokersByPincode
} = require('../controllers/brokerController');

// POST /api/admin/brokers
router.post('/admin/brokers', addBroker);

// GET /api/admin/brokers
router.get('/admin/brokers', getAllBrokers);

// DELETE /api/admin/brokers/:id
router.delete('/admin/brokers/:id', deleteBroker);

// POST /api/admin/brokers/verify-otp
router.post('/admin/brokers/verify-otp', verifyBrokerOtp);

// PUT /api/admin/brokers/:id
router.put('/admin/brokers/:id', updateBroker);

// GET /api/brokers/by-pincode/:pincode
router.get('/brokers/by-pincode/:pincode', getBrokersByPincode);

module.exports = router;
