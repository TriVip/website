const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { dbAll, dbGet, runInTransaction } = require('../config/database');

const router = express.Router();

const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RP${timestamp.slice(-6)}${random}`;
};

const parseFirstImage = (imageJson) => {
  try {
    const images = JSON.parse(imageJson || '[]');
    return images.length > 0 ? images[0] : null;
  } catch (error) {
    return null;
  }
};

const getOrderItems = async (orderId) => {
  const rows = await dbAll(
    `SELECT oi.*, p.name AS product_name, p.image_urls
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  return rows.map((item) => ({
    id: item.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.price_at_purchase,
    product_name: item.product_name,
    product_image: parseFirstImage(item.image_urls)
  }));
};

// POST /api/orders - Create new order
router.post('/', [
  body('customer_name').notEmpty().trim().isLength({ min: 2, max: 255 }),
  body('customer_email').isEmail().normalizeEmail(),
  body('customer_phone').notEmpty().trim().isLength({ min: 10, max: 20 }),
  body('shipping_address').notEmpty().trim().isLength({ min: 10 }),
  body('items').isArray({ min: 1 }),
  body('items.*.product_id').isInt({ min: 1 }),
  body('items.*.quantity').isInt({ min: 1 }),
  body('payment_method').optional().isString().trim(),
  body('notes').optional().isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      items,
      payment_method = 'qr_code',
      notes
    } = req.body;

    const order = await runInTransaction(async (tx) => {
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        const product = await tx.get(
          'SELECT id, name, price, stock_quantity FROM products WHERE id = ? AND is_active = 1',
          [item.product_id]
        );

        if (!product) {
          const error = new Error(`Product with ID ${item.product_id} not found`);
          error.statusCode = 400;
          throw error;
        }

        if (product.stock_quantity < item.quantity) {
          const error = new Error(`Insufficient stock for product: ${product.name}`);
          error.statusCode = 400;
          throw error;
        }

        const itemTotal = Number(product.price) * item.quantity;
        totalAmount += itemTotal;

        validatedItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: product.price
        });
      }

      const orderNumber = generateOrderNumber();

      const createOrderResult = await tx.run(
        `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone,
         shipping_address, total_amount, payment_method, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          orderNumber,
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          totalAmount,
          payment_method,
          notes || null
        ]
      );

      const orderId = createOrderResult.lastID;

      for (const item of validatedItems) {
        await tx.run(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price_at_purchase]
        );

        await tx.run(
          'UPDATE products SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      return tx.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    });

    const orderItems = await getOrderItems(order.id);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        ...order,
        items: orderItems
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: statusCode === 500 ? 'Failed to create order' : error.message,
      message: statusCode === 500 ? error.message : undefined
    });
  }
});

// GET /api/orders/:orderNumber - Get order by order number
router.get('/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await dbGet('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await getOrderItems(order.id);

    res.json({
      ...order,
      items
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET /api/orders - Get orders by email (for customer lookup)
router.get('/', [
  query('email').isEmail().withMessage('Valid email is required').normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const orders = await dbAll(
      'SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC',
      [email]
    );

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => ({
        ...order,
        items: await getOrderItems(order.id)
      }))
    );

    res.json(ordersWithItems);

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
