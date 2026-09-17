const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET all procurements
router.get('/', (req, res) => {
  try {
    const { supplier_id, item_id, status } = req.query;
    let query = `
      SELECT 
        p.*,
        s.name AS supplier_name,
        s.company_name AS supplier_company,
        i.item_name,
        i.category AS item_category,
        i.unit AS item_unit
      FROM PROCURES p
      JOIN SUPPLIER s ON p.supplier_id = s.supplier_id
      JOIN INVENTORY_ITEM i ON p.item_id = i.item_id
      WHERE 1=1
    `;
    const params = [];

    if (supplier_id) {
      query += ` AND p.supplier_id = ?`;
      params.push(supplier_id);
    }
    if (item_id) {
      query += ` AND p.item_id = ?`;
      params.push(item_id);
    }
    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY p.procure_date DESC, p.procure_id DESC`;

    const rows = db.prepare(query).all(...params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single procurement
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT 
        p.*,
        s.name AS supplier_name,
        s.company_name,
        s.email AS supplier_email,
        i.item_name,
        i.unit
      FROM PROCURES p
      JOIN SUPPLIER s ON p.supplier_id = s.supplier_id
      JOIN INVENTORY_ITEM i ON p.item_id = i.item_id
      WHERE p.procure_id = ?
    `).get(req.params.id);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Procurement record not found' });
    }
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create procurement (optionally updates inventory quantity)
router.post('/', (req, res) => {
  try {
    const { supplier_id, item_id, procure_date, quantity, unit_price, status } = req.body;
    if (!supplier_id || !item_id || !procure_date || !quantity || unit_price === undefined) {
      return res.status(400).json({ success: false, message: 'All procurement fields are required' });
    }

    const qty = Number(quantity);
    const price = Number(unit_price);
    const totalCost = qty * price;
    const procStatus = status || 'Completed';

    const insertTx = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO PROCURES (supplier_id, item_id, procure_date, quantity, unit_price, total_cost, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(Number(supplier_id), Number(item_id), procure_date, qty, price, totalCost, procStatus);

      // If completed, increment inventory quantity automatically
      if (procStatus === 'Completed') {
        db.prepare(`UPDATE INVENTORY_ITEM SET quantity = quantity + ? WHERE item_id = ?`).run(qty, Number(item_id));
      }

      return result.lastInsertRowid;
    });

    const procureId = insertTx();
    res.status(201).json({ success: true, message: 'Procurement created successfully', procureId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update procurement
router.put('/:id', (req, res) => {
  try {
    const procureId = req.params.id;
    const { supplier_id, item_id, procure_date, quantity, unit_price, status } = req.body;

    const existing = db.prepare(`SELECT * FROM PROCURES WHERE procure_id = ?`).get(procureId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Procurement record not found' });
    }

    const qty = quantity !== undefined ? Number(quantity) : existing.quantity;
    const price = unit_price !== undefined ? Number(unit_price) : existing.unit_price;
    const totalCost = qty * price;

    db.prepare(`
      UPDATE PROCURES SET
        supplier_id = ?, item_id = ?, procure_date = ?,
        quantity = ?, unit_price = ?, total_cost = ?, status = ?
      WHERE procure_id = ?
    `).run(
      supplier_id ? Number(supplier_id) : existing.supplier_id,
      item_id ? Number(item_id) : existing.item_id,
      procure_date || existing.procure_date,
      qty,
      price,
      totalCost,
      status || existing.status,
      procureId
    );

    res.json({ success: true, message: 'Procurement updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE procurement
router.delete('/:id', (req, res) => {
  try {
    db.prepare(`DELETE FROM PROCURES WHERE procure_id = ?`).run(req.params.id);
    res.json({ success: true, message: 'Procurement record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
