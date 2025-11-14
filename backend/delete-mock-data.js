const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const DEFAULT_DB_PATH = path.join(__dirname, 'database', 'rare_parfume.db');
const dbPath = process.env.SQLITE_DB_PATH || DEFAULT_DB_PATH;

if (!fs.existsSync(dbPath)) {
  console.error(`❌ Database file not found at ${dbPath}`);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
    process.exit(1);
  } else {
    console.log(`✅ Connected to SQLite database at ${dbPath}`);
  }
});

async function deleteMockData() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          return reject(err);
        }

        // Delete all products
        db.run('DELETE FROM products', (err) => {
          if (err) {
            return db.run('ROLLBACK', () => reject(err));
          }
          console.log('✅ Deleted all products');
        });

        // Delete all blog posts
        db.run('DELETE FROM blog_posts', (err) => {
          if (err) {
            return db.run('ROLLBACK', () => reject(err));
          }
          console.log('✅ Deleted all blog posts');
        });

        // Delete all order items (if any)
        db.run('DELETE FROM order_items', (err) => {
          if (err) {
            return db.run('ROLLBACK', () => reject(err));
          }
          console.log('✅ Deleted all order items');
        });

        // Delete all orders (if any)
        db.run('DELETE FROM orders', (err) => {
          if (err) {
            return db.run('ROLLBACK', () => reject(err));
          }
          console.log('✅ Deleted all orders');
        });

        // Commit transaction
        db.run('COMMIT', (err) => {
          if (err) {
            return reject(err);
          }
          console.log('✅ Transaction committed successfully');
          resolve();
        });
      });
    });
  });
}

deleteMockData()
  .then(() => {
    console.log('\n🎉 All mock data deleted successfully!');
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
        process.exit(1);
      } else {
        console.log('✅ Database connection closed');
        process.exit(0);
      }
    });
  })
  .catch((error) => {
    console.error('❌ Error deleting mock data:', error.message);
    db.close();
    process.exit(1);
  });

