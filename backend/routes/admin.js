const express = require('express');
const { body, validationResult, query } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet } = require('../config/database');
const router = express.Router();

// Middleware to verify admin token
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify admin user exists and is active
    const { dbGet } = require('../config/database');
    const admin = await dbGet(
      'SELECT id, email, name, role FROM admin_users WHERE id = ? AND is_active = 1',
      [decoded.userId]
    );

    if (!admin) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/admin/login - Admin login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('✅ Request body parsed successfully');

    // Use SQLite database functions instead of pool.query
    console.log('🔍 Searching for admin user:', email);
    const admin = await dbGet(
      'SELECT id, email, password_hash, name, role FROM admin_users WHERE email = ? AND is_active = 1',
      [email]
    );
    console.log('📊 Admin found:', admin ? 'Yes' : 'No');

    if (!admin) {
      console.log('❌ Admin not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('🔑 Verifying password...');
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    console.log('✅ Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('🎫 Creating JWT token...');
    const token = jwt.sign(
      { userId: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'rare_parfume_jwt_secret_2024',
      { expiresIn: '24h' }
    );
    console.log('✅ Token created, length:', token.length);

    console.log('📤 Sending response...');
    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('❌ Error during admin login:', error.message);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Apply admin middleware to all routes below (except login)
router.use('/dashboard', verifyAdminToken);
router.use('/orders', verifyAdminToken);
router.use('/products', verifyAdminToken);
router.use('/profile', verifyAdminToken);

// GET /api/admin/orders - Get all orders
router.get('/orders', [
  query('status').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    // Get admin user info
    const adminUser = req.admin;

    // Use SQLite database functions
    const { dbAll } = require('../config/database');

    let whereClause = '';
    const queryParams = [];

    if (status) {
      whereClause = 'WHERE o.status = ?';
      queryParams.push(status);
    }

    const offset = (page - 1) * limit;
    queryParams.push(limit, offset);

    // Get orders with items
    const ordersQuery = `
      SELECT o.*,
             '[' || GROUP_CONCAT(
               '{"id":' || oi.id || ',"product_id":' || oi.product_id || ',"quantity":' || oi.quantity || ',"price_at_purchase":' || oi.price_at_purchase || ',"product_name":"' || IFNULL(p.name, '') || '","product_image":"' || IFNULL(p.image_urls, '') || '"}'
             ) || ']' as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const orders = await dbAll(ordersQuery, queryParams);

    // Parse items JSON for each order
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: order.items ? JSON.parse(order.items) : []
    }));

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM orders ${whereClause}`;
    const countParams = status ? [status] : [];
    const countResult = await dbAll(countQuery, countParams);
    const totalCount = countResult[0].count;

    res.json({
      orders: ordersWithItems,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / limit),
        total_count: totalCount,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT /api/admin/orders/:id - Update order status
router.put('/orders/:id', [
  body('status').isIn(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Use SQLite database functions
    const { dbRun, dbGet } = require('../config/database');

    const result = await dbRun(
      'UPDATE orders SET status = ?, updated_at = datetime("now") WHERE id = ?',
      [status, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get updated order
    const updatedOrder = await dbGet('SELECT * FROM orders WHERE id = ?', [id]);

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// GET /api/admin/products - Get all products for admin
router.get('/products', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Get admin user info
    const adminUser = req.admin;

    // Use SQLite database functions
    const { dbAll } = require('../config/database');

    const offset = (page - 1) * limit;

    const products = await dbAll(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const countResult = await dbAll('SELECT COUNT(*) as count FROM products');
    const totalCount = countResult[0].count;

    res.json({
      products: products,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / limit),
        total_count: totalCount,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/admin/products - Create new product
router.post('/products', [
  body('name').notEmpty().trim().isLength({ min: 2, max: 255 }),
  body('brand').notEmpty().trim().isLength({ min: 2, max: 100 }),
  body('description').notEmpty().trim(),
  body('price').isFloat({ min: 0 }),
  body('stock_quantity').isInt({ min: 0 }),
  body('volume_ml').isInt({ min: 1 }),
  body('category').optional().isString().trim(),
  body('is_featured').optional().isBoolean(),
  body('scent_notes').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      brand,
      description,
      price,
      image_urls = [],
      stock_quantity,
      scent_notes = {},
      volume_ml,
      category = 'perfume',
      is_featured = false
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products (name, brand, description, price, image_urls, stock_quantity, 
       scent_notes, volume_ml, category, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, brand, description, price, image_urls, stock_quantity, 
       JSON.stringify(scent_notes), volume_ml, category, is_featured]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/admin/products/:id - Update product
router.put('/products/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 255 }),
  body('brand').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('stock_quantity').optional().isInt({ min: 0 }),
  body('volume_ml').optional().isInt({ min: 1 }),
  body('category').optional().isString().trim(),
  body('is_featured').optional().isBoolean(),
  body('is_active').optional().isBoolean(),
  body('scent_notes').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateFields = req.body;

    // Build dynamic query
    const setClause = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        paramCount++;
        setClause.push(`${key} = $${paramCount}`);
        
        if (key === 'scent_notes') {
          values.push(JSON.stringify(updateFields[key]));
        } else {
          values.push(updateFields[key]);
        }
      }
    });

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    paramCount++;
    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `UPDATE products SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product deleted successfully',
      product: result.rows[0]
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get admin user info
    const adminUser = req.admin;
    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM products WHERE is_active = true'),
      pool.query('SELECT COUNT(*) FROM orders'),
      pool.query('SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != \'cancelled\''),
      pool.query(`
        SELECT o.*, 
        json_agg(
          json_build_object(
            'product_name', p.name,
            'quantity', oi.quantity,
            'price_at_purchase', oi.price_at_purchase
          )
        ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 5
      `)
    ]);

    res.json({
      stats: {
        total_products: parseInt(totalProducts.rows[0].count),
        total_orders: parseInt(totalOrders.rows[0].count),
        total_revenue: parseFloat(totalRevenue.rows[0].coalesce)
      },
      recent_orders: recentOrders.rows,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
