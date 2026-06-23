const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const isVercel = !!process.env.VERCEL;
const DB_DIR = isVercel ? '/tmp/data' : path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'site.db');

let db;
let SQL;

async function initDb() {
  const wasmBinary = fs.readFileSync(
    path.join(__dirname, 'sql-wasm.wasm')
  );
  SQL = await initSqlJs({ wasmBinary });

  let buffer;
  if (fs.existsSync(DB_PATH)) {
    buffer = fs.readFileSync(DB_PATH);
  }

  db = new SQL.Database(buffer);
  db.run('PRAGMA foreign_keys = ON');
  createTables();

  return db;
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      hero_title TEXT DEFAULT '',
      hero_subtitle TEXT DEFAULT '',
      hero_image TEXT DEFAULT '',
      content TEXT DEFAULT '',
      meta_description TEXT DEFAULT '',
      is_published INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT DEFAULT '',
      content TEXT DEFAULT '',
      category TEXT DEFAULT '',
      tags TEXT DEFAULT '',
      image TEXT DEFAULT '',
      author TEXT DEFAULT 'Kamera Sepeti Uzman Ekibi',
      reading_time TEXT DEFAULT '4 dk okuma',
      published_at TEXT DEFAULT (datetime('now')),
      is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      title TEXT DEFAULT '',
      company TEXT DEFAULT '',
      content TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      image TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      category TEXT DEFAULT '',
      client TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS nav_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS footer_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS footer_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER NOT NULL REFERENCES footer_sections(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS contact_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'text',
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      icon TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      subtitle TEXT DEFAULT '',
      price INTEGER DEFAULT 0,
      price_label TEXT DEFAULT 'TL + KDV',
      features TEXT DEFAULT '',
      is_popular INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS faq_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT DEFAULT '',
      category TEXT DEFAULT 'genel',
      sort_order INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT DEFAULT '',
      size INTEGER DEFAULT 0,
      alt_text TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, buffer);
}

function getLastInsertRowid() {
  const r = db.exec("SELECT last_insert_rowid()");
  return r[0]?.values[0][0] ?? 0;
}

// Helper: add @ prefix to named params for sql.js compatibility
function toSqlParams(params) {
  if (typeof params === 'object' && !Array.isArray(params) && params !== null) {
    const out = {};
    for (const [key, value] of Object.entries(params)) {
      out[key.startsWith('@') || key.startsWith(':') || key.startsWith('$') ? key : '@' + key] = value;
    }
    return out;
  }
  return params;
}

// Wrapper to match better-sqlite3 API
function getDb() {
  if (!db) return null;
  return {
    prepare: (sql) => {
      const stmt = db.prepare(sql);
      return {
        all: (params) => {
          if (params !== undefined && params !== null) {
            if (typeof params === 'object' && !Array.isArray(params)) {
              stmt.bind(toSqlParams(params));
            } else {
              stmt.bind([params]);
            }
          }
          const rows = [];
          while (stmt.step()) rows.push(stmt.getAsObject());
          stmt.free();
          return rows;
        },
        get: (params) => {
          if (params !== undefined && params !== null) {
            if (typeof params === 'object' && !Array.isArray(params)) {
              stmt.bind(toSqlParams(params));
            } else {
              stmt.bind([params]);
            }
          }
          const hasRow = stmt.step();
          if (!hasRow) { stmt.free(); return undefined; }
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        },
        run: (...args) => {
          if (args.length > 0) {
            if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])) {
              stmt.bind(toSqlParams(args[0]));
            } else {
              stmt.bind(args);
            }
          }
          stmt.step();
          stmt.free();
          saveDb();
          return {
            lastInsertRowid: getLastInsertRowid(),
            changes: db.getRowsModified()
          };
        }
      };
    },
    exec: (sql) => {
      db.exec(sql);
      saveDb();
    },
    close: () => {
      saveDb();
      db.close();
      db = null;
    }
  };
}

function closeDb() {
  if (db) { saveDb(); db.close(); db = null; }
}

module.exports = { getDb, initDb, closeDb };
