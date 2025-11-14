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

async function fixProductIds() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // First, check current state
      db.all('SELECT id, name, brand FROM products', [], (err, products) => {
        if (err) {
          return reject(err);
        }
        
        console.log(`\n📊 Found ${products.length} products`);
        console.log('Current products:', JSON.stringify(products, null, 2));
        
        // Check if any products have null IDs
        const productsWithNullIds = products.filter(p => p.id === null || p.id === undefined);
        
        if (productsWithNullIds.length === 0) {
          console.log('\n✅ All products have valid IDs. No fix needed.');
          db.close();
          return resolve();
        }
        
        console.log(`\n⚠️ Found ${productsWithNullIds.length} products with null IDs`);
        console.log('These products will be deleted as they are invalid.');
        
        // Delete products with null IDs
        db.run('DELETE FROM products WHERE id IS NULL', (err) => {
          if (err) {
            return reject(err);
          }
          
          console.log(`\n✅ Deleted ${productsWithNullIds.length} products with null IDs`);
          
          // Verify
          db.all('SELECT COUNT(*) as count FROM products', [], (err, result) => {
            if (err) {
              return reject(err);
            }
            
            console.log(`\n📊 Remaining products: ${result[0].count}`);
            db.close();
            resolve();
          });
        });
      });
    });
  });
}

fixProductIds()
  .then(() => {
    console.log('\n🎉 Product ID fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fixing product IDs:', error.message);
    db.close();
    process.exit(1);
  });

