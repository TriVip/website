const express = require('express');
const { body, validationResult, query } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbAll, dbRun } = require('../config/database');
const router = express.Router();

const parseProduct = (product) => {
  if (!product) return null;

  const safeParse = (value, fallback) => {
    try {
      return JSON.parse(value || fallback);
    } catch (error) {
      return fallback === '[]' ? [] : {};
    }
  };

  return {
    ...product,
    image_urls: safeParse(product.image_urls, '[]'),
    scent_notes: safeParse(product.scent_notes, '{}'),
    is_featured: Boolean(product.is_featured),
    is_active: Boolean(product.is_active)
  };
};

const parseFirstImage = (imageJson) => {
  try {
    const images = JSON.parse(imageJson || '[]');
    return images.length > 0 ? images[0] : null;
  } catch (error) {
    return null;
  }
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT secret is not configured');
  }

  return secret;
};

const fetchOrderItems = async (orderId) => {
  const rows = await dbAll(
    `SELECT oi.*, p.name as product_name, p.image_urls
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

const requireRole = (...roles) => (req, res, next) => {
  const userRole = req.admin?.role;

  if (!userRole || !roles.includes(userRole)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  next();
};

// Middleware to verify admin token
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret);
    
    // Verify admin user exists and is active
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
    if (error.message === 'JWT secret is not configured') {
      console.error('JWT secret is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/admin/login - Admin login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const admin = await dbGet(
      'SELECT id, email, password_hash, name, role FROM admin_users WHERE email = ? AND is_active = 1',
      [email]
    );

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const jwtSecret = getJwtSecret();

    const token = jwt.sign(
      { userId: admin.id, email: admin.email },
      jwtSecret,
      { expiresIn: '24h' }
    );
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
    if (error.message === 'JWT secret is not configured') {
      console.error('JWT secret is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    console.error('❌ Error during admin login:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Apply admin middleware to all routes below (except login)
router.use('/dashboard', verifyAdminToken);
router.use('/orders', verifyAdminToken);
router.use('/products', verifyAdminToken);
router.use('/profile', verifyAdminToken);

// GET /api/admin/orders - Get all orders
router.get('/orders',
  requireRole('admin', 'sale'),
  [
  query('status').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
  ],
async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const adminUser = req.admin;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 20;
    const offset = (pageNumber - 1) * limitNumber;

    const filters = [];
    const filterParams = [];

    if (status) {
      filters.push('o.status = ?');
      filterParams.push(status);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const orders = await dbAll(
      `SELECT o.* FROM orders o ${whereClause} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...filterParams, limitNumber, offset]
    );

    const totalCountRow = await dbGet(
      `SELECT COUNT(*) as count FROM orders o ${whereClause}`,
      filterParams
    );

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => ({
        ...order,
        items: await fetchOrderItems(order.id)
      }))
    );

    const totalCount = Number(totalCountRow?.count || 0);

    res.json({
      orders: ordersWithItems,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      pagination: {
        current_page: pageNumber,
        total_pages: Math.ceil(totalCount / limitNumber),
        total_count: totalCount,
        limit: limitNumber
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT /api/admin/orders/:id - Update order status
router.put('/orders/:id',
  requireRole('admin', 'sale'),
  [
  body('status').isIn(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])
  ],
async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

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
router.get('/products',
  requireRole('admin'),
  [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
  ],
async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 20;

    // Get admin user info
    const adminUser = req.admin;

    const offset = (pageNumber - 1) * limitNumber;

    const productRows = await dbAll(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limitNumber, offset]
    );

    const countResult = await dbGet('SELECT COUNT(*) as count FROM products');
    const totalCount = countResult?.count || 0;

    res.json({
      products: productRows.map(parseProduct),
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      pagination: {
        current_page: pageNumber,
        total_pages: Math.ceil(totalCount / limitNumber),
        total_count: totalCount,
        limit: limitNumber
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/admin/products - Create new product
router.post('/products',
  requireRole('admin'),
  [
  body('name').notEmpty().trim().isLength({ min: 2, max: 255 }),
  body('brand').notEmpty().trim().isLength({ min: 2, max: 100 }),
  body('description').notEmpty().trim(),
  body('price').isFloat({ min: 0 }),
  body('stock_quantity').isInt({ min: 0 }),
  body('volume_ml').isInt({ min: 1 }),
  body('category').optional().isString().trim(),
  body('is_featured').optional().isBoolean(),
  body('scent_notes').optional().isObject()
  ],
async (req, res) => {
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

    const result = await dbRun(
      `INSERT INTO products (name, brand, description, price, image_urls, stock_quantity,
       scent_notes, volume_ml, category, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        brand,
        description,
        price,
        JSON.stringify(image_urls),
        stock_quantity,
        JSON.stringify(scent_notes),
        volume_ml,
        category,
        is_featured ? 1 : 0
      ]
    );

    const product = await dbGet('SELECT * FROM products WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Product created successfully',
      product: parseProduct(product)
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/admin/products/:id - Update product
router.put('/products/:id',
  requireRole('admin'),
  [
  body('name').optional().trim().isLength({ min: 2, max: 255 }),
  body('brand').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('image_urls').optional().isArray(),
  body('stock_quantity').optional().isInt({ min: 0 }),
  body('volume_ml').optional().isInt({ min: 1 }),
  body('category').optional().isString().trim(),
  body('is_featured').optional().isBoolean(),
  body('is_active').optional().isBoolean(),
  body('scent_notes').optional().isObject()
  ],
async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateFields = req.body;

    const allowedFieldTransformers = {
      name: (value) => value,
      brand: (value) => value,
      description: (value) => value,
      price: (value) => value,
      image_urls: (value) => JSON.stringify(value ?? []),
      stock_quantity: (value) => value,
      scent_notes: (value) => JSON.stringify(value ?? {}),
      volume_ml: (value) => value,
      category: (value) => value,
      is_featured: (value) => (value ? 1 : 0),
      is_active: (value) => (value ? 1 : 0)
    };

    const setClause = [];
    const values = [];

    Object.entries(allowedFieldTransformers).forEach(([field, transform]) => {
      if (!Object.prototype.hasOwnProperty.call(updateFields, field)) {
        return;
      }

      const rawValue = updateFields[field];

      if (rawValue === undefined) {
        return;
      }

      const processedValue = transform(rawValue);
      setClause.push(`${field} = ?`);
      values.push(processedValue);
    });

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE products SET ${setClause.join(', ')} WHERE id = ?`;

    const result = await dbRun(query, values);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = await dbGet('SELECT * FROM products WHERE id = ?', [id]);

    res.json({
      message: 'Product updated successfully',
      product: parseProduct(product)
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/products/:id', requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const product = await dbGet('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await dbRun('DELETE FROM products WHERE id = ?', [id]);

    res.json({
      message: 'Product deleted successfully',
      product: parseProduct(product)
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', requireRole('admin'), async (req, res) => {
  try {
    const adminUser = req.admin;

    const [totalProducts, totalOrders, totalRevenue] = await Promise.all([
      dbGet('SELECT COUNT(*) as count FROM products WHERE is_active = 1'),
      dbGet('SELECT COUNT(*) as count FROM orders'),
      dbGet("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'")
    ]);

    const recentOrderRows = await dbAll(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 5'
    );

    const recentOrders = await Promise.all(
      recentOrderRows.map(async (order) => {
        const items = await dbAll(
          `SELECT oi.*, p.name as product_name, p.image_urls
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id]
        );

        return {
          ...order,
          items: items.map((item) => ({
            product_name: item.product_name,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase,
            product_image: parseFirstImage(item.image_urls)
          }))
        };
      })
    );

    res.json({
      stats: {
        total_products: Number(totalProducts?.count || 0),
        total_orders: Number(totalOrders?.count || 0),
        total_revenue: Number(totalRevenue?.total || 0)
      },
      recent_orders: recentOrders,
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
