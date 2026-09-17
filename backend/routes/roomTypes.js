const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET all room types
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT 
        rt.*,
        COUNT(r.room_id) AS total_rooms_configured
      FROM ROOM_TYPE rt
      LEFT JOIN ROOM r ON rt.type_id = r.type_id
      GROUP BY rt.type_id
      ORDER BY rt.fee_per_month DESC
    `).all();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single room type
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare(`SELECT * FROM ROOM_TYPE WHERE type_id = ?`).get(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Room type not found' });
    }
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create room type
router.post('/', (req, res) => {
  try {
    const { type_name, capacity, fee_per_month, description } = req.body;
    if (!type_name || !capacity || fee_per_month === undefined) {
      return res.status(400).json({ success: false, message: 'type_name, capacity, and fee_per_month are required' });
    }

    const result = db.prepare(`
      INSERT INTO ROOM_TYPE (type_name, capacity, fee_per_month, description)
      VALUES (?, ?, ?, ?)
    `).run(type_name, Number(capacity), Number(fee_per_month), description || '');

    res.status(201).json({ success: true, message: 'Room type created successfully', typeId: result.lastInsertRowid });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: ROOM_TYPE.type_name')) {
      return res.status(409).json({ success: false, message: 'A room type with this name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update room type
router.put('/:id', (req, res) => {
  try {
    const typeId = req.params.id;
    const { type_name, capacity, fee_per_month, description } = req.body;

    const existing = db.prepare(`SELECT * FROM ROOM_TYPE WHERE type_id = ?`).get(typeId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Room type not found' });
    }

    db.prepare(`
      UPDATE ROOM_TYPE SET
        type_name = ?, capacity = ?, fee_per_month = ?, description = ?
      WHERE type_id = ?
    `).run(
      type_name || existing.type_name,
      capacity !== undefined ? Number(capacity) : existing.capacity,
      fee_per_month !== undefined ? Number(fee_per_month) : existing.fee_per_month,
      description !== undefined ? description : existing.description,
      typeId
    );

    res.json({ success: true, message: 'Room type updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE room type
router.delete('/:id', (req, res) => {
  try {
    const typeId = req.params.id;
    const roomCount = db.prepare(`SELECT COUNT(*) AS count FROM ROOM WHERE type_id = ?`).get(typeId);
    if (roomCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room type: ${roomCount.count} rooms are assigned to it.`
      });
    }

    db.prepare(`DELETE FROM ROOM_TYPE WHERE type_id = ?`).run(typeId);
    res.json({ success: true, message: 'Room type deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
