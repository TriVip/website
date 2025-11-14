const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'database', 'rare_parfume.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
    process.exit(1);
  } else {
    console.log(`✅ Connected to SQLite database at ${dbPath}`);
  }
});

async function fixSchema() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Check current schema
      db.all("PRAGMA table_info(products)", [], (err, columns) => {
        if (err) {
          return reject(err);
        }
        
        console.log('\n📋 Current products table schema:');
        columns.forEach(col => {
          console.log(`  - ${col.name}: ${col.type} ${col.pk ? '(PRIMARY KEY)' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
        });
        
        // Check if id column is INTEGER PRIMARY KEY AUTOINCREMENT
        const idColumn = columns.find(col => col.name === 'id');
        
        if (!idColumn) {
          console.log('\n❌ No id column found!');
          db.close();
          return reject(new Error('No id column found'));
        }
        
        if (idColumn.type.toUpperCase() !== 'INTEGER' || !idColumn.pk) {
          console.log('\n⚠️ ID column is not INTEGER PRIMARY KEY. Fixing...');
          
          // Create backup table
          db.run(`
            CREATE TABLE IF NOT EXISTS products_backup AS 
            SELECT * FROM products WHERE id IS NOT NULL
          `, (err) => {
            if (err) {
              return reject(err);
            }
            
            console.log('✅ Backup table created');
            
            // Drop old table
            db.run('DROP TABLE IF EXISTS products', (err) => {
              if (err) {
                return reject(err);
              }
              
              console.log('✅ Old table dropped');
              
              // Create new table with correct schema
              db.run(`
                CREATE TABLE products (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name VARCHAR(255) NOT NULL,
                  brand VARCHAR(100) NOT NULL,
                  description TEXT,
                  price DECIMAL(10, 2) NOT NULL,
                  image_urls TEXT DEFAULT '[]',
                  stock_quantity INTEGER DEFAULT 0,
                  scent_notes TEXT DEFAULT '{}',
                  volume_ml INTEGER NOT NULL,
                  category VARCHAR(50) DEFAULT 'perfume',
                  is_featured BOOLEAN DEFAULT 0,
                  is_active BOOLEAN DEFAULT 1,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
              `, (err) => {
                if (err) {
                  return reject(err);
                }
                
                console.log('✅ New table created with correct schema');
                
                // Copy data from backup (without id, let it auto-increment)
                db.run(`
                  INSERT INTO products (name, brand, description, price, image_urls, stock_quantity, 
                    scent_notes, volume_ml, category, is_featured, is_active, created_at, updated_at)
                  SELECT name, brand, description, price, image_urls, stock_quantity, 
                    scent_notes, volume_ml, category, is_featured, is_active, created_at, updated_at
                  FROM products_backup
                `, (err) => {
                  if (err) {
                    return reject(err);
                  }
                  
                  console.log('✅ Data copied to new table');
                  
                  // Drop backup table
                  db.run('DROP TABLE IF EXISTS products_backup', (err) => {
                    if (err) {
                      console.warn('⚠️ Could not drop backup table:', err.message);
                    } else {
                      console.log('✅ Backup table removed');
                    }
                    
                    db.close();
                    resolve();
                  });
                });
              });
            });
          });
        } else {
          console.log('\n✅ Schema is correct. No fix needed.');
          db.close();
          resolve();
        }
      });
    });
  });
}

fixSchema()
  .then(() => {
    console.log('\n🎉 Schema fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fixing schema:', error.message);
    console.error(error.stack);
    db.close();
    process.exit(1);
  });

