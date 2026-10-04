const { Order, OrderItem, Product, User } = require('../models');

// POST place a new order (user)
const placeOrder = async (req, res) => {
  try {
    const { user_id, items, total_amount, shipping_address, contact_number, payment_method, delivery_charge, cgst, sgst } = req.body;

    if (!user_id || !items || items.length === 0 || !total_amount) {
      return res.status(400).json({ message: 'Missing required order details' });
    }

    const order = await Order.create({
      user_id,
      total_amount,
      shipping_address: shipping_address || '',
      contact_number: contact_number || '',
      payment_method: payment_method || 'COD',
      delivery_charge: delivery_charge || 0,
      cgst: cgst || 0,
      sgst: sgst || 0
    });

    const orderItemsData = items.map(item => ({
      order_id: order.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.product_price
    }));

    await OrderItem.bulkCreate(orderItemsData);

    res.status(201).json({ message: 'Order placed successfully!', order_id: order.order_id });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET all orders (admin)
const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'user', attributes: { exclude: ['password'] } },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await Order.update({ status }, { where: { order_id: id } });
    res.json({ message: `Order status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET user orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.params.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { placeOrder, getAdminOrders, updateOrderStatus, getUserOrders };
