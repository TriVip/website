require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database', 'rare_parfume.db');

async function fixAdminTable() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Database error:', err);
        reject(err);
        return;
      }
      console.log('✅ Connected to database');
    });

    // Check current schema
    db.all('PRAGMA table_info(admin_users)', (err, columns) => {
      if (err) {
        console.error('❌ Error getting table info:', err);
        db.close();
        reject(err);
        return;
      }

      console.log('📋 Current table structure:');
      console.log(JSON.stringify(columns, null, 2));

      // Check if id column exists and is correct
      const idColumn = columns.find(col => col.name === 'id');
      if (!idColumn) {
        console.log('⚠️  ID column not found!');
      } else {
        console.log('📌 ID column info:', JSON.stringify(idColumn, null, 2));
      }

      // Drop and recreate table with correct schema
      console.log('\n🔧 Recreating admin_users table...');
      db.serialize(() => {
        // Backup existing data
        db.all('SELECT * FROM admin_users', (err, rows) => {
          if (err) {
            console.error('❌ Error backing up data:', err);
            db.close();
            reject(err);
            return;
          }

          console.log('💾 Backed up', rows.length, 'admin users');

          // Drop table
          db.run('DROP TABLE IF EXISTS admin_users', (err) => {
            if (err) {
              console.error('❌ Error dropping table:', err);
              db.close();
              reject(err);
              return;
            }

            console.log('🗑️  Dropped old table');

            // Create new table with correct schema
            db.run(`
              CREATE TABLE admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )
            `, (err) => {
              if (err) {
                console.error('❌ Error creating table:', err);
                db.close();
                reject(err);
                return;
              }

              console.log('✅ Created new table');

              // Restore data
              if (rows.length > 0) {
                const bcrypt = require('bcryptjs');
                let inserted = 0;
                
                rows.forEach((row, index) => {
                  // Use existing password hash or create new one
                  const passwordHash = row.password_hash || bcrypt.hashSync('admin123', 12);
                  
                  db.run(
                    `INSERT INTO admin_users (email, password_hash, name, role, is_active, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                      row.email,
                      passwordHash,
                      row.name,
                      row.role,
                      row.is_active,
                      row.created_at,
                      row.updated_at
                    ],
                    function(err) {
                      if (err) {
                        console.error('❌ Error inserting row:', err);
                      } else {
                        inserted++;
                        console.log(`✅ Inserted admin user ${inserted}/${rows.length} with ID: ${this.lastID}`);
                      }

                      if (inserted === rows.length) {
                        // Verify
                        db.get('SELECT id, email, name FROM admin_users WHERE email = ?', 
                          ['admin@rareparfume.com'], 
                          (err, admin) => {
                            if (err) {
                              console.error('❌ Error verifying:', err);
                            } else {
                              console.log('✅ Verified admin user:', JSON.stringify(admin, null, 2));
                            }
                            db.close();
                            resolve();
                          }
                        );
                      }
                    }
                  );
                });
              } else {
                // Create default admin
                const bcrypt = require('bcryptjs');
                const passwordHash = bcrypt.hashSync('admin123', 12);
                
                db.run(
                  `INSERT INTO admin_users (email, password_hash, name, role, is_active)
                   VALUES (?, ?, ?, ?, ?)`,
                  ['admin@rareparfume.com', passwordHash, 'Administrator', 'admin', 1],
                  function(err) {
                    if (err) {
                      console.error('❌ Error creating default admin:', err);
                      db.close();
                      reject(err);
                      return;
                    }
                    console.log('✅ Created default admin with ID:', this.lastID);
                    
                    // Verify
                    db.get('SELECT id, email, name FROM admin_users WHERE email = ?', 
                      ['admin@rareparfume.com'], 
                      (err, admin) => {
                        if (err) {
                          console.error('❌ Error verifying:', err);
                        } else {
                          console.log('✅ Verified admin user:', JSON.stringify(admin, null, 2));
                        }
                        db.close();
                        resolve();
                      }
                    );
                  }
                );
              }
            });
          });
        });
      });
    });
  });
}

fixAdminTable()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });

