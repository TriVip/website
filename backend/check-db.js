const { dbAll, dbGet } = require('./config/database');

async function checkDatabase() {
  try {
    console.log('📊 Checking database...');

    // Check tables
    const tables = await dbAll('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('📋 Tables found:', tables.map(t => t.name));

    // Check admin user
    const adminUser = await dbGet('SELECT * FROM admin_users WHERE email = ?', ['admin@rareparfume.com']);
    if (adminUser) {
      console.log('✅ Admin user exists');
    } else {
      console.log('❌ Admin user not found');
    }

    // Check sample data
    const products = await dbAll('SELECT COUNT(*) as count FROM products');
    console.log('📦 Products count:', products[0].count);

    const orders = await dbAll('SELECT COUNT(*) as count FROM orders');
    console.log('📋 Orders count:', orders[0].count);

  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkDatabase();
