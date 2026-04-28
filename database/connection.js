const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db;
let dbReady = false;
const dbPath = path.join(__dirname, 'pvp_ranks.db');

/**
 * Initialize the database with sql.js
 */
async function initializeDatabase() {
  if (dbReady) return db;
  
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  let filebuffer;
  if (fs.existsSync(dbPath)) {
    filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }

  // Initialize tables
  db.run(`
    CREATE TABLE IF NOT EXISTS rank_history (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     TEXT NOT NULL,
      staff_id    TEXT NOT NULL,
      gamemode    TEXT NOT NULL,
      \`rank\`    TEXT NOT NULL,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      CHECK(\`rank\` IN ('D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+', 'S-', 'S', 'S+', 'S++'))
    );

    CREATE TABLE IF NOT EXISTS current_ranks (
      user_id     TEXT NOT NULL,
      gamemode    TEXT NOT NULL,
      \`rank\`    TEXT NOT NULL,
      staff_id    TEXT NOT NULL,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, gamemode),
      CHECK(\`rank\` IN ('D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+', 'S-', 'S', 'S+', 'S++'))
    );

    CREATE TABLE IF NOT EXISTS minecraft_accounts (
      minecraft_uuid TEXT PRIMARY KEY,
      discord_id     TEXT NOT NULL,
      registered_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tester_stats (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      tester_id      TEXT NOT NULL,
      tested_user_id TEXT NOT NULL,
      gamemode       TEXT NOT NULL,
      result         TEXT NOT NULL,
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
      CHECK(result IN ('pass', 'fail'))
    );

    CREATE INDEX IF NOT EXISTS idx_rank_history_user_gamemode ON rank_history(user_id, gamemode);
    CREATE INDEX IF NOT EXISTS idx_rank_history_created_at ON rank_history(created_at);
    CREATE INDEX IF NOT EXISTS idx_minecraft_discord_id ON minecraft_accounts(discord_id);
    CREATE INDEX IF NOT EXISTS idx_tester_stats_tester ON tester_stats(tester_id);
    CREATE INDEX IF NOT EXISTS idx_tester_stats_created ON tester_stats(created_at);
  `);

  saveDatabase();
  dbReady = true;
  console.log('[DB] SQLite database initialized at:', dbPath);
  return db;
}

/**
 * Get the database (must call initializeDatabase first)
 */
function getDb() {
  if (!dbReady || !db) {
    throw new Error('Database not initialized. Call testConnection() first.');
  }
  return db;
}

/**
 * Save the database to disk
 */
function saveDatabase() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

/**
 * Test the connection on startup and log the result.
 */
async function testConnection() {
  try {
    await initializeDatabase();
    console.log('[DB] SQLite connection established successfully.');
  } catch (err) {
    console.error('[DB] Failed to initialize SQLite:', err.message);
    process.exit(1);
  }
}

module.exports = { getDb, testConnection, saveDatabase, initializeDatabase };
