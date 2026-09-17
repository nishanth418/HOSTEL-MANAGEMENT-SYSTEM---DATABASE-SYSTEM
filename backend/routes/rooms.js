const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET all rooms with hostel and type details
router.get('/', (req, res) => {
  try {
    const { hostel_id, type_id, status } = req.query;
    let query = `
      SELECT 
        r.*,
        h.name AS hostel_name,
        h.type AS hostel_type,
        rt.type_name,
        rt.capacity,
        rt.fee_per_month,
        (SELECT COUNT(*) FROM STUDENT s WHERE s.room_id = r.room_id AND s.status = 'Active') AS current_occupants
      FROM ROOM r
      JOIN HOSTEL h ON r.hostel_id = h.hostel_id
      JOIN ROOM_TYPE rt ON r.type_id = rt.type_id
      WHERE 1=1
    `;
    const params = [];

    if (hostel_id) {
      query += ` AND r.hostel_id = ?`;
      params.push(hostel_id);
    }
    if (type_id) {
      query += ` AND r.type_id = ?`;
      params.push(type_id);
    }
    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY h.name ASC, r.floor ASC, r.room_number ASC`;

    const rows = db.prepare(query).all(...params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single room
router.get('/:id', (req, res) => {
  try {
    const room = db.prepare(`
      SELECT 
        r.*,
        h.name AS hostel_name,
        rt.type_name,
        rt.capacity,
        rt.fee_per_month
      FROM ROOM r
      JOIN HOSTEL h ON r.hostel_id = h.hostel_id
      JOIN ROOM_TYPE rt ON r.type_id = rt.type_id
      WHERE r.room_id = ?
    `).get(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const students = db.prepare(`
      SELECT student_id, first_name, last_name, email, status
      FROM STUDENT
      WHERE room_id = ?
    `).all(req.params.id);

    res.json({ success: true, data: { ...room, students } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create room
router.post('/', (req, res) => {
  try {
    const { room_number, hostel_id, type_id, floor, status } = req.body;
    if (!room_number || !hostel_id || !type_id || floor === undefined) {
      return res.status(400).json({ success: false, message: 'room_number, hostel_id, type_id, and floor are required' });
    }

    const result = db.prepare(`
      INSERT INTO ROOM (room_number, hostel_id, type_id, floor, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(room_number, Number(hostel_id), Number(type_id), Number(floor), status || 'Available');

    res.status(201).json({ success: true, message: 'Room created successfully', roomId: result.lastInsertRowid });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: ROOM.hostel_id, ROOM.room_number')) {
      return res.status(409).json({ success: false, message: 'A room with this number already exists in this hostel' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update room
router.put('/:id', (req, res) => {
  try {
    const roomId = req.params.id;
    const { room_number, hostel_id, type_id, floor, status } = req.body;

    const existing = db.prepare(`SELECT * FROM ROOM WHERE room_id = ?`).get(roomId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    db.prepare(`
      UPDATE ROOM SET
        room_number = ?, hostel_id = ?, type_id = ?, floor = ?, status = ?
      WHERE room_id = ?
    `).run(
      room_number || existing.room_number,
      hostel_id ? Number(hostel_id) : existing.hostel_id,
      type_id ? Number(type_id) : existing.type_id,
      floor !== undefined ? Number(floor) : existing.floor,
      status || existing.status,
      roomId
    );

    res.json({ success: true, message: 'Room updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE room
router.delete('/:id', (req, res) => {
  try {
    const roomId = req.params.id;
    const students = db.prepare(`SELECT COUNT(*) AS count FROM STUDENT WHERE room_id = ?`).get(roomId);
    if (students.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room: ${students.count} students are currently assigned to it. Please reassign them first.`
      });
    }

    db.prepare(`DELETE FROM ROOM WHERE room_id = ?`).run(roomId);
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
