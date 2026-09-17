const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET all wardens with phone numbers and assigned hostel
router.get('/', (req, res) => {
  try {
    const wardens = db.prepare(`
      SELECT 
        w.*,
        h.name AS hostel_name,
        h.hostel_id,
        GROUP_CONCAT(wp.phone_number, ', ') AS phone_numbers
      FROM WARDEN w
      LEFT JOIN HOSTEL h ON w.warden_id = h.warden_id
      LEFT JOIN WARDEN_PHONE wp ON w.warden_id = wp.warden_id
      GROUP BY w.warden_id
      ORDER BY w.warden_id ASC
    `).all();

    res.json({ success: true, count: wardens.length, data: wardens });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single warden
router.get('/:id', (req, res) => {
  try {
    const warden = db.prepare(`
      SELECT 
        w.*,
        h.name AS hostel_name,
        h.hostel_id
      FROM WARDEN w
      LEFT JOIN HOSTEL h ON w.warden_id = h.warden_id
      WHERE w.warden_id = ?
    `).get(req.params.id);

    if (!warden) {
      return res.status(404).json({ success: false, message: 'Warden not found' });
    }

    const phones = db.prepare(`SELECT phone_number FROM WARDEN_PHONE WHERE warden_id = ?`).all(req.params.id).map(p => p.phone_number);
    res.json({ success: true, data: { ...warden, phones } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create warden
router.post('/', (req, res) => {
  try {
    const { name, email, gender, address, join_date, salary, phones } = req.body;
    if (!name || !email || !join_date || salary === undefined) {
      return res.status(400).json({ success: false, message: 'Name, email, join_date, and salary are required' });
    }

    const insertTx = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO WARDEN (name, email, gender, address, join_date, salary)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(name, email, gender || 'Other', address || '', join_date, Number(salary));

      const wardenId = result.lastInsertRowid;

      if (phones && Array.isArray(phones)) {
        const insertPhone = db.prepare(`INSERT INTO WARDEN_PHONE (warden_id, phone_number) VALUES (?, ?)`);
        for (const phone of phones) {
          if (phone && phone.trim()) {
            insertPhone.run(wardenId, phone.trim());
          }
        }
      }
      return wardenId;
    });

    const wardenId = insertTx();
    res.status(201).json({ success: true, message: 'Warden created successfully', wardenId });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: WARDEN.email')) {
      return res.status(409).json({ success: false, message: 'A warden with this email already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update warden
router.put('/:id', (req, res) => {
  try {
    const wardenId = req.params.id;
    const { name, email, gender, address, join_date, salary, phones } = req.body;

    const existing = db.prepare(`SELECT * FROM WARDEN WHERE warden_id = ?`).get(wardenId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Warden not found' });
    }

    const updateTx = db.transaction(() => {
      db.prepare(`
        UPDATE WARDEN SET
          name = ?, email = ?, gender = ?, address = ?, join_date = ?, salary = ?
        WHERE warden_id = ?
      `).run(
        name || existing.name,
        email || existing.email,
        gender || existing.gender,
        address !== undefined ? address : existing.address,
        join_date || existing.join_date,
        salary !== undefined ? Number(salary) : existing.salary,
        wardenId
      );

      if (phones && Array.isArray(phones)) {
        db.prepare(`DELETE FROM WARDEN_PHONE WHERE warden_id = ?`).run(wardenId);
        const insertPhone = db.prepare(`INSERT INTO WARDEN_PHONE (warden_id, phone_number) VALUES (?, ?)`);
        for (const phone of phones) {
          if (phone && phone.trim()) {
            insertPhone.run(wardenId, phone.trim());
          }
        }
      }
    });

    updateTx();
    res.json({ success: true, message: 'Warden updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE warden
router.delete('/:id', (req, res) => {
  try {
    const wardenId = req.params.id;
    db.prepare(`DELETE FROM WARDEN WHERE warden_id = ?`).run(wardenId);
    res.json({ success: true, message: 'Warden deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Warden phone operations
router.post('/:id/phones', (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    db.prepare(`INSERT INTO WARDEN_PHONE (warden_id, phone_number) VALUES (?, ?)`).run(req.params.id, phone_number.trim());
    res.status(201).json({ success: true, message: 'Phone number added' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id/phones/:phone', (req, res) => {
  try {
    db.prepare(`DELETE FROM WARDEN_PHONE WHERE warden_id = ? AND phone_number = ?`).run(req.params.id, req.params.phone);
    res.json({ success: true, message: 'Phone number deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
