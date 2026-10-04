const express = require('express');
const router = express.Router();
const { placeOrder, getAdminOrders, updateOrderStatus, getUserOrders } = require('../controllers/orderController');

// POST /api/orders
router.post('/', placeOrder);

// GET /api/admin/orders
router.get('/admin', getAdminOrders);

// PUT /api/admin/orders/:id/status
router.put('/admin/:id/status', updateOrderStatus);

// GET /api/users/:id/orders
router.get('/users/:id', getUserOrders);

module.exports = router;
