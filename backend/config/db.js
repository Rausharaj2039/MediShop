const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

let globalDb;
const userDbs = {}; // pool of user database connections

const initDB = () => {
  const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../data/medishop.db');
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  globalDb = new DatabaseSync(dbPath);
  globalDb.exec('PRAGMA journal_mode = WAL;');
  globalDb.exec('PRAGMA foreign_keys = ON;');

  // Migrations for global user tokens
  try {
    globalDb.exec('ALTER TABLE users ADD COLUMN reset_token TEXT;');
  } catch (error) {}
  try {
    globalDb.exec('ALTER TABLE users ADD COLUMN reset_token_expiry TEXT;');
  } catch (error) {}

  globalDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      reset_token TEXT,
      reset_token_expiry TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  console.log(`Global Database initialized at: ${dbPath}`);
  return globalDb;
};

const getDb = () => {
  if (!globalDb) {
    initDB();
  }
  return globalDb;
};

const getDbForUser = (userId) => {
  if (!userId) {
    return getDb(); // Fallback to global db if no user ID provided
  }

  if (userDbs[userId]) {
    return userDbs[userId];
  }

  // Create a separate sqlite file for each user in data/ directory
  const dbFilename = `medishop_user_${userId}.db`;
  const dbPath = path.join(__dirname, '../data', dbFilename);
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Initialize products schema inside this user's isolated database file
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL,
      image TEXT,
      expiry_date TEXT,
      company TEXT,
      batch_number TEXT,
      purchase_price REAL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  userDbs[userId] = db;
  console.log(`Initialized separate user database for User ID ${userId}: ${dbPath}`);
  return db;
};

const closeDbForUser = (userId) => {
  if (userDbs[userId]) {
    try {
      userDbs[userId].close();
      console.log(`Closed SQLite connection for deleted User ID ${userId}`);
    } catch (e) {
      console.error(`Error closing user database connection for ${userId}:`, e);
    }
    delete userDbs[userId];
  }
};

module.exports = { initDB, getDb, getDbForUser, closeDbForUser };
