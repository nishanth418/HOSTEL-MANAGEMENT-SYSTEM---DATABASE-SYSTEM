const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Helper to split SQL script into individual statements safely honoring quotes
function splitStatements(sql) {
  const statements = [];
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let current = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (char === "'" && !inDoubleQuote) {
      if (inSingleQuote && sql[i + 1] === "'") {
        current += "''";
        i++;
      } else {
        inSingleQuote = !inSingleQuote;
        current += char;
      }
    } else if (char === '"' && !inSingleQuote) {
      if (inDoubleQuote && sql[i + 1] === '"') {
        current += '""';
        i++;
      } else {
        inDoubleQuote = !inDoubleQuote;
        current += char;
      }
    } else if (char === ';' && !inSingleQuote && !inDoubleQuote) {
      if (current.trim()) {
        statements.push(current.trim());
      }
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    statements.push(current.trim());
  }
  return statements;
}

// POST /api/query - Execute ANY SQL operation (DQL, DML, DDL, Joins, Aggregates, Multi-statement scripts)
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

    const statements = splitStatements(sql.trim());
    if (statements.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid SQL statements found.',
        message: 'No valid SQL statements found.'
      });
    }

    const startTime = process.hrtime();

    // Case 1: Single statement
    if (statements.length === 1) {
      const cleanSql = statements[0];
      const firstWordMatch = cleanSql.match(/^\s*([A-Za-z]+)/);
      const commandType = firstWordMatch ? firstWordMatch[1].toUpperCase() : 'SQL';

      const stmt = db.prepare(cleanSql);

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
          ? `${commandType} command executed successfully`
          : `Command executed successfully\nAffected rows: ${info.changes}`,
        executionTimeMs
      });
    }

    // Case 2: Multi-statement batch execution in a single atomic transaction
    let lastResult = null;
    let totalChanges = 0;
    let finalQueryRows = null;
    let finalColumns = [];

    const runBatch = db.transaction(() => {
      for (let i = 0; i < statements.length; i++) {
        const s = statements[i];
        const isLast = i === statements.length - 1;
        const stmt = db.prepare(s);

        if (stmt.reader) {
          if (isLast) {
            finalQueryRows = stmt.all();
            if (finalQueryRows.length > 0) {
              finalColumns = Object.keys(finalQueryRows[0]);
            } else if (typeof stmt.columns === 'function') {
              finalColumns = stmt.columns().map(c => c.name);
            }
          } else {
            stmt.all();
          }
        } else {
          const info = stmt.run();
          totalChanges += (info.changes || 0);
          lastResult = info;
        }
      }
    });

    runBatch();

    const diff = process.hrtime(startTime);
    const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

    if (finalQueryRows !== null) {
      return res.json({
        success: true,
        type: 'BATCH_QUERY',
        count: finalQueryRows.length,
        columns: finalColumns,
        rows: finalQueryRows,
        data: finalQueryRows,
        statementsCount: statements.length,
        changes: totalChanges,
        message: `Executed ${statements.length} statements successfully. Final query returned ${finalQueryRows.length} row(s).`,
        executionTimeMs
      });
    }

    return res.json({
      success: true,
      type: 'BATCH_SCRIPT',
      statementsCount: statements.length,
      changes: totalChanges,
      lastInsertRowid: lastResult ? lastResult.lastInsertRowid : undefined,
      message: `Executed ${statements.length} SQL statements successfully.\nTotal affected rows: ${totalChanges}`,
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
