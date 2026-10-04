const express = require('express');
const router = express.Router();
const { getAllProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { productUpload } = require('../config/multer');

// GET /api/products
router.get('/', getAllProducts);

// POST /api/products
router.post('/', productUpload.single('product_image'), createProduct);

// PUT /api/products/:id
router.put('/:id', productUpload.single('product_image'), updateProduct);

// DELETE /api/products/:id
router.delete('/:id', deleteProduct);

module.exports = router;
