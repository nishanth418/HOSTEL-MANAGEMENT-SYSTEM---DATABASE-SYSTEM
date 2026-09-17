const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET all inventory items
router.get('/', (req, res) => {
  try {
    const { category, low_stock, hostel_id } = req.query;
    let query = `
      SELECT 
        i.*,
        h.name AS hostel_name,
        CASE WHEN i.quantity <= i.min_required_quantity THEN 1 ELSE 0 END AS is_low_stock
      FROM INVENTORY_ITEM i
      LEFT JOIN HOSTEL h ON i.hostel_id = h.hostel_id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ` AND i.category = ?`;
      params.push(category);
    }
    if (hostel_id) {
      query += ` AND i.hostel_id = ?`;
      params.push(hostel_id);
    }
    if (low_stock === 'true' || low_stock === '1') {
      query += ` AND i.quantity <= i.min_required_quantity`;
    }

    query += ` ORDER BY i.category ASC, i.item_name ASC`;

    const rows = db.prepare(query).all(...params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single inventory item
router.get('/:id', (req, res) => {
  try {
    const item = db.prepare(`
      SELECT i.*, h.name AS hostel_name
      FROM INVENTORY_ITEM i
      LEFT JOIN HOSTEL h ON i.hostel_id = h.hostel_id
      WHERE i.item_id = ?
    `).get(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const procurements = db.prepare(`
      SELECT p.*, s.name AS supplier_name, s.company_name
      FROM PROCURES p
      JOIN SUPPLIER s ON p.supplier_id = s.supplier_id
      WHERE p.item_id = ?
      ORDER BY p.procure_date DESC
    `).all(req.params.id);

    res.json({ success: true, data: { ...item, procurements } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create inventory item
router.post('/', (req, res) => {
  try {
    const { item_name, category, quantity, unit, min_required_quantity, hostel_id } = req.body;
    if (!item_name || !category || quantity === undefined || !unit) {
      return res.status(400).json({ success: false, message: 'item_name, category, quantity, and unit are required' });
    }

    const result = db.prepare(`
      INSERT INTO INVENTORY_ITEM (item_name, category, quantity, unit, min_required_quantity, hostel_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      item_name,
      category,
      Number(quantity),
      unit,
      min_required_quantity !== undefined ? Number(min_required_quantity) : 10,
      hostel_id ? Number(hostel_id) : null
    );

    res.status(201).json({ success: true, message: 'Inventory item created successfully', itemId: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update inventory item
router.put('/:id', (req, res) => {
  try {
    const itemId = req.params.id;
    const { item_name, category, quantity, unit, min_required_quantity, hostel_id } = req.body;

    const existing = db.prepare(`SELECT * FROM INVENTORY_ITEM WHERE item_id = ?`).get(itemId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    db.prepare(`
      UPDATE INVENTORY_ITEM SET
        item_name = ?, category = ?, quantity = ?, unit = ?,
        min_required_quantity = ?, hostel_id = ?
      WHERE item_id = ?
    `).run(
      item_name || existing.item_name,
      category || existing.category,
      quantity !== undefined ? Number(quantity) : existing.quantity,
      unit || existing.unit,
      min_required_quantity !== undefined ? Number(min_required_quantity) : existing.min_required_quantity,
      hostel_id !== undefined ? (hostel_id ? Number(hostel_id) : null) : existing.hostel_id,
      itemId
    );

    res.json({ success: true, message: 'Inventory item updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE inventory item
router.delete('/:id', (req, res) => {
  try {
    const itemId = req.params.id;
    const procureCount = db.prepare(`SELECT COUNT(*) AS count FROM PROCURES WHERE item_id = ?`).get(itemId);
    if (procureCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete inventory item: ${procureCount.count} procurement records are linked to it. Foreign key protection active.`
      });
    }

    db.prepare(`DELETE FROM INVENTORY_ITEM WHERE item_id = ?`).run(itemId);
    res.json({ success: true, message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
