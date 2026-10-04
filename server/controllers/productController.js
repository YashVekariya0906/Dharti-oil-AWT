const { Product } = require('../models');

// GET all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST add a new product
const createProduct = async (req, res) => {
  try {
    const { product_name, product_quantity, product_description, product_price, product_discount } = req.body;

    const qty = product_quantity ? parseInt(product_quantity) : 0;
    const price = product_price ? parseFloat(product_price) : 0;
    const discount = product_discount ? parseFloat(product_discount) : 0;

    const product_image = req.file ? ('http://localhost:5000/uploads/products/' + req.file.filename) : null;

    const product = await Product.create({
      product_name: product_name || '',
      product_quantity: qty,
      product_description: product_description || '',
      product_price: price,
      product_discount: discount,
      product_image: product_image
    });

    res.status(201).json({ message: 'Product added successfully', product_id: product.product_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update a product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, product_quantity, product_description, product_price, product_discount, existing_image } = req.body;

    const qty = product_quantity ? parseInt(product_quantity) : 0;
    const price = product_price ? parseFloat(product_price) : 0;
    const discount = product_discount ? parseFloat(product_discount) : 0;

    const product_image = req.file ? ('http://localhost:5000/uploads/products/' + req.file.filename) : (existing_image || null);

    await Product.update({
      product_name: product_name || '',
      product_quantity: qty,
      product_description: product_description || '',
      product_price: price,
      product_discount: discount,
      product_image: product_image
    }, {
      where: { product_id: id }
    });

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.destroy({
      where: { product_id: id }
    });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllProducts, createProduct, updateProduct, deleteProduct };
