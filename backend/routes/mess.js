const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET all mess facilities with contacts & hostel info
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT 
        m.*,
        h.name AS hostel_name,
        GROUP_CONCAT(mc.contact_number, ', ') AS contact_numbers,
        (SELECT COUNT(*) FROM MEAL ml WHERE ml.mess_id = m.mess_id) AS total_meals_scheduled,
        (SELECT COUNT(*) FROM STAFF st WHERE st.mess_id = m.mess_id) AS staff_count
      FROM MESS m
      LEFT JOIN HOSTEL h ON m.hostel_id = h.hostel_id
      LEFT JOIN MESS_CONTACT mc ON m.mess_id = mc.mess_id
      GROUP BY m.mess_id
      ORDER BY m.mess_id ASC
    `).all();

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single mess
router.get('/:id', (req, res) => {
  try {
    const mess = db.prepare(`
      SELECT m.*, h.name AS hostel_name
      FROM MESS m
      LEFT JOIN HOSTEL h ON m.hostel_id = h.hostel_id
      WHERE m.mess_id = ?
    `).get(req.params.id);

    if (!mess) {
      return res.status(404).json({ success: false, message: 'Mess not found' });
    }

    const contacts = db.prepare(`SELECT contact_number FROM MESS_CONTACT WHERE mess_id = ?`).all(req.params.id).map(c => c.contact_number);
    const meals = db.prepare(`SELECT * FROM MEAL WHERE mess_id = ? ORDER BY day_of_week, start_time`).all(req.params.id);
    const staff = db.prepare(`SELECT staff_id, name, role FROM STAFF WHERE mess_id = ?`).all(req.params.id);

    res.json({ success: true, data: { ...mess, contacts, meals, staff } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create mess
router.post('/', (req, res) => {
  try {
    const { mess_name, hostel_id, capacity, type, contacts } = req.body;
    if (!mess_name || !capacity || !type) {
      return res.status(400).json({ success: false, message: 'mess_name, capacity, and type are required' });
    }

    const insertTx = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO MESS (mess_name, hostel_id, capacity, type)
        VALUES (?, ?, ?, ?)
      `).run(mess_name, hostel_id ? Number(hostel_id) : null, Number(capacity), type);

      const messId = result.lastInsertRowid;

      if (contacts && Array.isArray(contacts)) {
        const insContact = db.prepare(`INSERT INTO MESS_CONTACT (mess_id, contact_number) VALUES (?, ?)`);
        for (const c of contacts) {
          if (c && c.trim()) {
            insContact.run(messId, c.trim());
          }
        }
      }

      return messId;
    });

    const messId = insertTx();
    res.status(201).json({ success: true, message: 'Mess facility created successfully', messId });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: MESS.mess_name')) {
      return res.status(409).json({ success: false, message: 'A mess with this name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update mess
router.put('/:id', (req, res) => {
  try {
    const messId = req.params.id;
    const { mess_name, hostel_id, capacity, type, contacts } = req.body;

    const existing = db.prepare(`SELECT * FROM MESS WHERE mess_id = ?`).get(messId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Mess not found' });
    }

    const updateTx = db.transaction(() => {
      db.prepare(`
        UPDATE MESS SET
          mess_name = ?, hostel_id = ?, capacity = ?, type = ?
        WHERE mess_id = ?
      `).run(
        mess_name || existing.mess_name,
        hostel_id !== undefined ? (hostel_id ? Number(hostel_id) : null) : existing.hostel_id,
        capacity !== undefined ? Number(capacity) : existing.capacity,
        type || existing.type,
        messId
      );

      if (contacts && Array.isArray(contacts)) {
        db.prepare(`DELETE FROM MESS_CONTACT WHERE mess_id = ?`).run(messId);
        const insContact = db.prepare(`INSERT INTO MESS_CONTACT (mess_id, contact_number) VALUES (?, ?)`);
        for (const c of contacts) {
          if (c && c.trim()) {
            insContact.run(messId, c.trim());
          }
        }
      }
    });

    updateTx();
    res.json({ success: true, message: 'Mess updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE mess
router.delete('/:id', (req, res) => {
  try {
    const messId = req.params.id;
    db.prepare(`DELETE FROM MESS WHERE mess_id = ?`).run(messId);
    res.json({ success: true, message: 'Mess deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
