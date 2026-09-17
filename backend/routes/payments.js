const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET all payments with student name & payment details
router.get('/', (req, res) => {
  try {
    const { student_id, payment_status, method } = req.query;
    let query = `
      SELECT 
        p.*,
        s.first_name || ' ' || s.last_name AS student_name,
        s.email AS student_email,
        r.room_number,
        h.name AS hostel_name,
        (SELECT COUNT(*) FROM PAYMENT_DETAIL pd WHERE pd.payment_id = p.payment_id) AS details_count
      FROM PAYMENT p
      JOIN STUDENT s ON p.student_id = s.student_id
      LEFT JOIN ROOM r ON s.room_id = r.room_id
      LEFT JOIN HOSTEL h ON r.hostel_id = h.hostel_id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ` AND p.student_id = ?`;
      params.push(student_id);
    }
    if (payment_status) {
      query += ` AND p.payment_status = ?`;
      params.push(payment_status);
    }
    if (method) {
      query += ` AND p.payment_method = ?`;
      params.push(method);
    }

    query += ` ORDER BY p.payment_date DESC, p.payment_id DESC`;

    const rows = db.prepare(query).all(...params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single payment with detail items
router.get('/:id', (req, res) => {
  try {
    const payment = db.prepare(`
      SELECT 
        p.*,
        s.first_name || ' ' || s.last_name AS student_name,
        s.email AS student_email,
        r.room_number,
        h.name AS hostel_name
      FROM PAYMENT p
      JOIN STUDENT s ON p.student_id = s.student_id
      LEFT JOIN ROOM r ON s.room_id = r.room_id
      LEFT JOIN HOSTEL h ON r.hostel_id = h.hostel_id
      WHERE p.payment_id = ?
    `).get(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const details = db.prepare(`SELECT * FROM PAYMENT_DETAIL WHERE payment_id = ?`).all(req.params.id);
    res.json({ success: true, data: { ...payment, details } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create payment with optional details array
router.post('/', (req, res) => {
  try {
    const { student_id, payment_date, total_amount, payment_method, payment_status, transaction_id, details } = req.body;
    if (!student_id || !payment_date || total_amount === undefined || !payment_method || !transaction_id) {
      return res.status(400).json({ success: false, message: 'All main payment fields and transaction_id are required' });
    }

    const insertTx = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO PAYMENT (student_id, payment_date, total_amount, payment_method, payment_status, transaction_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        Number(student_id),
        payment_date,
        Number(total_amount),
        payment_method,
        payment_status || 'Paid',
        transaction_id
      );

      const paymentId = result.lastInsertRowid;

      if (details && Array.isArray(details) && details.length > 0) {
        const insDetail = db.prepare(`
          INSERT INTO PAYMENT_DETAIL (payment_id, fee_type, amount, remarks)
          VALUES (?, ?, ?, ?)
        `);
        for (const item of details) {
          if (item.fee_type && item.amount !== undefined) {
            insDetail.run(paymentId, item.fee_type, Number(item.amount), item.remarks || '');
          }
        }
      } else {
        // Create a default detail line if none provided
        db.prepare(`
          INSERT INTO PAYMENT_DETAIL (payment_id, fee_type, amount, remarks)
          VALUES (?, 'Hostel Rent', ?, 'Standard Monthly Fee')
        `).run(paymentId, Number(total_amount));
      }

      return paymentId;
    });

    const paymentId = insertTx();
    res.status(201).json({ success: true, message: 'Payment created successfully', paymentId });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: PAYMENT.transaction_id')) {
      return res.status(409).json({ success: false, message: 'A payment with this transaction ID already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update payment
router.put('/:id', (req, res) => {
  try {
    const paymentId = req.params.id;
    const { student_id, payment_date, total_amount, payment_method, payment_status, transaction_id, details } = req.body;

    const existing = db.prepare(`SELECT * FROM PAYMENT WHERE payment_id = ?`).get(paymentId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const updateTx = db.transaction(() => {
      db.prepare(`
        UPDATE PAYMENT SET
          student_id = ?, payment_date = ?, total_amount = ?,
          payment_method = ?, payment_status = ?, transaction_id = ?
        WHERE payment_id = ?
      `).run(
        student_id ? Number(student_id) : existing.student_id,
        payment_date || existing.payment_date,
        total_amount !== undefined ? Number(total_amount) : existing.total_amount,
        payment_method || existing.payment_method,
        payment_status || existing.payment_status,
        transaction_id || existing.transaction_id,
        paymentId
      );

      if (details && Array.isArray(details)) {
        db.prepare(`DELETE FROM PAYMENT_DETAIL WHERE payment_id = ?`).run(paymentId);
        const insDetail = db.prepare(`
          INSERT INTO PAYMENT_DETAIL (payment_id, fee_type, amount, remarks)
          VALUES (?, ?, ?, ?)
        `);
        for (const item of details) {
          if (item.fee_type && item.amount !== undefined) {
            insDetail.run(paymentId, item.fee_type, Number(item.amount), item.remarks || '');
          }
        }
      }
    });

    updateTx();
    res.json({ success: true, message: 'Payment updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE payment
router.delete('/:id', (req, res) => {
  try {
    db.prepare(`DELETE FROM PAYMENT WHERE payment_id = ?`).run(req.params.id);
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add payment detail line
router.post('/:id/details', (req, res) => {
  try {
    const { fee_type, amount, remarks } = req.body;
    if (!fee_type || amount === undefined) {
      return res.status(400).json({ success: false, message: 'fee_type and amount are required' });
    }
    const result = db.prepare(`
      INSERT INTO PAYMENT_DETAIL (payment_id, fee_type, amount, remarks)
      VALUES (?, ?, ?, ?)
    `).run(req.params.id, fee_type, Number(amount), remarks || '');

    res.status(201).json({ success: true, message: 'Detail line added', detailId: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove payment detail line
router.delete('/:id/details/:detail_id', (req, res) => {
  try {
    db.prepare(`DELETE FROM PAYMENT_DETAIL WHERE payment_id = ? AND detail_id = ?`).run(req.params.id, req.params.detail_id);
    res.json({ success: true, message: 'Detail line deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
