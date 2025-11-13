require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet } = require('./config/database');

async function debugLogin() {
  try {
    console.log('🔍 Debugging admin login...');

    // Test database connection
    console.log('📊 Testing database connection...');
    const admin = await dbGet(
      'SELECT id, email, password_hash, name, role FROM admin_users WHERE email = ? AND is_active = 1',
      ['admin@rareparfume.com']
    );

    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:', admin.email);

    // Test password verification
    console.log('🔑 Testing password verification...');
    const isValidPassword = await bcrypt.compare('admin123', admin.password_hash);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Password verification failed');
      return;
    }

    // Test JWT token creation
    console.log('🎫 Testing JWT token creation...');
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    console.log('JWT Secret: Set');

    const token = jwt.sign(
      { userId: admin.id, email: admin.email },
      secret,
      { expiresIn: '24h' }
    );

    console.log('✅ JWT token created successfully');
    console.log('Token length:', token.length);

  } catch (error) {
    console.error('❌ Error during debug:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugLogin();
