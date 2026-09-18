# 🏢 HostelHub — Enterprise Hostel Management System

[![Frontend Deployment](https://img.shields.io/badge/Frontend-Vercel-black?style=flat&logo=vercel)](https://hostel-management-system-database-system-ao5stctla-nkp5.vercel.app/)
[![Database](https://img.shields.io/badge/Database-SQLite%203%20(18%20Tables)-003B57?style=flat&logo=sqlite)](#-the-18-normalized-database-tables)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=flat&logo=node.js)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite Build](https://img.shields.io/badge/Bundler-Vite%206-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A high-performance, full-stack **University Hostel Administration & Campus Logistics System** engineered with **React 18**, **Vite**, **Node.js**, **Express**, and a strictly normalized **18-table SQLite relational database** powered by `better-sqlite3`.

The system provides campus administrators, resident wardens, and mess supervisors with an all-in-one platform for student room allocation, fee collection, staff payroll, dining hall inventory, vendor procurement, pre-compiled analytical reporting, and arbitrary SQL execution.

---

## 🌐 Public Deployment & Live Demo

| Service | Hosting Platform | URL | Status |
| :--- | :--- | :--- | :--- |
| **Hostel Management Application** | **Vercel** | [hostel-management-system-database-system-ao5stctla-nkp5.vercel.app](https://hostel-management-system-database-system-ao5stctla-nkp5.vercel.app/) | ![Live](https://img.shields.io/badge/Status-Live-success) |

---

## 🏛 System Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT TIER                                     │
│   React 18 Single-Page Application (Vite Bundler @ port 3000)                  │
│   • Cosmic Midnight SaaS Design System (Vanilla CSS Tokens)                   │
│   • Lucide Vector Iconography                                                  │
│   • Client-Side State Router (Zero Page-Reload Navigation)                     │
│   • Automatic API Base Resolver (Vercel Production / Local Proxy)              │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       │ JSON over HTTP / REST API (CORS Enabled)
┌──────────────────────────────────────▼─────────────────────────────────────────┐
│                                SERVER TIER                                     │
│   Node.js + Express REST API Server (@ port 5000)                              │
│   • Request Duration Logging & Normalized Error Handling                       │
│   • Multi-Statement Transaction Runner (`better-sqlite3`)                      │
│   • Dynamic Parametric Prepared Statement Engine                               │
│   • Foreign Key Constraint Enforcement (`PRAGMA foreign_keys = ON;`)           │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       │ Synchronous Zero-Latency C++ Driver
┌──────────────────────────────────────▼─────────────────────────────────────────┐
│                               DATABASE TIER                                    │
│   SQLite 3 Embedded Relational Engine (`database/hostel.db`)                   │
│   • 18 Normalized Relational Tables with Composite Keys & Foreign Cascades     │
│   • Zero Cloud DB Dependencies (Pure Local Autonomous Storage)                 │
│   • ACID Compliant Transactions                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Table of Contents

- [Core System Features & Capabilities](#-core-system-features--capabilities)
- [Detailed Functionalities Breakdown](#-detailed-functionalities-breakdown)
  - [1. Executive Operations Dashboard](#1-executive-operations-dashboard)
  - [2. Student Profile & Resident Management](#2-student-profile--resident-management)
  - [3. Hostel Building & Block Administration](#3-hostel-building--block-administration)
  - [4. Room Inventory & Capacity Planning](#4-room-inventory--capacity-planning)
  - [5. Room Classification Catalog](#5-room-classification-catalog)
  - [6. Warden Administration & Contact Directory](#6-warden-administration--contact-directory)
  - [7. Mess Facilities & Dining Hall Operations](#7-mess-facilities--dining-hall-operations)
  - [8. Meal Menus, Scheduling & Pricing](#8-meal-menus-scheduling--pricing)
  - [9. Staff Workforce & Payroll Directory](#9-staff-workforce--payroll-directory)
  - [10. Supplier Network & Vendor Registry](#10-supplier-network--vendor-registry)
  - [11. Consumable Inventory & Provision Tracking](#11-consumable-inventory--provision-tracking)
  - [12. Procurement Ledger & Purchase Batches](#12-procurement-ledger--purchase-batches)
  - [13. Student Billing & Payment Transactions](#13-student-billing--payment-transactions)
  - [14. 13 Multi-Table Relational Reports](#14-13-multi-table-relational-reports)
  - [15. Full-Spectrum SQL Studio](#15-full-spectrum-sql-studio)
  - [16. 18 Dedicated Database Table Views](#16-18-dedicated-database-table-views)
- [The 18 Normalized Database Tables](#-the-18-normalized-database-tables)
- [Relational Schema & Foreign Key Map](#-relational-schema--foreign-key-map)
- [Complete REST API Reference](#-complete-rest-api-reference)
- [Local Installation & Setup Guide](#-local-installation--setup-guide)
- [Design System & Engineering Standards](#-design-system--engineering-standards)
- [License](#-license)

---

## 🌟 Core System Features & Capabilities

- **Zero-Dependency SQLite Relational Engine**: Runs directly off `database/hostel.db` without requiring Oracle, PostgreSQL, or MySQL daemons.
- **18 Normalized Relational Tables**: Full 3NF normalization representing every facet of university housing, dining, procurement, and billing.
- **Strict Foreign Key Cascades**: Foreign keys are programmatically enforced at database startup via `PRAGMA foreign_keys = ON;`.
- **Full Spectrum SQL Studio**: Directly run arbitrary `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, `DROP`, Subqueries, CTEs (`WITH`), and multi-statement batch scripts inside atomic transactions.
- **13 Multi-Table Relational Reports**: Pre-compiled analytical join queries computing resident assignments, occupancy percentages, financial summaries, and inventory stock health with millisecond profiling and 1-click CSV export.
- **18 Dedicated Table Explorer Views**: Dedicated UI screens for each table displaying 100% of columns and rows with visual badges for `(PK)`, `(FK)`, composite keys, and live search.
- **Dynamic Graphical CRUD**: Modal-driven record creation, inline editing, and deletion with integrity confirmation warnings.
- **Cosmic Midnight SaaS UI**: Tailored dark-mode interface with deep blue radial illumination, responsive layout, zero AI-hallucinated styling, and zero generic external CSS frameworks.

---

## 🚀 Detailed Functionalities Breakdown

### 1. Executive Operations Dashboard
The main operational command center providing real-time campus metrics synthesized directly from live database tables:
- **7 Live KPI Stat Cards**:
  - **Total Students**: Active resident hostellers registered in the system.
  - **Hostel Buildings**: Operational campus residence blocks (North & South campuses).
  - **Total Rooms**: Real-time room count with live occupancy calculation and percentage.
  - **Staff Members**: Active hostel and kitchen personnel.
  - **Suppliers**: Active procurement vendor contracts.
  - **Inventory Items**: Tracked consumable food and maintenance provisions.
  - **Total Fee Collection**: Aggregate revenue collected with transaction counts.
- **Recent Fee Transactions Table**: Formatted financial ledger displaying transaction IDs, student names, room/hostel blocks, amounts, payment modes, and payment status badges.
- **Database Tables Explorer Grid**: Visual navigation cards grouping all 18 tables into 6 domain clusters with live table counts.
- **Live System Health Monitor**: Sticky navigation indicator confirming database connection, table counts, and driver status.

---

### 2. Student Profile & Resident Management
Comprehensive student lifecycle and housing records:
- **Demographics & Profile**: Student ID, First Name, Last Name, Gender, Date of Birth, Institutional Email, Blood Group, Allergy/Dietary notes.
- **Housing & Dining Allocation**: Direct relational foreign keys assigning each student to their specific `RoomNo`, `HostelID`, and `MessID`.
- **Mentorship Hierarchy**: Self-referencing foreign key (`MentorStudentID`) connecting junior students to senior peer mentors.
- **Multi-Valued Phone Numbers**: Child entity table `STUDENT_PHONE` maintaining multiple contact numbers per student with cascade deletion.
- **Interactive Operations**: Search by student name/ID/email, modal-based record insertion, demographic editing, and CSV export.

---

### 3. Hostel Building & Block Administration
Facility oversight for campus residential housing:
- **Block Registry**: Hostel ID, Hostel Name (Cauvery, Ganga, Yamuna, Krishna, Narmada), and Total Floor count.
- **Administrative Assignment**: Foreign key link to presiding `WardenID`.
- **Aggregated Analytics**: Computed total resident count, floor breakdowns, and room distributions.

---

### 4. Room Inventory & Capacity Planning
Detailed physical accommodation tracking:
- **Room Specifications**: Room Number, Floor Number, Room Type label, Bed Capacity, Monthly Room Rent, and Hostel building mapping.
- **Real-Time Occupancy Calculation**: Dynamic computation of occupied vs. available beds with occupancy rate indicators.
- **Pricing Management**: Manage differential rents across standard, double, and AC blocks.

---

### 5. Room Classification Catalog
Lookup catalog categorizing accommodation tiers:
- **Type Specifications**: Type ID (`RT1`, `RT2`, `RT3`), Type Name (Single, Double, Triple), AC Specification (`AC` vs. `Non-AC`), and Default Bed Capacity.
- **Relational Integrity**: Prevents room type deletion if active rooms reference the category.

---

### 6. Warden Administration & Contact Directory
Residential leadership governance:
- **Warden Profile**: Warden ID, Full Name, Official Email Address, and University Joining Date.
- **Building Oversight**: Linked directly as the administrative head of corresponding hostel blocks.
- **Multi-Line Emergency Phones**: Supported by `WARDEN_PHONE` for multiple emergency telephone numbers per warden.

---

### 7. Mess Facilities & Dining Hall Operations
Campus food service operations:
- **Facility Registry**: Mess ID (`M1` to `M5`), Dining Hall Name, Mess Type (`Pure Veg`, `Non-Veg Special`, `Mixed`, `Continental`, `Quick Bites`), and Campus Location.
- **Contact Directory**: Multi-line contact numbers stored in `MESS_CONTACT` for student inquiries.
- **Student Boarding Links**: Students are assigned to mess halls based on dietary plan choices.

---

### 8. Meal Menus, Scheduling & Pricing
Dining menu catalog and nutritional management:
- **Meal Catalog**: Meal ID, Meal Name (North Indian Thali, South Indian Meals, Biryani, Breakfast sets), Detailed Menu Description, and Per-Meal Cost.
- **Facility Association**: Foreign key mapping each meal offering to its providing dining hall (`MessID`).

---

### 9. Staff Workforce & Payroll Directory
Campus support personnel administration:
- **Staff Records**: Staff ID, Full Name, University Join Date, Monthly Salary (INR), Staff Role (`Head Chef`, `Assistant Cook`, `Store Keeper`, `Cleaner`, `Security`), and assigned `MessID`.
- **Contact Directory**: Child entity table `STAFF_PHONE` supporting multiple contact numbers per employee.
- **Payroll Tracking**: Aggregated salary expenditure per dining hall and department.

---

### 10. Supplier Network & Vendor Registry
Supply chain vendor management:
- **Vendor Directory**: Supplier ID (`SUP1` to `SUP5`), Enterprise Vendor Name (Farm Provisions, Dairy Products, Poultry & Meats, Grain Traders, Vegetables).
- **Vendor Contacts**: Child entity table `SUPPLIER_PHONE` storing multi-line sales and dispatch contact numbers.

---

### 11. Consumable Inventory & Provision Tracking
Hostel and mess provision stock tracking:
- **Stock Catalog**: Item ID (`IT101` to `IT105`), Item Name (Basmati Rice, Toned Milk, Cooking Oil, Broiler Chicken, Potato), Stock Category (`Grains`, `Dairy`, `Meat`, `Vegetables`), and Unit of Measurement (`Kg`, `Litre`).
- **Procurement Links**: Directly referenced by procurement purchase orders.

---

### 12. Procurement Ledger & Purchase Batches
Triple-foreign-key relational procurement ledger:
- **Procurement Entity (`PROCURES`)**: Composite primary key `(MessID, SupplierID, ItemID)`.
- **Purchase Tracking**: Tracks exact quantities of raw supplies procured by specific mess facilities from verified vendors.
- **Audit Trail**: Full traceability from invoice item down to the dining hall kitchen.

---

### 13. Student Billing & Payment Transactions
Two-tiered financial accounting system:
- **Header Ledger (`PAYMENT`)**: Payment ID, Student ID, Total Amount, Payment Mode (`NetBanking`, `UPI`, `Credit Card`, `Debit Card`), Status (`Successful`, `Pending`), and explicit split date columns (`PaymentDay`, `PaymentMonth`, `PaymentYear`).
- **Line-Item Breakdown (`PAYMENT_DETAIL`)**: Child records linking `PaymentID` to monthly charges, broken down into `MessCharges` and `OtherCharges` / Arrears.

---

### 14. 13 Multi-Table Relational Reports
Pre-compiled analytical queries utilizing relational joins, grouping, and aggregations:

| # | Report Title | Core Tables Joined | Analytical Purpose |
|---|---|---|---|
| **1** | **Student + Room + Hostel Report** | `STUDENT`, `ROOM`, `HOSTEL` | Complete resident roster mapping students to room numbers, floor levels, and hostel blocks. |
| **2** | **Student + Student Phone Report** | `STUDENT`, `STUDENT_PHONE` | Emergency phone directory mapping multiple phone numbers per enrolled student. |
| **3** | **Hostel + Warden Report** | `HOSTEL`, `WARDEN`, `WARDEN_PHONE` | Administrative hierarchy showing block wardens, emails, and emergency contacts. |
| **4** | **Room + Hostel Report** | `ROOM`, `HOSTEL` | Full room inventory with room categories, bed capacities, and monthly rents per block. |
| **5** | **Mess + Meal Report** | `MESS`, `MEAL` | Dining hall menu catalog displaying meal descriptions, meal costs, and mess halls. |
| **6** | **Mess + Staff Report** | `MESS`, `STAFF`, `STAFF_PHONE` | Kitchen workforce roster detailing job roles, salaries, and phone numbers per mess hall. |
| **7** | **Supplier + Inventory Report** | `SUPPLIER`, `PROCURES`, `INVENTORY_ITEM` | Vendor sourcing matrix displaying which suppliers provide which raw inventory items. |
| **8** | **Procurement Ledger Report** | `MESS`, `SUPPLIER`, `INVENTORY_ITEM`, `PROCURES` | 4-table procurement audit trail showing procured quantities per mess, vendor, and item. |
| **9** | **Student + Payment Report** | `PAYMENT`, `STUDENT`, `HOSTEL` | Transaction history joining fee payments with student identities and hostel buildings. |
| **10** | **Overall Hostel Occupancy Report** | `HOSTEL`, `ROOM`, `STUDENT` | Grouped aggregation computing total rooms, total bed capacity, and assigned residents. |
| **11** | **Available Rooms Report** | `ROOM`, `HOSTEL`, `STUDENT` | Room-by-room occupancy counter highlighting vacant and ready-to-occupy rooms. |
| **12** | **Student Payment Summary Report** | `STUDENT`, `HOSTEL`, `PAYMENT` | Financial rollup computing transaction counts and total revenue collected per student. |
| **13** | **Inventory Procurement Summary** | `INVENTORY_ITEM`, `PROCURES` | Stock health report computing total orders and cumulative procured quantities per item. |

*Every report includes execution time profiling in milliseconds and 1-click **Export to CSV**.*

---

### 15. Full-Spectrum SQL Studio
A built-in developer console capable of running any SQL operation directly from the browser:
- **DQL (Data Query Language)**: `SELECT`, column projection, column aliases, expressions, `WHERE`, `LIKE`, `IN`, `BETWEEN`, `ORDER BY`, `LIMIT`, `OFFSET`.
- **Subqueries & CTEs**: Nested subqueries (`SELECT ... WHERE Amount > (SELECT AVG(Amount)...)`) and Common Table Expressions (`WITH HighRentRooms AS (...) SELECT ...`).
- **Multi-Table Joins & Aggregations**: 3-Table and 4-Table `INNER JOIN`, `LEFT JOIN`, `GROUP BY`, `HAVING`, `COUNT()`, `SUM()`, `AVG()`, `ROUND()`.
- **DML (Data Manipulation Language)**: `INSERT INTO`, `UPDATE ... SET`, `DELETE FROM`, `REPLACE` with affected row counts (`changes`) and last inserted row IDs.
- **DDL (Data Definition Language)**: `CREATE TABLE`, `ALTER TABLE`, `CREATE VIEW`, `CREATE INDEX`, `DROP TABLE`.
- **Multi-Statement Batch Transactions**: Sequential SQL statements executed inside atomic `db.transaction(...)` with automatic rollback on error.
- **16 Pre-Built Tested Templates**: Categorized under tabs: `All`, `DQL (Queries)`, `DML (Modify)`, `DDL (Schema)`, `Joins & Aggregates`, and `Multi-Statement`.
- **18 Tables Explorer Sidebar**: Live list of all 18 tables with column counts and 1-click query population.
- **Execution Profiling & CSV Export**: Sub-millisecond timing badge and CSV download for any result set.

---

### 16. 18 Dedicated Database Table Views
Direct graphical interface for every individual table in `database/hostel.db`:
- **100% Attribute Coverage**: Renders every single column and row (zero hidden fields).
- **Key Badge Annotations**: Clear indicators for `(PK)` Primary Keys, `(FK)` Foreign Keys, and `(PK, FK)` composite keys.
- **Relational Hints**: Visual pointers indicating referenced tables (e.g. `→ HOSTEL`, `→ WARDEN`).
- **Horizontal Scrolling**: Wide tables smoothly scroll horizontally without card substitutions.
- **Dynamic CRUD Modals**:
  - **Insert Record**: Modal form with automatic numeric/string type coercion.
  - **Edit Record**: Modal form with disabled/immutable primary keys to maintain referential integrity.
  - **Delete Record**: Confirmation dialog warning of foreign key cascade implications.
- **Search & CSV Download**: Instant client-side search across all attributes and 1-click CSV export.

---

## 🗄 The 18 Normalized Database Tables

| # | Table Name | Columns | Rows | Primary Key | Foreign Key Constraints | Functional Description |
|---|---|---|---|---|---|---|
| **1** | `WARDEN` | 4 | 5 | `WardenID` | *None* | Residential block wardens and administrative emails. |
| **2** | `WARDEN_PHONE` | 2 | 5 | `(WardenID, PhoneNo)` | `WardenID → WARDEN` | Multi-contact phone numbers per warden (Composite PK). |
| **3** | `HOSTEL` | 4 | 5 | `HostelID` | `WardenID → WARDEN` | Residence buildings, floor counts, and assigned warden. |
| **4** | `ROOM_TYPE` | 4 | 3 | `TypeID` | *None* | Room classifications (Single/Double/Triple, AC/Non-AC). |
| **5** | `ROOM` | 6 | 5 | `RoomNo` | `HostelID → HOSTEL` | Physical rooms, floor numbers, capacities, and monthly rents. |
| **6** | `STUDENT` | 13 | 5 | `StudentID` | `RoomNo → ROOM`<br>`HostelID → HOSTEL`<br>`MessID → MESS`<br>`MentorStudentID → STUDENT` | Student master profile with room, hostel, mess, and mentor links. |
| **7** | `STUDENT_PHONE` | 2 | 6 | `(StudentID, PhoneNo)` | `StudentID → STUDENT` | Multi-contact phone numbers per student (Composite PK). |
| **8** | `MESS` | 4 | 5 | `MessID` | *None* | Dining halls, culinary categories, and campus locations. |
| **9** | `MESS_CONTACT` | 2 | 5 | `(MessID, ContactNo)` | `MessID → MESS` | Multi-line telephone contacts for dining facilities. |
| **10** | `MEAL` | 5 | 5 | `MealID` | `MessID → MESS` | Meal menus, course descriptions, and individual prices. |
| **11** | `STAFF` | 6 | 5 | `StaffID` | `MessID → MESS` | Support personnel, roles (Chefs, Cleaners), and salaries. |
| **12** | `STAFF_PHONE` | 2 | 5 | `(StaffID, PhoneNo)` | `StaffID → STAFF` | Multi-line contact numbers for staff employees. |
| **13** | `SUPPLIER` | 2 | 5 | `SupplierID` | *None* | Registered vendors and procurement contractors. |
| **14** | `SUPPLIER_PHONE` | 2 | 5 | `(SupplierID, PhoneNo)` | `SupplierID → SUPPLIER` | Multi-line contact numbers for vendors. |
| **15** | `INVENTORY_ITEM` | 4 | 5 | `ItemID` | *None* | Consumable provision inventory catalog and measurement units. |
| **16** | `PROCURES` | 4 | 5 | `(MessID, SupplierID, ItemID)` | `MessID → MESS`<br>`SupplierID → SUPPLIER`<br>`ItemID → INVENTORY_ITEM` | Relational procurement ledger recording purchase orders. |
| **17** | `PAYMENT` | 8 | 5 | `PaymentID` | `StudentID → STUDENT` | Transaction header ledger, payment modes, amounts, and dates. |
| **18** | `PAYMENT_DETAIL` | 6 | 5 | `(PaymentID, DetailID)` | `PaymentID → PAYMENT` | Itemized financial breakdown (Mess charges vs. Room rent). |

---

## 🔗 Relational Schema & Foreign Key Map

```text
WARDEN ───< WARDEN_PHONE
  │
  ├───< HOSTEL ───< ROOM ───< STUDENT ───< STUDENT_PHONE
  │                          │    │   └──< STUDENT (Mentor self-ref)
  │                          │    │
  │                          │    └──< PAYMENT ───< PAYMENT_DETAIL
  │                          │
  │                          └───< ROOM_TYPE (via Type label)
  │
MESS ───< MESS_CONTACT
  │
  ├───< MEAL
  ├───< STAFF ───< STAFF_PHONE
  │
  └───< PROCURES >─── SUPPLIER ───< SUPPLIER_PHONE
           │
           └──> INVENTORY_ITEM
```

---

## 📡 Complete REST API Reference

All endpoints return uniform JSON envelopes: `{ success: true, ... }` or `{ success: false, message: "..." }`.

### System & Overview
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check, SQLite driver status, and table verification. |
| `GET` | `/api/dashboard/stats` | High-level KPI aggregations, occupancy metrics, and recent payments. |

### Reports & SQL Execution
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reports` | List all 13 pre-compiled multi-table analytical reports. |
| `GET` | `/api/reports/:reportKey` | Execute a specific report query with millisecond performance profiling. |
| `POST` | `/api/query` | Run arbitrary SQL (DQL, DML, DDL, CTEs, or atomic batch transactions). |
| `GET` | `/api/query/schema` | Metadata schema map (columns, types, primary keys) for all 18 tables. |

### 18-Table Dynamic Relational CRUD
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tables/:tableName` | Get all rows, columns, PK/FK metadata with optional `?search=` filter. |
| `POST` | `/api/tables/:tableName` | Insert a new record into any table with automatic data type casting. |
| `PUT` | `/api/tables/:tableName` | Update an existing record matching primary key criteria. |
| `DELETE` | `/api/tables/:tableName` | Delete a record by primary key criteria with foreign key cascade checks. |

### Domain Entity Endpoints
| Entity | List / Create | Single / Update / Delete |
|---|---|---|
| **Students** | `GET /api/students`, `POST /api/students` | `GET /api/students/:id`, `PUT /api/students/:id`, `DELETE /api/students/:id` |
| **Hostels** | `GET /api/hostels`, `POST /api/hostels` | `GET /api/hostels/:id`, `PUT /api/hostels/:id`, `DELETE /api/hostels/:id` |
| **Rooms** | `GET /api/rooms`, `POST /api/rooms` | `GET /api/rooms/:id`, `PUT /api/rooms/:id`, `DELETE /api/rooms/:id` |
| **Room Types** | `GET /api/room-types`, `POST /api/room-types` | `GET /api/room-types/:id`, `PUT /api/room-types/:id`, `DELETE /api/room-types/:id` |
| **Wardens** | `GET /api/wardens`, `POST /api/wardens` | `GET /api/wardens/:id`, `PUT /api/wardens/:id`, `DELETE /api/wardens/:id` |
| **Mess Halls** | `GET /api/mess`, `POST /api/mess` | `GET /api/mess/:id`, `PUT /api/mess/:id`, `DELETE /api/mess/:id` |
| **Meals** | `GET /api/meals`, `POST /api/meals` | `GET /api/meals/:id`, `PUT /api/meals/:id`, `DELETE /api/meals/:id` |
| **Staff** | `GET /api/staff`, `POST /api/staff` | `GET /api/staff/:id`, `PUT /api/staff/:id`, `DELETE /api/staff/:id` |
| **Suppliers** | `GET /api/suppliers`, `POST /api/suppliers` | `GET /api/suppliers/:id`, `PUT /api/suppliers/:id`, `DELETE /api/suppliers/:id` |
| **Inventory** | `GET /api/inventory`, `POST /api/inventory` | `GET /api/inventory/:id`, `PUT /api/inventory/:id`, `DELETE /api/inventory/:id` |
| **Procurements** | `GET /api/procurements`, `POST /api/procurements` | `GET /api/procurements/:id`, `PUT /api/procurements/:id`, `DELETE /api/procurements/:id` |
| **Payments** | `GET /api/payments`, `POST /api/payments` | `GET /api/payments/:id`, `PUT /api/payments/:id`, `DELETE /api/payments/:id` |

---

## 💻 Local Installation & Setup Guide

### Prerequisites
- **Node.js**: Version 18.0.0 or higher (tested on Node v20 and v24)
- **npm**: Version 9.0.0 or higher
- **Git**: Installed and configured

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/nishanth418/hostelmanagementsystem.git
cd hostelmanagementsystem
```

---

### Step 2: Backend Setup & Database Initialization
```bash
# Navigate to backend directory
cd backend

# Install dependencies (express, better-sqlite3, cors, dotenv)
npm install

# Verify database tables (hostel.db is pre-seeded with all 18 tables)
npm run verify-db

# Start backend server on port 5000
npm start
```
*The backend server will launch at `http://localhost:5000` with the health endpoint live at `http://localhost:5000/api/health`.*

---

### Step 3: Frontend Setup & Launch
Open a second terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (react, vite, lucide-react)
npm install

# Start Vite development server
npm run dev
```
*Open your browser and navigate to **`http://localhost:3000`**.*

---

### Step 4: Building for Production
```bash
cd frontend
npm run build
```
*Vite compiles the production bundle to `frontend/dist/` in under 2 seconds with zero errors.*

---

## 🎨 Design System & Engineering Standards

- **Color Architecture**:
  - **Midnight Canvas**: `#060b17` with dual-source radial blooms:
    - Electric Royal Blue: `rgba(29, 78, 216, 0.44)` at 84% 58%
    - Deep Violet-Indigo: `rgba(67, 56, 202, 0.32)` at 16% 50%
    - Cyan Overhead Haze: `rgba(14, 116, 144, 0.14)` at 50% 10%
  - **Surface Panels**: Structured `#0d1527` with `#172440` borders and `#121d36` hover elevation.
  - **Data Tables**: Enterprise headers at `#0f1a34` with alternating `#091022` row striping.
- **Typography & Clean UI**:
  - System font stack (Inter / Segoe UI / SF Pro) paired with `Fira Code` / monospace for keys, dates, and amounts.
  - Zero glowing box-shadows or unreadable gradients.
  - Zero emojis — 100% crisp vector SVG icons via `lucide-react`.
- **Accessibility & Responsive Layout**:
  - Modal focus traps with ESC key dismissal.
  - Full mobile drawer sidebar with toggle controls.
  - Sticky table headers and sticky action columns for wide relational data tables.

---

## 📁 Repository Structure

```text
HOSTEL-MANAGEMENT-SYSTEM---DATABASE-SYSTEM/
├── database/
│   ├── schema.sql              # 18-Table DDL definitions & foreign key constraints
│   ├── seed.sql                # Authentic sample records for all 18 tables
│   └── hostel.db               # SQLite 3 Database file (ACID transactional storage)
│
├── backend/
│   ├── database.js             # Database connector, auto-initializer & table verifier
│   ├── server.js               # Express application entrypoint & middleware
│   ├── package.json            # Backend dependencies (express, better-sqlite3, cors)
│   └── routes/
│       ├── dashboard.js        # KPI aggregations & statistics
│       ├── students.js         # Student CRUD & phone associations
│       ├── hostels.js          # Hostel building CRUD
│       ├── rooms.js            # Room inventory CRUD
│       ├── roomTypes.js        # Room classification CRUD
│       ├── wardens.js          # Warden administration CRUD
│       ├── mess.js             # Mess dining facility CRUD
│       ├── meals.js            # Meal menu & pricing CRUD
│       ├── staff.js            # Workforce & payroll CRUD
│       ├── suppliers.js        # Vendor registry CRUD
│       ├── inventory.js        # Inventory catalog CRUD
│       ├── procurements.js     # Purchase batch order CRUD
│       ├── payments.js         # Payment billing CRUD
│       ├── reports.js          # 13 Multi-Table SQL join reports
│       ├── tables.js           # Dynamic 18-table relational CRUD engine
│       └── query.js            # Universal SQL execution engine (DQL/DML/DDL/Batch)
│
├── frontend/
│   ├── index.html              # HTML5 application shell & SVG favicon
│   ├── package.json            # Frontend dependencies (react, vite, lucide-react)
│   ├── vite.config.js          # Vite config & development API proxy
│   ├── vercel.json             # Vercel SPA routing rewrite rules
│   ├── .env.production         # Inlines Render backend URL for Vercel builds
│   └── src/
│       ├── index.css           # Modern Cosmic Midnight design system
│       ├── main.jsx            # React root mount
│       ├── App.jsx             # Application state router & toast container
│       ├── services/
│       │   └── api.js          # Unified API service with dynamic base URL resolver
│       ├── components/
│       │   ├── Navbar.jsx      # Sticky top navigation bar & live health badge
│       │   ├── Sidebar.jsx     # Navigation sidebar with 18-table grouped explorer
│       │   ├── StatCard.jsx    # Metric KPI presentation cards
│       │   ├── Modal.jsx       # Accessible modal dialog container
│       │   ├── ConfirmDialog.jsx # Foreign key deletion confirmation dialog
│       │   ├── Toast.jsx       # Toast notification alert manager
│       │   └── Footer.jsx      # Institutional footer with governance links
│       └── pages/
│           ├── DashboardPage.jsx     # Executive operational metrics & table groups
│           ├── DatabaseTableView.jsx # Dynamic viewer & CRUD for all 18 tables
│           ├── ReportsPage.jsx       # 13 Pre-compiled analytical join reports
│           ├── SqlQueryPage.jsx      # Developer SQL Studio with 16 templates
│           ├── StudentsPage.jsx      # Student directory & resident management
│           ├── HostelsPage.jsx       # Hostel residence blocks
│           ├── RoomsPage.jsx         # Room inventory & vacancy
│           ├── RoomTypesPage.jsx     # Room classifications
│           ├── WardensPage.jsx       # Warden administrative records
│           ├── MessPage.jsx          # Dining facilities & contacts
│           ├── MealsPage.jsx         # Meal menus & pricing
│           ├── StaffPage.jsx         # Staff workforce & salaries
│           ├── SuppliersPage.jsx     # Vendor network
│           ├── InventoryPage.jsx     # Consumable provisions
│           ├── ProcurementPage.jsx   # Purchase orders
│           ├── PaymentsPage.jsx      # Payment billing & fees
│           ├── PrivacyPolicyPage.jsx # Data governance policy
│           └── TermsPage.jsx         # Residential terms of service
│
├── .env.example                # Sample environment configuration
├── .gitignore                  # Git exclusions (node_modules, logs, dist)
└── README.md                   # Complete system documentation
```

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute for educational and commercial applications.
