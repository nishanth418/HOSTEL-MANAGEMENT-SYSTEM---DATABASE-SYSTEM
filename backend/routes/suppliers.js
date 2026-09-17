const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET all suppliers with phone numbers
router.get('/', (req, res) => {
  try {
    const { category, search } = req.query;
    let query = `
      SELECT 
        s.*,
        GROUP_CONCAT(sp.phone_number, ', ') AS phone_numbers,
        (SELECT COUNT(*) FROM PROCURES p WHERE p.supplier_id = s.supplier_id) AS total_orders,
        COALESCE((SELECT SUM(p.total_cost) FROM PROCURES p WHERE p.supplier_id = s.supplier_id), 0) AS total_procured_value
      FROM SUPPLIER s
      LEFT JOIN SUPPLIER_PHONE sp ON s.supplier_id = sp.supplier_id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ` AND s.category = ?`;
      params.push(category);
    }
    if (search) {
      query += ` AND (s.name LIKE ? OR s.company_name LIKE ? OR s.email LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ` GROUP BY s.supplier_id ORDER BY s.name ASC`;

    const rows = db.prepare(query).all(...params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single supplier
router.get('/:id', (req, res) => {
  try {
    const supplier = db.prepare(`SELECT * FROM SUPPLIER WHERE supplier_id = ?`).get(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const phones = db.prepare(`SELECT phone_number FROM SUPPLIER_PHONE WHERE supplier_id = ?`).all(req.params.id).map(p => p.phone_number);
    const procurements = db.prepare(`
      SELECT p.*, i.item_name, i.unit
      FROM PROCURES p
      JOIN INVENTORY_ITEM i ON p.item_id = i.item_id
      WHERE p.supplier_id = ?
      ORDER BY p.procure_date DESC
    `).all(req.params.id);

    res.json({ success: true, data: { ...supplier, phones, procurements } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create supplier
router.post('/', (req, res) => {
  try {
    const { name, company_name, email, address, category, phones } = req.body;
    if (!name || !company_name || !email || !address || !category) {
      return res.status(400).json({ success: false, message: 'All supplier fields are required' });
    }

    const insertTx = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO SUPPLIER (name, company_name, email, address, category)
        VALUES (?, ?, ?, ?, ?)
      `).run(name, company_name, email, address, category);

      const supplierId = result.lastInsertRowid;

      if (phones && Array.isArray(phones)) {
        const insPhone = db.prepare(`INSERT INTO SUPPLIER_PHONE (supplier_id, phone_number) VALUES (?, ?)`);
        for (const p of phones) {
          if (p && p.trim()) {
            insPhone.run(supplierId, p.trim());
          }
        }
      }

      return supplierId;
    });

    const supplierId = insertTx();
    res.status(201).json({ success: true, message: 'Supplier created successfully', supplierId });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: SUPPLIER.email')) {
      return res.status(409).json({ success: false, message: 'A supplier with this email already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update supplier
router.put('/:id', (req, res) => {
  try {
    const supplierId = req.params.id;
    const { name, company_name, email, address, category, phones } = req.body;

    const existing = db.prepare(`SELECT * FROM SUPPLIER WHERE supplier_id = ?`).get(supplierId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const updateTx = db.transaction(() => {
      db.prepare(`
        UPDATE SUPPLIER SET
          name = ?, company_name = ?, email = ?, address = ?, category = ?
        WHERE supplier_id = ?
      `).run(
        name || existing.name,
        company_name || existing.company_name,
        email || existing.email,
        address || existing.address,
        category || existing.category,
        supplierId
      );

      if (phones && Array.isArray(phones)) {
        db.prepare(`DELETE FROM SUPPLIER_PHONE WHERE supplier_id = ?`).run(supplierId);
        const insPhone = db.prepare(`INSERT INTO SUPPLIER_PHONE (supplier_id, phone_number) VALUES (?, ?)`);
        for (const p of phones) {
          if (p && p.trim()) {
            insPhone.run(supplierId, p.trim());
          }
        }
      }
    });

    updateTx();
    res.json({ success: true, message: 'Supplier updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE supplier
router.delete('/:id', (req, res) => {
  try {
    const supplierId = req.params.id;
    const orderCount = db.prepare(`SELECT COUNT(*) AS count FROM PROCURES WHERE supplier_id = ?`).get(supplierId);
    if (orderCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete supplier: ${orderCount.count} procurement records exist for this supplier. Foreign key constraint active.`
      });
    }

    db.prepare(`DELETE FROM SUPPLIER WHERE supplier_id = ?`).run(supplierId);
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Supplier phone operations
router.post('/:id/phones', (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    db.prepare(`INSERT INTO SUPPLIER_PHONE (supplier_id, phone_number) VALUES (?, ?)`).run(req.params.id, phone_number.trim());
    res.status(201).json({ success: true, message: 'Phone number added' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id/phones/:phone', (req, res) => {
  try {
    db.prepare(`DELETE FROM SUPPLIER_PHONE WHERE supplier_id = ? AND phone_number = ?`).run(req.params.id, req.params.phone);
    res.json({ success: true, message: 'Phone number deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
