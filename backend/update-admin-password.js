require('dotenv').config();
const bcrypt = require('bcryptjs');
const { dbRun } = require('./config/database');

async function updateAdminPassword() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rareparfume.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Update admin user password
    const result = await dbRun(
      'UPDATE admin_users SET password_hash = ? WHERE email = ?',
      [passwordHash, adminEmail]
    );

    if (result.changes > 0) {
      console.log(`✅ Admin password updated successfully!`);
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
    } else {
      console.log(`❌ No admin user found with email: ${adminEmail}`);
    }

  } catch (error) {
    console.error('❌ Error updating admin password:', error);
    process.exit(1);
  }
}

// Run the script
updateAdminPassword();
