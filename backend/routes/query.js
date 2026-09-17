const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Helper to check if string contains multiple SQL statements
function hasMultipleStatements(sql) {
  let inSingleQuote = false;
  let inDoubleQuote = false;
  const s = sql.trim().replace(/;+\s*$/, ''); // strip trailing semicolon(s)

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (char === "'" && !inDoubleQuote) {
      if (inSingleQuote && s[i + 1] === "'") {
        i++; // skip escaped quote ''
      } else {
        inSingleQuote = !inSingleQuote;
      }
    } else if (char === '"' && !inSingleQuote) {
      if (inDoubleQuote && s[i + 1] === '"') {
        i++;
      } else {
        inDoubleQuote = !inDoubleQuote;
      }
    } else if (char === ';' && !inSingleQuote && !inDoubleQuote) {
      return true; // found unquoted semicolon separator
    }
  }
  return false;
}

// POST /api/query - Execute normal SQL command (SELECT, INSERT, UPDATE, DELETE, DDL)
router.post('/', (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string' || !sql.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query cannot be empty.',
        message: 'Query cannot be empty.'
      });
    }

    const trimmed = sql.trim();

    // Enforce exactly ONE statement per execution
    if (hasMultipleStatements(trimmed)) {
      return res.status(400).json({
        success: false,
        error: 'Multiple SQL statements are not permitted. Please execute one statement at a time.',
        message: 'Multiple SQL statements are not permitted. Please execute one statement at a time.'
      });
    }

    // Clean trailing semicolons for preparation
    const cleanSql = trimmed.replace(/;+\s*$/, '');

    // Determine statement type from first token
    const firstWordMatch = cleanSql.match(/^\s*([A-Za-z]+)/);
    const commandType = firstWordMatch ? firstWordMatch[1].toUpperCase() : 'SQL';

    const startTime = process.hrtime();
    const stmt = db.prepare(cleanSql);

    // If query returns data (e.g., SELECT, WITH ... SELECT, PRAGMA)
    if (stmt.reader) {
      const rows = stmt.all();
      const diff = process.hrtime(startTime);
      const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

      let columns = [];
      if (rows.length > 0) {
        columns = Object.keys(rows[0]);
      } else if (typeof stmt.columns === 'function') {
        columns = stmt.columns().map(c => c.name);
      }

      return res.json({
        success: true,
        type: commandType === 'WITH' ? 'WITH' : 'SELECT',
        query: cleanSql,
        count: rows.length,
        columns,
        rows,
        data: rows,
        executionTimeMs
      });
    }

    // Otherwise it's a mutating command (INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, etc.)
    const info = stmt.run();
    const diff = process.hrtime(startTime);
    const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

    const isDdl = ['CREATE', 'ALTER', 'DROP'].includes(commandType);

    return res.json({
      success: true,
      type: commandType,
      query: cleanSql,
      changes: info.changes,
      lastInsertRowid: info.lastInsertRowid,
      message: isDdl
        ? 'Command executed successfully'
        : `Command executed successfully\nAffected rows: ${info.changes}`,
      executionTimeMs
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
      message: error.message
    });
  }
});

// GET /api/query/schema - Schema reference for SQL Studio Table Explorer
router.get('/schema', (req, res) => {
  try {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' 
      ORDER BY name ASC
    `).all().map(t => t.name);

    const schemaMap = {};
    for (const table of tables) {
      const cols = db.prepare(`PRAGMA table_info("${table}")`).all();
      schemaMap[table] = cols.map(c => ({
        cid: c.cid,
        name: c.name,
        type: c.type,
        notnull: c.notnull === 1,
        dflt_value: c.dflt_value,
        pk: c.pk > 0
      }));
    }

    res.json({ success: true, tables: schemaMap });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, message: error.message });
  }
});

module.exports = router;
