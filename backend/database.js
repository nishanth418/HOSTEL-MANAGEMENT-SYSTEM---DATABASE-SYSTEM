const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_DIR = path.resolve(__dirname, '../database');
const DB_PATH = path.join(DB_DIR, 'hostel.db');
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');
const SEED_PATH = path.join(DB_DIR, 'seed.sql');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Enforce Foreign Keys in SQLite
db.pragma('foreign_keys = ON');

// 18 Application Tables required
const REQUIRED_TABLES = [
  'WARDEN',
  'WARDEN_PHONE',
  'HOSTEL',
  'ROOM_TYPE',
  'ROOM',
  'STUDENT',
  'STUDENT_PHONE',
  'MESS',
  'MESS_CONTACT',
  'MEAL',
  'STAFF',
  'STAFF_PHONE',
  'SUPPLIER',
  'SUPPLIER_PHONE',
  'INVENTORY_ITEM',
  'PROCURES',
  'PAYMENT',
  'PAYMENT_DETAIL'
];

function getApplicationTables() {
  const rows = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name ASC;
  `).all();
  return rows.map(r => r.name);
}

function initDatabase(force = false) {
  const existingTables = getApplicationTables();
  if (existingTables.length === 18 && !force) {
    console.log(`Database already initialized with ${existingTables.length} tables.`);
    return { initialized: false, tables: existingTables };
  }

  console.log('Initializing database schema and seed data...');
  if (fs.existsSync(SCHEMA_PATH)) {
    const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schemaSql);
  } else {
    throw new Error(`Schema file not found at ${SCHEMA_PATH}`);
  }

  if (fs.existsSync(SEED_PATH)) {
    const seedSql = fs.readFileSync(SEED_PATH, 'utf-8');
    db.exec(seedSql);
  } else {
    console.warn(`Seed file not found at ${SEED_PATH}`);
  }

  const tables = getApplicationTables();
  console.log(`Database successfully initialized. Tables count: ${tables.length}`);
  return { initialized: true, tables };
}

function verifyDatabase() {
  const tables = getApplicationTables();
  console.log(`\n--- VERIFYING APPLICATION TABLES (Total: ${tables.length}) ---`);
  tables.forEach((t, i) => console.log(`${i + 1}. ${t}`));

  const missing = REQUIRED_TABLES.filter(t => !tables.includes(t));
  if (missing.length === 0 && tables.length === 18) {
    console.log('\n SUCCESS: Exactly the 18 expected application tables exist in SQLite.');
    return { success: true, count: tables.length, tables };
  } else {
    console.error('\n FAILURE: Tables mismatch!', { foundCount: tables.length, missing });
    return { success: false, count: tables.length, tables, missing };
  }
}

// Auto initialize on first load if tables missing
if (getApplicationTables().length < 18) {
  initDatabase();
}

module.exports = {
  db,
  initDatabase,
  verifyDatabase,
  getApplicationTables,
  REQUIRED_TABLES
};
