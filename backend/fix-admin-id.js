require('dotenv').config();
const { dbRun, dbGet, dbAll } = require('./config/database');

async function fixAdminId() {
  try {
    console.log('🔍 Checking admin users...');
    
    // Get all admin users
    const admins = await dbAll('SELECT * FROM admin_users');
    console.log('Current admin users:', admins);
    
    // Check if any admin has null id
    const adminWithNullId = admins.find(admin => admin.id === null);
    
    if (adminWithNullId) {
      console.log('⚠️  Found admin user with null id:', adminWithNullId.email);
      
      // Delete the admin with null id
      console.log('🗑️  Deleting admin user with null id...');
      await dbRun('DELETE FROM admin_users WHERE id IS NULL');
      
      // Recreate admin user
      console.log('➕ Recreating admin user...');
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('admin123', 12);
      
      const result = await dbRun(
        `INSERT INTO admin_users (email, password_hash, name, role, is_active)
         VALUES (?, ?, ?, ?, ?)`,
        ['admin@rareparfume.com', passwordHash, 'Administrator', 'admin', 1]
      );
      
      console.log('✅ Admin user recreated with ID:', result.lastID);
      
      // Verify with explicit id selection
      const newAdmin = await dbGet(
        'SELECT id, email, name, role FROM admin_users WHERE email = ?',
        ['admin@rareparfume.com']
      );
      console.log('✅ Verified new admin:', {
        id: newAdmin?.id,
        idType: typeof newAdmin?.id,
        email: newAdmin?.email,
        name: newAdmin?.name,
        fullObject: JSON.stringify(newAdmin, null, 2)
      });
      
      // Try direct query to check
      const directQuery = await new Promise((resolve, reject) => {
        const sqlite3 = require('sqlite3').verbose();
        const db = new sqlite3.Database('./database/rare_parfume.db');
        db.get('SELECT id, email FROM admin_users WHERE email = ?', ['admin@rareparfume.com'], (err, row) => {
          if (err) reject(err);
          else resolve(row);
          db.close();
        });
      });
      console.log('✅ Direct SQLite query result:', JSON.stringify(directQuery, null, 2));
    } else {
      console.log('✅ All admin users have valid IDs');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAdminId();

