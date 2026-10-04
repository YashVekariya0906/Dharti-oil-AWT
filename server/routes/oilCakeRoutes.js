const express = require('express');
const router = express.Router();
const {
  getOilCakePrice,
  updateOilCakePrice,
  createOilCakeRequest,
  getUserOilCakeRequests,
  getAdminOilCakeRequests,
  updateOilCakeRequestStatus
} = require('../controllers/oilCakeController');

// GET /api/oil-cake/price
router.get('/price', getOilCakePrice);

// PUT /api/admin/oil-cake/price
router.put('/admin/price', updateOilCakePrice);

// POST /api/oil-cake/requests
router.post('/requests', createOilCakeRequest);

// GET /api/oil-cake/requests/user/:user_id
router.get('/requests/user/:user_id', getUserOilCakeRequests);

// GET /api/admin/oil-cake/requests
router.get('/admin/requests', getAdminOilCakeRequests);

// PUT /api/admin/oil-cake/requests/:id/status
router.put('/admin/requests/:id/status', updateOilCakeRequestStatus);

module.exports = router;
