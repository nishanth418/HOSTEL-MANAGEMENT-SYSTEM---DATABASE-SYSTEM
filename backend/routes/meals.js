const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET meals with optional filtering by mess, day, meal_type
router.get('/', (req, res) => {
  try {
    const { mess_id, day_of_week, meal_type } = req.query;
    let query = `
      SELECT 
        m.*,
        ms.mess_name,
        ms.type AS mess_type,
        h.name AS hostel_name
      FROM MEAL m
      JOIN MESS ms ON m.mess_id = ms.mess_id
      LEFT JOIN HOSTEL h ON ms.hostel_id = h.hostel_id
      WHERE 1=1
    `;
    const params = [];

    if (mess_id) {
      query += ` AND m.mess_id = ?`;
      params.push(mess_id);
    }
    if (day_of_week) {
      query += ` AND m.day_of_week = ?`;
      params.push(day_of_week);
    }
    if (meal_type) {
      query += ` AND m.meal_type = ?`;
      params.push(meal_type);
    }

    query += `
      ORDER BY 
        CASE m.day_of_week
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END,
        CASE m.meal_type
          WHEN 'Breakfast' THEN 1
          WHEN 'Lunch' THEN 2
          WHEN 'Snacks' THEN 3
          WHEN 'Dinner' THEN 4
        END
    `;

    const rows = db.prepare(query).all(...params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single meal
router.get('/:id', (req, res) => {
  try {
    const meal = db.prepare(`
      SELECT m.*, ms.mess_name
      FROM MEAL m
      JOIN MESS ms ON m.mess_id = ms.mess_id
      WHERE m.meal_id = ?
    `).get(req.params.id);

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    res.json({ success: true, data: meal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create meal
router.post('/', (req, res) => {
  try {
    const { mess_id, day_of_week, meal_type, menu_description, start_time, end_time } = req.body;
    if (!mess_id || !day_of_week || !meal_type || !menu_description || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'All meal fields are required' });
    }

    const result = db.prepare(`
      INSERT INTO MEAL (mess_id, day_of_week, meal_type, menu_description, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(Number(mess_id), day_of_week, meal_type, menu_description, start_time, end_time);

    res.status(201).json({ success: true, message: 'Meal scheduled successfully', mealId: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT update meal
router.put('/:id', (req, res) => {
  try {
    const mealId = req.params.id;
    const { mess_id, day_of_week, meal_type, menu_description, start_time, end_time } = req.body;

    const existing = db.prepare(`SELECT * FROM MEAL WHERE meal_id = ?`).get(mealId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    db.prepare(`
      UPDATE MEAL SET
        mess_id = ?, day_of_week = ?, meal_type = ?, menu_description = ?,
        start_time = ?, end_time = ?
      WHERE meal_id = ?
    `).run(
      mess_id ? Number(mess_id) : existing.mess_id,
      day_of_week || existing.day_of_week,
      meal_type || existing.meal_type,
      menu_description || existing.menu_description,
      start_time || existing.start_time,
      end_time || existing.end_time,
      mealId
    );

    res.json({ success: true, message: 'Meal updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE meal
router.delete('/:id', (req, res) => {
  try {
    db.prepare(`DELETE FROM MEAL WHERE meal_id = ?`).run(req.params.id);
    res.json({ success: true, message: 'Meal deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
