const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET all students
router.get('/', (req, res) => {
  try {
    const { search, hostel_id, status } = req.query;
    let query = `
      SELECT 
        s.*,
        r.room_number,
        r.floor,
        h.name AS hostel_name,
        h.hostel_id,
        rt.type_name AS room_type_name,
        rt.fee_per_month,
        GROUP_CONCAT(sp.phone_number, ', ') AS phone_numbers
      FROM STUDENT s
      LEFT JOIN ROOM r ON s.room_id = r.room_id
      LEFT JOIN HOSTEL h ON r.hostel_id = h.hostel_id
      LEFT JOIN ROOM_TYPE rt ON r.type_id = rt.type_id
      LEFT JOIN STUDENT_PHONE sp ON s.student_id = sp.student_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.email LIKE ? OR r.room_number LIKE ?)`;
      const sTerm = `%${search}%`;
      params.push(sTerm, sTerm, sTerm, sTerm);
    }
    if (hostel_id) {
      query += ` AND h.hostel_id = ?`;
      params.push(hostel_id);
    }
    if (status) {
      query += ` AND s.status = ?`;
      params.push(status);
    }

    query += ` GROUP BY s.student_id ORDER BY s.student_id DESC`;

    const rows = db.prepare(query).all(...params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single student
router.get('/:id', (req, res) => {
  try {
    const student = db.prepare(`
      SELECT 
        s.*,
        r.room_number,
        r.floor,
        h.name AS hostel_name,
        h.hostel_id,
        rt.type_name AS room_type_name,
        rt.fee_per_month
      FROM STUDENT s
      LEFT JOIN ROOM r ON s.room_id = r.room_id
      LEFT JOIN HOSTEL h ON r.hostel_id = h.hostel_id
      LEFT JOIN ROOM_TYPE rt ON r.type_id = rt.type_id
      WHERE s.student_id = ?
    `).get(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const phones = db.prepare(`
      SELECT phone_number FROM STUDENT_PHONE WHERE student_id = ?
    `).all(req.params.id).map(p => p.phone_number);

    res.json({ success: true, data: { ...student, phones } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new student
router.post('/', (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      dob,
      gender,
      blood_group,
      guardian_name,
      guardian_phone,
      address,
      admission_date,
      room_id,
      status,
      phones
    } = req.body;

    if (!first_name || !last_name || !email || !dob || !gender || !guardian_name || !guardian_phone || !address || !admission_date) {
      return res.status(400).json({ success: false, message: 'All required student fields must be provided' });
    }

    const insertStudent = db.prepare(`
      INSERT INTO STUDENT (
        first_name, last_name, email, dob, gender, blood_group,
        guardian_name, guardian_phone, address, admission_date, room_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertTransaction = db.transaction(() => {
      const result = insertStudent.run(
        first_name,
        last_name,
        email,
        dob,
        gender,
        blood_group || null,
        guardian_name,
        guardian_phone,
        address,
        admission_date,
        room_id || null,
        status || 'Active'
      );
      const studentId = result.lastInsertRowid;

      if (phones && Array.isArray(phones)) {
        const insertPhone = db.prepare(`INSERT INTO STUDENT_PHONE (student_id, phone_number) VALUES (?, ?)`);
        for (const phone of phones) {
          if (phone && phone.trim()) {
            insertPhone.run(studentId, phone.trim());
          }
        }
      }

      // If room assigned, mark room as Occupied if needed
      if (room_id) {
        db.prepare(`UPDATE ROOM SET status = 'Occupied' WHERE room_id = ? AND status = 'Available'`).run(room_id);
      }

      return studentId;
    });

    const studentId = insertTransaction();
    res.status(201).json({ success: true, message: 'Student created successfully', studentId });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: STUDENT.email')) {
      return res.status(409).json({ success: false, message: 'A student with this email already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update student
router.put('/:id', (req, res) => {
  try {
    const studentId = req.params.id;
    const {
      first_name,
      last_name,
      email,
      dob,
      gender,
      blood_group,
      guardian_name,
      guardian_phone,
      address,
      admission_date,
      room_id,
      status,
      phones
    } = req.body;

    const existing = db.prepare(`SELECT * FROM STUDENT WHERE student_id = ?`).get(studentId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const updateTx = db.transaction(() => {
      db.prepare(`
        UPDATE STUDENT SET
          first_name = ?, last_name = ?, email = ?, dob = ?, gender = ?,
          blood_group = ?, guardian_name = ?, guardian_phone = ?, address = ?,
          admission_date = ?, room_id = ?, status = ?
        WHERE student_id = ?
      `).run(
        first_name || existing.first_name,
        last_name || existing.last_name,
        email || existing.email,
        dob || existing.dob,
        gender || existing.gender,
        blood_group !== undefined ? blood_group : existing.blood_group,
        guardian_name || existing.guardian_name,
        guardian_phone || existing.guardian_phone,
        address || existing.address,
        admission_date || existing.admission_date,
        room_id !== undefined ? (room_id ? Number(room_id) : null) : existing.room_id,
        status || existing.status,
        studentId
      );

      if (phones && Array.isArray(phones)) {
        db.prepare(`DELETE FROM STUDENT_PHONE WHERE student_id = ?`).run(studentId);
        const insertPhone = db.prepare(`INSERT INTO STUDENT_PHONE (student_id, phone_number) VALUES (?, ?)`);
        for (const phone of phones) {
          if (phone && phone.trim()) {
            insertPhone.run(studentId, phone.trim());
          }
        }
      }
    });

    updateTx();
    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE student
router.delete('/:id', (req, res) => {
  try {
    const studentId = req.params.id;
    const existing = db.prepare(`SELECT * FROM STUDENT WHERE student_id = ?`).get(studentId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Deleting student cascades to STUDENT_PHONE, but check payments if restricted
    const paymentCount = db.prepare(`SELECT COUNT(*) AS count FROM PAYMENT WHERE student_id = ?`).get(studentId);
    if (paymentCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete student with ${paymentCount.count} existing payment records. Foreign key protection active.`
      });
    }

    db.prepare(`DELETE FROM STUDENT WHERE student_id = ?`).run(studentId);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Student phone management endpoints
router.post('/:id/phones', (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    db.prepare(`INSERT INTO STUDENT_PHONE (student_id, phone_number) VALUES (?, ?)`).run(req.params.id, phone_number);
    res.status(201).json({ success: true, message: 'Phone added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id/phones/:phone', (req, res) => {
  try {
    db.prepare(`DELETE FROM STUDENT_PHONE WHERE student_id = ? AND phone_number = ?`).run(req.params.id, req.params.phone);
    res.json({ success: true, message: 'Phone deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
