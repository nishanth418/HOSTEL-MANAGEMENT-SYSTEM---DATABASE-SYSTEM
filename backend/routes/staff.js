const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET all staff with phones, hostel, mess
router.get('/', (req, res) => {
  try {
    const { role, hostel_id, status } = req.query;
    let query = `
      SELECT 
        st.*,
        h.name AS hostel_name,
        m.mess_name,
        GROUP_CONCAT(sp.phone_number, ', ') AS phone_numbers
      FROM STAFF st
      LEFT JOIN HOSTEL h ON st.hostel_id = h.hostel_id
      LEFT JOIN MESS m ON st.mess_id = m.mess_id
      LEFT JOIN STAFF_PHONE sp ON st.staff_id = sp.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      query += ` AND st.role = ?`;
      params.push(role);
    }
    if (hostel_id) {
      query += ` AND st.hostel_id = ?`;
      params.push(hostel_id);
    }
    if (status) {
      query += ` AND st.status = ?`;
      params.push(status);
    }

    query += ` GROUP BY st.staff_id ORDER BY st.staff_id ASC`;

    const rows = db.prepare(query).all(...params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single staff
router.get('/:id', (req, res) => {
  try {
    const staff = db.prepare(`
      SELECT 
        st.*,
        h.name AS hostel_name,
        m.mess_name
      FROM STAFF st
      LEFT JOIN HOSTEL h ON st.hostel_id = h.hostel_id
      LEFT JOIN MESS m ON st.mess_id = m.mess_id
      WHERE st.staff_id = ?
    `).get(req.params.id);

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const phones = db.prepare(`SELECT phone_number FROM STAFF_PHONE WHERE staff_id = ?`).all(req.params.id).map(p => p.phone_number);
    res.json({ success: true, data: { ...staff, phones } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create staff
router.post('/', (req, res) => {
  try {
    const { name, role, salary, hostel_id, mess_id, join_date, status, phones } = req.body;
    if (!name || !role || salary === undefined || !join_date) {
      return res.status(400).json({ success: false, message: 'Name, role, salary, and join_date are required' });
    }

    const insertTx = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO STAFF (name, role, salary, hostel_id, mess_id, join_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        name,
        role,
        Number(salary),
        hostel_id ? Number(hostel_id) : null,
        mess_id ? Number(mess_id) : null,
        join_date,
        status || 'Active'
      );

      const staffId = result.lastInsertRowid;

      if (phones && Array.isArray(phones)) {
        const insPhone = db.prepare(`INSERT INTO STAFF_PHONE (staff_id, phone_number) VALUES (?, ?)`);
        for (const p of phones) {
          if (p && p.trim()) {
            insPhone.run(staffId, p.trim());
          }
        }
      }

      return staffId;
    });

    const staffId = insertTx();
    res.status(201).json({ success: true, message: 'Staff created successfully', staffId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update staff
router.put('/:id', (req, res) => {
  try {
    const staffId = req.params.id;
    const { name, role, salary, hostel_id, mess_id, join_date, status, phones } = req.body;

    const existing = db.prepare(`SELECT * FROM STAFF WHERE staff_id = ?`).get(staffId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    const updateTx = db.transaction(() => {
      db.prepare(`
        UPDATE STAFF SET
          name = ?, role = ?, salary = ?, hostel_id = ?, mess_id = ?,
          join_date = ?, status = ?
        WHERE staff_id = ?
      `).run(
        name || existing.name,
        role || existing.role,
        salary !== undefined ? Number(salary) : existing.salary,
        hostel_id !== undefined ? (hostel_id ? Number(hostel_id) : null) : existing.hostel_id,
        mess_id !== undefined ? (mess_id ? Number(mess_id) : null) : existing.mess_id,
        join_date || existing.join_date,
        status || existing.status,
        staffId
      );

      if (phones && Array.isArray(phones)) {
        db.prepare(`DELETE FROM STAFF_PHONE WHERE staff_id = ?`).run(staffId);
        const insPhone = db.prepare(`INSERT INTO STAFF_PHONE (staff_id, phone_number) VALUES (?, ?)`);
        for (const p of phones) {
          if (p && p.trim()) {
            insPhone.run(staffId, p.trim());
          }
        }
      }
    });

    updateTx();
    res.json({ success: true, message: 'Staff updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE staff
router.delete('/:id', (req, res) => {
  try {
    db.prepare(`DELETE FROM STAFF WHERE staff_id = ?`).run(req.params.id);
    res.json({ success: true, message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Staff phone routes
router.post('/:id/phones', (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    db.prepare(`INSERT INTO STAFF_PHONE (staff_id, phone_number) VALUES (?, ?)`).run(req.params.id, phone_number.trim());
    res.status(201).json({ success: true, message: 'Phone added' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id/phones/:phone', (req, res) => {
  try {
    db.prepare(`DELETE FROM STAFF_PHONE WHERE staff_id = ? AND phone_number = ?`).run(req.params.id, req.params.phone);
    res.json({ success: true, message: 'Phone deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
