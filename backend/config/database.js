const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const DEFAULT_DB_PATH = path.join(__dirname, '..', 'database', 'rare_parfume.db');
const dbPath = process.env.SQLITE_DB_PATH || DEFAULT_DB_PATH;
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sqlite.sql');
const sampleDataPath = path.join(__dirname, '..', 'database', 'sample-data.sqlite.sql');
const dbExists = fs.existsSync(dbPath);

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const initializeDatabase = () => {
  try {
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      db.exec(schemaSql, (schemaErr) => {
        if (schemaErr) {
          console.error('❌ Failed to apply SQLite schema:', schemaErr.message);
          return;
        }

        console.log('✅ SQLite schema ensured');

        if (fs.existsSync(sampleDataPath)) {
          const sampleSql = fs.readFileSync(sampleDataPath, 'utf8');
          db.exec(sampleSql, (sampleErr) => {
            if (sampleErr) {
              console.error('⚠️ Failed to load SQLite sample data:', sampleErr.message);
            } else {
              console.log('✅ Sample data loaded into SQLite database');
            }
          });
        }
      });
    } else {
      console.warn(`⚠️ Schema file not found at ${schemaPath}`);
    }
  } catch (error) {
    console.error('❌ Error initialising SQLite database:', error.message);
  }
};

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`✅ Connected to SQLite database at ${dbPath}`);
  }
});

db.serialize(() => {
  db.exec('PRAGMA foreign_keys = ON');

  if (!dbExists) {
    initializeDatabase();
  } else {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='admin_users'", (inspectErr, row) => {
      if (inspectErr) {
        console.error('⚠️ Failed to inspect SQLite schema:', inspectErr.message);
        return;
      }

      if (!row) {
        initializeDatabase();
      }
    });
  }
});

const promisifyRun = (database, sql, params = []) => {
  return new Promise((resolve, reject) => {
    database.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

const promisifyGet = (database, sql, params = []) => {
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
};

const promisifyAll = (database, sql, params = []) => {
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const runInTransaction = async (callback) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', async (beginErr) => {
        if (beginErr) {
          return reject(beginErr);
        }

        const tx = {
          run: (sql, params = []) => promisifyRun(db, sql, params),
          get: (sql, params = []) => promisifyGet(db, sql, params),
          all: (sql, params = []) => promisifyAll(db, sql, params)
        };

        try {
          const result = await callback(tx);
          db.run('COMMIT', (commitErr) => {
            if (commitErr) {
              return reject(commitErr);
            }
            resolve(result);
          });
        } catch (error) {
          db.run('ROLLBACK', (rollbackErr) => {
            if (rollbackErr) {
              console.error('❌ Failed to rollback transaction:', rollbackErr);
            }
            reject(error);
          });
        }
      });
    });
  });
};

module.exports = {
  db,
  dbRun: (sql, params = []) => promisifyRun(db, sql, params),
  dbGet: (sql, params = []) => promisifyGet(db, sql, params),
  dbAll: (sql, params = []) => promisifyAll(db, sql, params),
  runInTransaction
};
