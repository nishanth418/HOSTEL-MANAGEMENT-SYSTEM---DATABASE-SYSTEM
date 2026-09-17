const express = require('express');
const router = express.Router();
const { db } = require('../database');

router.get('/stats', (req, res) => {
  try {
    // Core KPIs
    const totalStudents = db.prepare(`SELECT COUNT(*) AS count FROM STUDENT`).get().count;
    const totalHostels = db.prepare(`SELECT COUNT(*) AS count FROM HOSTEL`).get().count;
    const totalRooms = db.prepare(`SELECT COUNT(*) AS count FROM ROOM`).get().count;
    const totalStaff = db.prepare(`SELECT COUNT(*) AS count FROM STAFF`).get().count;
    const totalSuppliers = db.prepare(`SELECT COUNT(*) AS count FROM SUPPLIER`).get().count;
    const totalInventoryItems = db.prepare(`SELECT COUNT(*) AS count FROM INVENTORY_ITEM`).get().count;
    const totalPaymentsAmount = db.prepare(`SELECT COALESCE(SUM(Amount), 0) AS total FROM PAYMENT WHERE Status = 'Successful'`).get().total;
    const totalPaymentsCount = db.prepare(`SELECT COUNT(*) AS count FROM PAYMENT`).get().count;

    const occupiedRooms = totalStudents;
    const availableRooms = Math.max(0, totalRooms - occupiedRooms);
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Hostel occupancy breakdown
    const hostelOccupancy = db.prepare(`
      SELECT 
        h.HostelID,
        h.HostelName AS name,
        'Campus Block' AS type,
        COUNT(DISTINCT r.RoomNo) AS total_rooms,
        COUNT(DISTINCT s.StudentID) AS occupied_rooms,
        ROUND((CAST(COUNT(DISTINCT s.StudentID) AS REAL) / NULLIF(COUNT(DISTINCT r.RoomNo), 0)) * 100, 1) AS occupancy_rate
      FROM HOSTEL h
      LEFT JOIN ROOM r ON h.HostelID = r.HostelID
      LEFT JOIN STUDENT s ON h.HostelID = s.HostelID
      GROUP BY h.HostelID
      ORDER BY h.HostelID ASC
    `).all();

    // Low stock / inventory items
    const lowStockItems = db.prepare(`
      SELECT 
        i.ItemID AS item_id,
        i.ItemName AS item_name,
        i.Category AS category,
        COALESCE(p.Quantity, 0) AS quantity,
        100 AS min_required_quantity,
        i.Unit AS unit
      FROM INVENTORY_ITEM i
      LEFT JOIN PROCURES p ON i.ItemID = p.ItemID
      GROUP BY i.ItemID
      LIMIT 5
    `).all();

    // Recent payments
    const recentPayments = db.prepare(`
      SELECT 
        p.PaymentID AS payment_id,
        p.PaymentDay || '-' || p.PaymentMonth || '-' || p.PaymentYear AS payment_date,
        p.Amount AS total_amount,
        p.PaymentMode AS payment_method,
        p.Status AS payment_status,
        p.PaymentID AS transaction_id,
        s.FirstName || ' ' || s.LastName AS student_name,
        s.RoomNo AS room_number,
        h.HostelName AS hostel_name
      FROM PAYMENT p
      JOIN STUDENT s ON p.StudentID = s.StudentID
      LEFT JOIN HOSTEL h ON s.HostelID = h.HostelID
      ORDER BY p.PaymentID DESC
      LIMIT 5
    `).all();

    res.json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalHostels,
          totalRooms,
          availableRooms,
          occupiedRooms,
          totalStaff,
          totalSuppliers,
          totalInventoryItems,
          totalPaymentsAmount,
          totalPaymentsCount,
          occupancyRate
        },
        hostelOccupancy,
        lowStockItems,
        recentPayments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
