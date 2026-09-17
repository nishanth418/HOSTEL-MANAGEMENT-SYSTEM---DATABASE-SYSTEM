const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET all hostels with warden info & room count summary
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT 
        h.*,
        w.name AS warden_name,
        w.email AS warden_email,
        COUNT(DISTINCT r.room_id) AS total_rooms,
        SUM(CASE WHEN r.status = 'Occupied' THEN 1 ELSE 0 END) AS occupied_rooms,
        SUM(CASE WHEN r.status = 'Available' THEN 1 ELSE 0 END) AS available_rooms,
        COALESCE(SUM(rt.capacity), 0) AS total_capacity
      FROM HOSTEL h
      LEFT JOIN WARDEN w ON h.warden_id = w.warden_id
      LEFT JOIN ROOM r ON h.hostel_id = r.hostel_id
      LEFT JOIN ROOM_TYPE rt ON r.type_id = rt.type_id
      GROUP BY h.hostel_id
      ORDER BY h.hostel_id ASC
    `).all();

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single hostel
router.get('/:id', (req, res) => {
  try {
    const hostel = db.prepare(`
      SELECT h.*, w.name AS warden_name, w.email AS warden_email
      FROM HOSTEL h
      LEFT JOIN WARDEN w ON h.warden_id = w.warden_id
      WHERE h.hostel_id = ?
    `).get(req.params.id);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const rooms = db.prepare(`
      SELECT r.*, rt.type_name, rt.capacity, rt.fee_per_month
      FROM ROOM r
      JOIN ROOM_TYPE rt ON r.type_id = rt.type_id
      WHERE r.hostel_id = ?
    `).all(req.params.id);

    res.json({ success: true, data: { ...hostel, rooms } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create hostel
router.post('/', (req, res) => {
  try {
    const { name, type, total_floors, warden_id, address } = req.body;
    if (!name || !type || !total_floors || !address) {
      return res.status(400).json({ success: false, message: 'Name, type, total_floors, and address are required' });
    }

    const result = db.prepare(`
      INSERT INTO HOSTEL (name, type, total_floors, warden_id, address)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, type, Number(total_floors), warden_id ? Number(warden_id) : null, address);

    res.status(201).json({ success: true, message: 'Hostel created successfully', hostelId: result.lastInsertRowid });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: HOSTEL.name')) {
      return res.status(409).json({ success: false, message: 'A hostel with this name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update hostel
router.put('/:id', (req, res) => {
  try {
    const hostelId = req.params.id;
    const { name, type, total_floors, warden_id, address } = req.body;

    const existing = db.prepare(`SELECT * FROM HOSTEL WHERE hostel_id = ?`).get(hostelId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    db.prepare(`
      UPDATE HOSTEL SET
        name = ?, type = ?, total_floors = ?, warden_id = ?, address = ?
      WHERE hostel_id = ?
    `).run(
      name || existing.name,
      type || existing.type,
      total_floors !== undefined ? Number(total_floors) : existing.total_floors,
      warden_id !== undefined ? (warden_id ? Number(warden_id) : null) : existing.warden_id,
      address || existing.address,
      hostelId
    );

    res.json({ success: true, message: 'Hostel updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE hostel
router.delete('/:id', (req, res) => {
  try {
    const hostelId = req.params.id;
    // Check if rooms or mess exist in this hostel
    const roomCount = db.prepare(`SELECT COUNT(*) AS count FROM ROOM WHERE hostel_id = ?`).get(hostelId);
    if (roomCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete hostel: it currently contains ${roomCount.count} rooms. Please reassign or delete rooms first.`
      });
    }

    db.prepare(`DELETE FROM HOSTEL WHERE hostel_id = ?`).run(hostelId);
    res.json({ success: true, message: 'Hostel deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
