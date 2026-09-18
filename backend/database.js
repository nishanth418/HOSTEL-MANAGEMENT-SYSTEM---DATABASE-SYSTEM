const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mysql = require('./db-mysql');

const DB_DIR = path.resolve(__dirname, '../database');
const DB_PATH = path.join(DB_DIR, 'hostel.db');
const SCHEMA_PATH = path.join(DB_DIR, 'schema.sql');
const SEED_PATH = path.join(DB_DIR, 'seed.sql');

const REQUIRED_TABLES = mysql.REQUIRED_TABLES;

// Lazy SQLite initialization
let sqliteDb = null;
function getSqlite() {
  if (!sqliteDb) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    sqliteDb = new Database(DB_PATH);
    sqliteDb.pragma('foreign_keys = ON');
  }
  return sqliteDb;
}

function isMySQL() {
  return mysql.isMySQLConfigured();
}

function adaptSql(sql, targetIsMySQL) {
  if (typeof sql !== 'string') return sql;
  let adapted = sql;
  if (targetIsMySQL) {
    // Adapt GROUP_CONCAT(expr, ', ') to GROUP_CONCAT(expr SEPARATOR ', ')
    adapted = adapted.replace(/GROUP_CONCAT\s*\(\s*([^,\)]+?)\s*,\s*(['"][^'"]*['"])\s*\)/gi, 'GROUP_CONCAT($1 SEPARATOR $2)');
  } else {
    // Adapt GROUP_CONCAT(expr SEPARATOR ', ') to GROUP_CONCAT(expr, ', ')
    adapted = adapted.replace(/GROUP_CONCAT\s*\(\s*([^,\)]+?)\s+SEPARATOR\s+(['"][^'"]*['"])\s*\)/gi, 'GROUP_CONCAT($1, $2)');
  }
  return adapted;
}

/**
 * Universal async query (SELECT / read)
 */
async function query(sql, params = []) {
  const isTargetMySQL = isMySQL();
  const adaptedSql = adaptSql(sql, isTargetMySQL);
  if (isTargetMySQL) {
    return await mysql.query(adaptedSql, params);
  } else {
    const s = getSqlite().prepare(adaptedSql);
    return s.all(...params);
  }
}

/**
 * Universal async execute (INSERT / UPDATE / DELETE / DDL)
 */
async function execute(sql, params = []) {
  const isTargetMySQL = isMySQL();
  const adaptedSql = adaptSql(sql, isTargetMySQL);
  if (isTargetMySQL) {
    return await mysql.execute(adaptedSql, params);
  } else {
    const s = getSqlite().prepare(adaptedSql);
    const info = s.run(...params);
    return {
      affectedRows: info.changes,
      insertId: info.lastInsertRowid,
      changes: info.changes
    };
  }
}

/**
 * Retrieve list of application table names
 */
async function getApplicationTables() {
  if (isMySQL()) {
    return await mysql.getApplicationTables();
  } else {
    const rows = getSqlite().prepare(`
      SELECT name FROM sqlite_master 
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name ASC;
    `).all();
    return rows.map(r => r.name);
  }
}

/**
 * Verify presence of all 18 tables
 */
async function verifyDatabase() {
  if (isMySQL()) {
    return await mysql.verifyDatabase();
  } else {
    const tables = await getApplicationTables();
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
}

/**
 * Get comprehensive health status for /api/health
 */
async function getHealthStatus() {
  if (isMySQL()) {
    const connTest = await mysql.testConnection();
    if (!connTest.connected) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        engine: 'MySQL (Aiven Cloud)',
        error: connTest.error,
        timestamp: new Date().toISOString()
      };
    }
    const tables = await getApplicationTables();
    return {
      status: 'healthy',
      database: 'connected',
      engine: 'MySQL (Aiven Cloud)',
      totalApplicationTables: tables.length,
      tables,
      foreignKeysEnforced: true,
      serviceDetails: {
        database: connTest.details.db,
        version: connTest.details.version
      },
      timestamp: new Date().toISOString()
    };
  } else {
    const tables = await getApplicationTables();
    return {
      status: 'healthy',
      database: 'connected',
      engine: 'SQLite 3 (better-sqlite3)',
      totalApplicationTables: tables.length,
      tables,
      foreignKeysEnforced: true,
      timestamp: new Date().toISOString()
    };
  }
}

function initDatabase(force = false) {
  if (isMySQL()) {
    return mysql.initDatabase(force);
  } else {
    const existingTables = getSqlite().prepare(`
      SELECT name FROM sqlite_master 
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
    `).all();
    if (existingTables.length === 18 && !force) {
      return { initialized: false, tables: existingTables.map(r => r.name) };
    }
    if (fs.existsSync(SCHEMA_PATH)) {
      getSqlite().exec(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
    }
    if (fs.existsSync(SEED_PATH)) {
      getSqlite().exec(fs.readFileSync(SEED_PATH, 'utf-8'));
    }
    const tables = getSqlite().prepare(`
      SELECT name FROM sqlite_master 
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
    `).all().map(r => r.name);
    return { initialized: true, tables };
  }
}

// Lazy proxy for backwards-compatible SQLite access
const db = new Proxy({}, {
  get(target, prop) {
    const sqlite = getSqlite();
    const val = sqlite[prop];
    return typeof val === 'function' ? val.bind(sqlite) : val;
  }
});

module.exports = {
  db,
  isMySQL,
  query,
  execute,
  getApplicationTables,
  verifyDatabase,
  getHealthStatus,
  initDatabase,
  REQUIRED_TABLES,
  mysql
};
