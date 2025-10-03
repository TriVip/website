const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const router = express.Router();

// Helper function to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RP${timestamp.slice(-6)}${random}`;
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

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Validate products and calculate total
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of items) {
        const productResult = await client.query(
          'SELECT id, name, price, stock_quantity FROM products WHERE id = $1 AND is_active = true',
          [item.product_id]
        );

        if (productResult.rows.length === 0) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }

        const product = productResult.rows[0];
        
        if (product.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        validatedItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: product.price,
          product_name: product.name
        });
      }

      // Generate order number
      const orderNumber = generateOrderNumber();

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, 
         shipping_address, total_amount, payment_method, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
         RETURNING *`,
        [orderNumber, customer_name, customer_email, customer_phone, 
         shipping_address, totalAmount, payment_method, notes]
      );

      const order = orderResult.rows[0];

      // Create order items and update stock
      for (const item of validatedItems) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
          [order.id, item.product_id, item.quantity, item.price_at_purchase]
        );

        // Update stock quantity
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      await client.query('COMMIT');

      // Get order with items for response
      const orderWithItems = await pool.query(
        `SELECT o.*, 
         json_agg(
           json_build_object(
             'id', oi.id,
             'product_id', oi.product_id,
             'quantity', oi.quantity,
             'price_at_purchase', oi.price_at_purchase,
             'product_name', p.name,
             'product_image', p.image_urls[1]
           )
         ) as items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE o.id = $1
         GROUP BY o.id`,
        [order.id]
      );

      res.status(201).json({
        message: 'Order created successfully',
        order: orderWithItems.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      message: error.message 
    });
  }
});

// GET /api/orders/:orderNumber - Get order by order number
router.get('/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const result = await pool.query(
      `SELECT o.*, 
       json_agg(
         json_build_object(
           'id', oi.id,
           'product_id', oi.product_id,
           'quantity', oi.quantity,
           'price_at_purchase', oi.price_at_purchase,
           'product_name', p.name,
           'product_image', p.image_urls[1]
         )
       ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.order_number = $1
       GROUP BY o.id`,
      [orderNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET /api/orders - Get orders by email (for customer lookup)
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const result = await pool.query(
      `SELECT o.*, 
       json_agg(
         json_build_object(
           'id', oi.id,
           'product_id', oi.product_id,
           'quantity', oi.quantity,
           'price_at_purchase', oi.price_at_purchase,
           'product_name', p.name,
           'product_image', p.image_urls[1]
         )
       ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.customer_email = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [email]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
