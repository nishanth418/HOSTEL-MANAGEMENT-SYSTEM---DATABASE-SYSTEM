const express = require('express');
const router = express.Router();
const { db, REQUIRED_TABLES } = require('../database');

// Middleware to validate table name
function validateTableName(req, res, next) {
  const rawName = req.params.tableName;
  const upperName = (rawName || '').toUpperCase();
  if (!REQUIRED_TABLES.includes(upperName)) {
    return res.status(404).json({
      success: false,
      message: `Table '${rawName}' is not one of the 18 application database tables.`
    });
  }
  req.tableName = upperName;
  next();
}

// GET all 18 table summaries
router.get('/', (req, res) => {
  try {
    const list = REQUIRED_TABLES.map(table => {
      const count = db.prepare(`SELECT count(*) as count FROM "${table}"`).get().count;
      const cols = db.prepare(`PRAGMA table_info("${table}")`).all();
      const fks = db.prepare(`PRAGMA foreign_key_list("${table}")`).all();
      return {
        name: table,
        rowCount: count,
        columnCount: cols.length,
        hasCompositeKey: cols.filter(c => c.pk > 0).length > 1
      };
    });
    res.json({ success: true, count: list.length, tables: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET specific table schema and all records
router.get('/:tableName', validateTableName, (req, res) => {
  try {
    const table = req.tableName;
    const { search } = req.query;

    // 1. Get column schema info
    const rawCols = db.prepare(`PRAGMA table_info("${table}")`).all();
    const rawFks = db.prepare(`PRAGMA foreign_key_list("${table}")`).all();

    const columns = rawCols.map(c => {
      const isPk = c.pk > 0;
      const fkMatch = rawFks.find(f => f.from === c.name);
      const isFk = Boolean(fkMatch);

      let keyBadge = null;
      if (isPk && isFk) {
        keyBadge = 'PK, FK';
      } else if (isPk) {
        keyBadge = 'PK';
      } else if (isFk) {
        keyBadge = 'FK';
      }

      return {
        name: c.name,
        type: c.type || 'TEXT',
        notnull: c.notnull === 1,
        dflt_value: c.dflt_value,
        pkOrder: c.pk,
        isPk,
        isFk,
        keyBadge,
        fkRef: fkMatch ? { table: fkMatch.table, to: fkMatch.to } : null
      };
    });

    const primaryKeys = columns.filter(c => c.isPk).map(c => c.name);

    // 2. Query rows
    let query = `SELECT * FROM "${table}"`;
    const params = [];

    if (search && search.trim()) {
      const searchTerms = columns
        .filter(c => c.type.includes('CHAR') || c.type.includes('TEXT') || c.type.includes('INT'))
        .map(c => `CAST("${c.name}" AS TEXT) LIKE ?`);
      if (searchTerms.length > 0) {
        query += ` WHERE ${searchTerms.join(' OR ')}`;
        const s = `%${search.trim()}%`;
        searchTerms.forEach(() => params.push(s));
      }
    }

    // Default sort by primary keys
    if (primaryKeys.length > 0) {
      query += ` ORDER BY ${primaryKeys.map(k => `"${k}" ASC`).join(', ')}`;
    }

    const rows = db.prepare(query).all(...params);
    const totalCount = db.prepare(`SELECT count(*) as count FROM "${table}"`).get().count;

    res.json({
      success: true,
      tableName: table,
      columns,
      primaryKeys,
      foreignKeys: rawFks.map(f => ({ from: f.from, table: f.table, to: f.to })),
      totalRows: totalCount,
      filteredRows: rows.length,
      data: rows
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST insert new record into table
router.post('/:tableName', validateTableName, (req, res) => {
  try {
    const table = req.tableName;
    const body = req.body || {};

    const rawCols = db.prepare(`PRAGMA table_info("${table}")`).all();
    const validColNames = rawCols.map(c => c.name);

    // Filter out columns not in table, and handle autoincrement PKs if empty
    const insertCols = [];
    const insertVals = [];
    const placeholders = [];

    for (const col of rawCols) {
      const val = body[col.name];
      if (val !== undefined && val !== '') {
        insertCols.push(`"${col.name}"`);
        insertVals.push(val);
        placeholders.push('?');
      }
    }

    if (insertCols.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid column values provided' });
    }

    const sql = `INSERT INTO "${table}" (${insertCols.join(', ')}) VALUES (${placeholders.join(', ')})`;
    const result = db.prepare(sql).run(...insertVals);

    res.status(201).json({
      success: true,
      message: `Record added to ${table} successfully`,
      lastInsertRowid: result.lastInsertRowid
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update record in table
router.put('/:tableName', validateTableName, (req, res) => {
  try {
    const table = req.tableName;
    const { keyCriteria, values } = req.body;

    if (!keyCriteria || !values || typeof keyCriteria !== 'object' || typeof values !== 'object') {
      return res.status(400).json({ success: false, message: 'keyCriteria and values objects are required' });
    }

    const setClauses = [];
    const params = [];

    for (const [col, val] of Object.entries(values)) {
      setClauses.push(`"${col}" = ?`);
      params.push(val === '' ? null : val);
    }

    const whereClauses = [];
    for (const [pkCol, pkVal] of Object.entries(keyCriteria)) {
      whereClauses.push(`"${pkCol}" = ?`);
      params.push(pkVal);
    }

    if (setClauses.length === 0 || whereClauses.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing update fields or target key criteria' });
    }

    const sql = `UPDATE "${table}" SET ${setClauses.join(', ')} WHERE ${whereClauses.join(' AND ')}`;
    const result = db.prepare(sql).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'No record matched the key criteria' });
    }

    res.json({ success: true, message: `Record in ${table} updated successfully` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE record from table
router.delete('/:tableName', validateTableName, (req, res) => {
  try {
    const table = req.tableName;
    const keyCriteria = req.query;

    const rawCols = db.prepare(`PRAGMA table_info("${table}")`).all();
    const pkCols = rawCols.filter(c => c.pk > 0).map(c => c.name);

    if (pkCols.length === 0) {
      return res.status(400).json({ success: false, message: 'Table has no primary key defined' });
    }

    const whereClauses = [];
    const params = [];

    for (const pk of pkCols) {
      if (keyCriteria[pk] === undefined) {
        return res.status(400).json({
          success: false,
          message: `Missing primary key parameter '${pk}' for deleting from ${table}`
        });
      }
      whereClauses.push(`"${pk}" = ?`);
      params.push(keyCriteria[pk]);
    }

    const sql = `DELETE FROM "${table}" WHERE ${whereClauses.join(' AND ')}`;
    const result = db.prepare(sql).run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'No record matched the primary key' });
    }

    res.json({ success: true, message: `Record deleted from ${table} successfully` });
  } catch (err) {
    // Foreign key violation error handling
    if (err.message.includes('FOREIGN KEY constraint failed')) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete record: Other tables reference this record via Foreign Key constraint.`
      });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
