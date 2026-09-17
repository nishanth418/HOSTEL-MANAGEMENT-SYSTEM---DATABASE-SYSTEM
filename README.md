# HostelHub — Enterprise Hostel Management System

A high-performance, modern, full-stack Hostel Management System built with **React**, **Vite**, **Node.js**, **Express**, and a strictly relational **18-table SQLite database** (`better-sqlite3`).

---

## 🏛 Architecture Overview

```text
React Frontend (Vite @ port 3000)
       ↓
REST API (JSON over HTTP)
       ↓
Node.js + Express Backend (@ port 5000)
       ↓
SQLite 3 (better-sqlite3)
       ↓
database/hostel.db (18 Relational Tables)
```

- **Frontend**: Single-Page Application (SPA) with React 18, Vite, Lucide Icons, and a custom dark-glassmorphism CSS design system.
- **Backend**: Express REST API featuring prepared SQL statements, transactional integrity, foreign-key constraint enforcement, and error normalization.
- **Database**: Pure local SQLite (`database/hostel.db`) requiring **zero cloud services, zero Oracle, and zero external DB daemons**.

---

## 🗄 The 18 Database Tables

The database implements an enterprise normalized relational schema with foreign key cascades and checks:

| # | Table Name | Column Count | Row Count | Primary Key | Foreign Keys |
|---|------------|--------------|-----------|-------------|--------------|
| 1 | `WARDEN` | 4 | 5 | `WardenID` | None |
| 2 | `WARDEN_PHONE` | 2 | 5 | `WardenID, PhoneNo` | `WardenID -> WARDEN(WardenID)` |
| 3 | `HOSTEL` | 4 | 5 | `HostelID` | `WardenID -> WARDEN(WardenID)` |
| 4 | `ROOM_TYPE` | 4 | 3 | `TypeID` | None |
| 5 | `ROOM` | 6 | 5 | `RoomNo` | `HostelID -> HOSTEL(HostelID)` |
| 6 | `STUDENT` | 13 | 5 | `StudentID` | `MentorStudentID -> STUDENT(StudentID), MessID -> MESS(MessID), HostelID -> HOSTEL(HostelID), RoomNo -> ROOM(RoomNo)` |
| 7 | `STUDENT_PHONE` | 2 | 6 | `StudentID, PhoneNo` | `StudentID -> STUDENT(StudentID)` |
| 8 | `MESS` | 4 | 5 | `MessID` | None |
| 9 | `MESS_CONTACT` | 2 | 5 | `MessID, ContactNo` | `MessID -> MESS(MessID)` |
| 10 | `MEAL` | 5 | 5 | `MealID` | `MessID -> MESS(MessID)` |
| 11 | `STAFF` | 6 | 5 | `StaffID` | `MessID -> MESS(MessID)` |
| 12 | `STAFF_PHONE` | 2 | 5 | `StaffID, PhoneNo` | `StaffID -> STAFF(StaffID)` |
| 13 | `SUPPLIER` | 2 | 5 | `SupplierID` | None |
| 14 | `SUPPLIER_PHONE` | 2 | 5 | `SupplierID, PhoneNo` | `SupplierID -> SUPPLIER(SupplierID)` |
| 15 | `INVENTORY_ITEM` | 4 | 5 | `ItemID` | None |
| 16 | `PROCURES` | 4 | 5 | `MessID, SupplierID, ItemID` | `ItemID -> INVENTORY_ITEM(ItemID), SupplierID -> SUPPLIER(SupplierID), MessID -> MESS(MessID)` |
| 17 | `PAYMENT` | 8 | 5 | `PaymentID` | `StudentID -> STUDENT(StudentID)` |
| 18 | `PAYMENT_DETAIL` | 6 | 5 | `PaymentID, DetailID` | `PaymentID -> PAYMENT(PaymentID)` |

### Dedicated Database Table Views in the UI

Under the **"DATABASE TABLES"** sidebar section, users can directly select each of the 18 exact uppercase tables (`WARDEN`, `WARDEN_PHONE`, ..., `PAYMENT_DETAIL`).
Each view features:
- **Full Relational Table**: Displays 100% of the columns and actual records from SQLite (zero omitted attributes).
- **Key Badges**: Primary keys are clearly marked as `(PK)`, foreign keys as `(FK)`, and composite keys as `(PK, FK)`.
- **NULL Indicators**: `NULL` values are visually rendered with distinct styling.
- **Horizontal Scrolling**: Wide tables smoothly scroll horizontally without card substitutions.
- **Dynamic CRUD**: Insert, Edit, and Delete rows with direct foreign-key constraint validation.
- **Search & CSV Export**: Real-time attribute searching and CSV export for any of the 18 tables.

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18 or higher (tested on Node v24)
- **npm**: v9 or higher

### 1. Installation

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### 2. Database Initialization

The database auto-initializes upon first backend launch. You can also manually trigger initialization or verification at any time:

```bash
cd backend
# Initialize schema and seed data
npm run init-db

# Verify that exactly 18 tables exist
npm run verify-db
```

### 3. Running the Application

In terminal 1 (start backend server on port 5000):
```bash
cd backend
npm start
```

In terminal 2 (start Vite frontend on port 3000):
```bash
cd frontend
npm run dev
```

Open your browser to: **`http://localhost:3000`**

---

## 🛡 SQL Query Security Sandbox

The application includes an **Interactive SQL Studio** allowing administrators to run custom analytical queries with multi-layer defensive validation:

1. **Permitted Queries**:
   - `SELECT ...`
   - Read-only Common Table Expressions: `WITH ... SELECT ...`
2. **Blocked Operations (HTTP 403)**:
   - Data mutations: `INSERT`, `UPDATE`, `DELETE`, `REPLACE`
   - Schema alterations: `DROP`, `ALTER`, `CREATE`, `TRUNCATE`
   - Administrative commands: `ATTACH`, `DETACH`, `PRAGMA`, `VACUUM`
   - Transaction manipulations: `BEGIN`, `COMMIT`, `ROLLBACK`
   - Multi-statement execution: Semicolons dividing multiple statements
   - Comment bypass attempts: `--` or `/* ... */`
3. **Execution Guard**: Powered by `better-sqlite3` statement inspector (`stmt.reader === true`).

---

## 📊 The 13 Multi-Table Relational Reports

The system includes pre-compiled, optimized analytical reports utilizing SQL `JOIN` operations:

1. **Student + Room + Hostel Report**: Full resident mapping across blocks and floors.
2. **Student + Student Phone Report**: Phone directory of hostellers and guardians.
3. **Hostel + Warden Report**: Buildings, warden administrative contacts, and salaries.
4. **Room + Room Type + Hostel Report**: Detailed room configuration and pricing inventory.
5. **Mess + Meal Report**: Weekly meal timetable across dining halls.
6. **Mess + Staff Report**: Kitchen personnel and supervisors per mess facility.
7. **Supplier + Inventory Report**: Vendor-supplied item matrices.
8. **Procurement + Supplier + Inventory Report**: Procurement ledger linking batches, vendors, and items.
9. **Student + Payment Report**: Payment history with student details.
10. **Overall Hostel Occupancy Report**: Occupancy percentages and bed capacities.
11. **Available Rooms Report**: Real-time list of ready-to-occupy rooms.
12. **Student Payment Summary Report**: Aggregated fee collection and pending dues.
13. **Inventory & Procurement Summary Report**: Stock health, re-order alerts, and expenditure.

---

## 📡 REST API Summary

- `GET /api/health` — Health status, DB connection, and table count verification.
- `GET /api/dashboard/stats` — High-level KPI counts, occupancy rates, and alerts.
- `GET /api/reports/:reportKey` — Executes any of the 13 multi-table reports with execution timing.
- `POST /api/query` — Read-only SQL query runner with strict security checks.
- Complete CRUD endpoints for `students`, `hostels`, `rooms`, `room-types`, `wardens`, `mess`, `meals`, `staff`, `suppliers`, `inventory`, `procurements`, `payments`.

---

## 📁 Repository File Structure

```text
hostel-management/
├── database/
│   ├── schema.sql              # 18 Table CREATE statements & constraints
│   ├── seed.sql                # Realistic sample records
│   └── hostel.db               # SQLite 3 Database file
│
├── backend/
│   ├── database.js             # Database connection, init, and table verifier
│   ├── server.js               # Express application entrypoint
│   ├── package.json            # Backend dependencies
│   ├── test-backend.js         # Automated test suite
│   └── routes/
│       ├── dashboard.js        # KPI aggregations
│       ├── students.js         # Student CRUD & phones
│       ├── hostels.js          # Hostel CRUD
│       ├── rooms.js            # Room CRUD
│       ├── roomTypes.js        # Room Type CRUD
│       ├── wardens.js          # Warden CRUD & phones
│       ├── mess.js             # Mess CRUD & contacts
│       ├── meals.js            # Meal schedules
│       ├── staff.js            # Staff CRUD & phones
│       ├── suppliers.js        # Supplier CRUD & phones
│       ├── inventory.js        # Inventory items
│       ├── procurements.js     # Purchase orders
│       ├── payments.js         # Payments & breakdown
│       ├── reports.js          # 13 SQL reports
│       └── query.js            # Secure read-only SQL studio
│
├── frontend/
│   ├── index.html              # HTML shell
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite config & backend proxy
│   └── src/
│       ├── index.css           # Modern design system
│       ├── main.jsx            # React root
│       ├── App.jsx             # Shell & navigation router
│       ├── services/api.js     # API client service
│       ├── components/         # Navbar, Sidebar, StatCard, Modal, Toast
│       └── pages/              # 15 Dashboard and Entity pages
│
├── .gitignore
├── .env.example
└── README.md
```
