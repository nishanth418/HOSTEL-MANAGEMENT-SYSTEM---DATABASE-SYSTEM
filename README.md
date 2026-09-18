# 🏢 HostelHub — Enterprise Hostel Management System

[![Live Demo](https://img.shields.io/badge/Live%20Website-Vercel-black?style=for-the-badge&logo=vercel)](https://hostel-management-system-database-system-ao5stctla-nkp5.vercel.app/)
[![Database](https://img.shields.io/badge/Database-MySQL%20%7C%20Aiven%20Cloud%20%2818%20Tables%29-00758F?style=for-the-badge&logo=mysql&logoColor=white)](#-the-18-normalized-database-tables)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Tables](https://img.shields.io/badge/Schema-18%20Relational%20Tables-orange?style=for-the-badge)](#-the-18-normalized-database-tables)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

A modern, high-performance **University Hostel Administration & Campus Logistics Management System** engineered with **React 18**, **Vite**, **Node.js**, **Express**, and a strictly normalized **18-table relational MySQL database** hosted on **Aiven Cloud**.

The platform equips university administrators, residence wardens, mess caterers, and accounting staff with an enterprise-grade operational hub for resident student allocation, multi-block room reservations, dining hall provisioning, staff payroll, vendor procurement, pre-compiled analytical intelligence reporting, and arbitrary SQL execution.

---

## 🌐 Live Website

| Service | Hosting Platform | Working Application Link | Status |
| :--- | :--- | :--- | :--- |
| **HostelHub Application** | **Vercel** | [hostel-management-system-database-system-ao5stctla-nkp5.vercel.app](https://hostel-management-system-database-system-ao5stctla-nkp5.vercel.app/) | ![Live](https://img.shields.io/badge/Status-Live%20%26%20Operational-success?style=flat-square) |

> 🚀 **Public Access**: The live application is hosted on Vercel and publicly accessible without any login wall.

---

## 🏛 System Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT TIER                                     │
│   React 18 Single-Page Application (Vite Bundler @ Vercel Edge)                │
│   • Cosmic Midnight SaaS Design System (Tailored Dark Theme & Micro-FX)        │
│   • Lucide Vector Iconography                                                  │
│   • Client-Side State Router (Zero Page-Reload Navigation)                     │
│   • Interactive Modals & Foreign Key Referential Warnings                      │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       │ JSON over HTTPS / REST API
┌──────────────────────────────────────▼─────────────────────────────────────────┐
│                                SERVER TIER                                     │
│   Node.js + Express REST API Server                                            │
│   • Request Duration Logging & Standardized JSON Response Envelopes            │
│   • Asynchronous Data Access Layer with Connection Pooling                     │
│   • Parametric Prepared Statements & SQL Injection Safeguards                  │
│   • Live Health & MySQL Schema Reflection Engine                               │
└──────────────────────────────────────┬─────────────────────────────────────────┘
                                       │ TLSv1.3 Encrypted Pool (`mysql2/promise`)
┌──────────────────────────────────────▼─────────────────────────────────────────┐
│                               DATABASE TIER                                    │
│   Aiven Cloud MySQL (Service: mysql-5c45aac, MySQL 8.4.8 Engine)               │
│   • Exactly 18 Normalized Relational Tables (InnoDB Engine, utf8mb4)           │
│   • 18 Foreign Key Cascades & Referential Integrity Enforcements               │
│   • ACID Compliant Transactions & Scalable Cloud Storage                       │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Table of Contents

- [Core System Features & Capabilities](#-core-system-features--capabilities)
- [The 18 Normalized Database Tables](#-the-18-normalized-database-tables)
- [Relational Schema & Foreign Key Map](#-relational-schema--foreign-key-map)
- [Detailed Functionalities Breakdown](#-detailed-functionalities-breakdown)
  - [1. Executive Operations Dashboard](#1-executive-operations-dashboard)
  - [2. Student Profile & Resident Management](#2-student-profile--resident-management)
  - [3. Hostel Building & Block Administration](#3-hostel-building--block-administration)
  - [4. Room Inventory & Vacancy Tracking](#4-room-inventory--vacancy-tracking)
  - [5. Room Classification Catalog](#5-room-classification-catalog)
  - [6. Warden Administration & Contact Registry](#6-warden-administration--contact-registry)
  - [7. Mess Facilities & Dining Hall Operations](#7-mess-facilities--dining-hall-operations)
  - [8. Meal Menus, Scheduling & Pricing](#8-meal-menus-scheduling--pricing)
  - [9. Staff Workforce & Payroll Directory](#9-staff-workforce--payroll-directory)
  - [10. Supplier Network & Vendor Registry](#10-supplier-network--vendor-registry)
  - [11. Consumable Inventory & Provision Tracking](#11-consumable-inventory--provision-tracking)
  - [12. Procurement Ledger & Purchase Batches](#12-procurement-ledger--purchase-batches)
  - [13. Student Billing & Payment Transactions](#13-student-billing--payment-transactions)
  - [14. 13 Pre-Compiled Analytical Reports](#14-13-pre-compiled-analytical-reports)
  - [15. Full-Spectrum SQL Studio](#15-full-spectrum-sql-studio)
  - [16. 18 Dedicated Database Table Explorers](#16-18-dedicated-database-table-explorers)
- [Complete REST API Reference](#-complete-rest-api-reference)
- [Repository Structure](#-repository-structure)
- [Local Installation & Setup Guide](#-local-installation--setup-guide)
- [License](#-license)

---

## 🌟 Core System Features & Capabilities

- **Aiven Cloud MySQL Relational Engine**: Powered by managed MySQL 8.4.8 on Aiven Cloud over TLSv1.3 SSL with connection pooling via `mysql2/promise`.
- **18 Normalized Relational Tables**: Full 3NF normalization covering student housing, room allocations, meal menus, catering inventory, staff payroll, and billing details.
- **Strict Foreign Key Cascades**: `ENGINE=InnoDB` foreign keys with `ON DELETE CASCADE` on dependent tables (`STUDENT_PHONE`, `WARDEN_PHONE`, `MESS_CONTACT`, `STAFF_PHONE`, `SUPPLIER_PHONE`, `MEAL`, `PAYMENT_DETAIL`).
- **Full Spectrum SQL Studio**: Directly run arbitrary `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, `DROP`, Subqueries, and multi-statement batch scripts inside atomic transactions with execution profiling.
- **13 Multi-Table Relational Reports**: Pre-compiled analytical join queries computing resident assignments, occupancy percentages, financial summaries, and inventory stock health with millisecond profiling and 1-click CSV export.
- **18 Dedicated Table Explorer Views**: Dedicated UI screens for each table displaying 100% of columns and rows with visual badges for `(PK)`, `(FK)`, composite keys, and live search.
- **Cosmic Midnight SaaS UI**: Tailored dark-mode interface with deep blue radial illumination, responsive layout, and modern Lucide iconography.

---

## 🗄 The 18 Normalized Database Tables

The database schema strictly adheres to Third Normal Form (3NF) across **18 interconnected relational tables**:

| # | Table Name | Columns | Rows | Primary Key | Foreign Key Constraints | Functional Description |
|---|---|---|---|---|---|---|
| **1** | `WARDEN` | 4 | 5 | `WardenID` | *None* | Residential block wardens and administrative emails. |
| **2** | `WARDEN_PHONE` | 2 | 5 | `(WardenID, PhoneNo)` | `WardenID → WARDEN (CASCADE)` | Multi-contact phone numbers per warden (Composite PK). |
| **3** | `HOSTEL` | 4 | 5 | `HostelID` | `WardenID → WARDEN` | Residence buildings, floor counts, and presiding warden. |
| **4** | `ROOM_TYPE` | 4 | 4 | `TypeID` | *None* | Room classifications (Single, Double, Triple, Non-AC/AC). |
| **5** | `ROOM` | 6 | 5 | `RoomNo` | `HostelID → HOSTEL` | Physical rooms, floor numbers, bed capacity, and rent. |
| **6** | `STUDENT` | 13 | 5 | `StudentID` | `RoomNo → ROOM`<br>`HostelID → HOSTEL`<br>`MessID → MESS`<br>`MentorStudentID → STUDENT` | Student master profile with room, hostel, mess, and peer mentor links. |
| **7** | `STUDENT_PHONE` | 2 | 6 | `(StudentID, PhoneNo)` | `StudentID → STUDENT (CASCADE)` | Multi-contact phone numbers per student (Composite PK). |
| **8** | `MESS` | 4 | 5 | `MessID` | *None* | Dining halls, catering types, and campus locations. |
| **9** | `MESS_CONTACT` | 2 | 5 | `(MessID, ContactNo)` | `MessID → MESS (CASCADE)` | Multi-line telephone contacts for dining halls. |
| **10** | `MEAL` | 5 | 5 | `MealID` | `MessID → MESS (CASCADE)` | Meal menus, course descriptions, and individual pricing. |
| **11** | `STAFF` | 6 | 5 | `StaffID` | `MessID → MESS` | Mess workforce (Chefs, Cleaners, Managers) and salaries. |
| **12** | `STAFF_PHONE` | 2 | 5 | `(StaffID, PhoneNo)` | `StaffID → STAFF (CASCADE)` | Multi-line contact numbers for staff employees. |
| **13** | `SUPPLIER` | 2 | 5 | `SupplierID` | *None* | Registered food vendors and procurement contractors. |
| **14** | `SUPPLIER_PHONE` | 2 | 5 | `(SupplierID, PhoneNo)` | `SupplierID → SUPPLIER (CASCADE)` | Multi-line contact numbers for vendors. |
| **15** | `INVENTORY_ITEM` | 4 | 5 | `ItemID` | *None* | Consumable provision catalog and measurement units. |
| **16** | `PROCURES` | 4 | 5 | `(MessID, SupplierID, ItemID)` | `MessID → MESS`<br>`SupplierID → SUPPLIER`<br>`ItemID → INVENTORY_ITEM` | Relational procurement ledger recording purchase orders. |
| **17** | `PAYMENT` | 8 | 5 | `PaymentID` | `StudentID → STUDENT` | Transaction header ledger, payment modes, amounts, and dates. |
| **18** | `PAYMENT_DETAIL` | 6 | 5 | `(PaymentID, DetailID)` | `PaymentID → PAYMENT (CASCADE)` | Itemized financial breakdown (Mess charges vs. Room rent). |

---

## 🔗 Relational Schema & Foreign Key Map

```text
WARDEN ───< WARDEN_PHONE (Cascade Delete)
  │
  ├───< HOSTEL ───< ROOM ───< STUDENT ───< STUDENT_PHONE (Cascade Delete)
  │                          │    │   └──< STUDENT (Mentor self-reference)
  │                          │    │
  │                          │    └──< PAYMENT ───< PAYMENT_DETAIL (Cascade Delete)
  │                          │
  │                          └───< ROOM_TYPE (Classification link)
  │
MESS ───< MESS_CONTACT (Cascade Delete)
  │
  ├───< MEAL (Cascade Delete)
  ├───< STAFF ───< STAFF_PHONE (Cascade Delete)
  │
  └───< PROCURES >─── SUPPLIER ───< SUPPLIER_PHONE (Cascade Delete)
           │
           └──> INVENTORY_ITEM
```

---

## 🚀 Detailed Functionalities Breakdown

### 1. Executive Operations Dashboard
- **Real-Time KPIs**: Dynamic cards displaying Total Students, Active Hostels, Total Rooms, Occupancy Rate, Total Staff, Registered Vendors, and Total Payments Collected.
- **Occupancy Visualizer**: Progress bars depicting occupancy percentages by hostel block.
- **Low Stock Inventory Monitor**: Alert cards highlighting provisions nearing minimum threshold.
- **Recent Financial Activity**: Table of latest fee payments with payment status badges.

### 2. Student Profile & Resident Management
- Complete profile directory showing name, gender, DOB, blood group, allergies, dietary plans, assigned room, and hostel.
- Multi-phone contact chips and mentor relationships.
- Modal-driven CRUD operations with referential checks.

### 3. Hostel Building & Block Administration
- Residence block directory tracking total floors and presiding wardens.
- Direct links to room rosters and student assignment lists.

### 4. Room Inventory & Vacancy Tracking
- Directory of rooms across all campus blocks with floor levels and bed capacities.
- Live vacancy status and assigned student badges.

### 5. Room Classification Catalog
- Configurable room classes (Single, Double, Triple; AC vs. Non-AC) with default rent and capacity rules.

### 6. Warden Administration & Contact Registry
- Roster of presiding block wardens, official university emails, appointment dates, and emergency phone numbers.

### 7. Mess Facilities & Dining Hall Operations
- Dining hall operations directory mapping culinary types (North/South Indian, Continental) and physical locations.

### 8. Meal Menus, Scheduling & Pricing
- Itemized dining menus, meal categories (Breakfast, Lunch, Dinner), nutritional descriptions, and guest rates.

### 9. Staff Workforce & Payroll Directory
- Kitchen supervisors, chefs, and maintenance staff directory with employment dates, assigned mess halls, and monthly compensation.

### 10. Supplier Network & Vendor Registry
- Approved food, grocery, and dairy distributor network with multi-line dispatch phone numbers.

### 11. Consumable Inventory & Provision Tracking
- Real-time inventory tracking for rice, milk, vegetables, cooking oils, and poultry with standard metric units (Kg, Litre).

### 12. Procurement Ledger & Purchase Batches
- Three-way relational procurement orders connecting Mess Halls $\leftrightarrow$ Suppliers $\leftrightarrow$ Inventory Items.

### 13. Student Billing & Payment Transactions
- Student fee payment ledger tracking transaction IDs, payment modes (UPI, NetBanking, Cards), and payment status.
- Itemized breakdown of mess charges and room rent.

### 14. 13 Pre-Compiled Analytical Reports
Pre-compiled SQL queries with execution time profiling and CSV export:
1. **Student + Room + Hostel Report**: Resident allocation directory.
2. **Student + Phone Report**: Multi-contact phone registry.
3. **Hostel + Warden Report**: Administrative block hierarchy.
4. **Room + Hostel Report**: Comprehensive room configuration inventory.
5. **Mess + Meal Report**: Menus and meal price lists.
6. **Mess + Staff Report**: Kitchen personnel assignment breakdown.
7. **Supplier + Inventory Report**: Vendor provision supply matrix.
8. **Procurement Ledger Report**: Purchase ledger linking mess halls, vendors, and items.
9. **Student + Payment Report**: Student fee payment transactions.
10. **Overall Hostel Occupancy Report**: Block-level occupancy percentage aggregation.
11. **Available Rooms Report**: Vacant and partially occupied room directory.
12. **Student Payment Summary Report**: Total fees paid aggregated per student.
13. **Inventory & Procurement Summary Report**: Stock and procurement totals grouped by item.

### 15. Full-Spectrum SQL Studio
- **Arbitrary SQL Execution**: Execute any standard SQL command (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`, subqueries, CTEs, DDL).
- **16 Pre-Loaded SQL Templates**: Instant 1-click query templates for common reporting queries.
- **Execution Profiler**: Real-time measurement of execution duration in milliseconds.
- **Relational Schema Sidebar**: Live interactive schema tree displaying all 18 tables and column metadata.

### 16. 18 Dedicated Database Table Explorers
- Dedicated view for every single table in the relational schema.
- Primary key and foreign key badges on column headers.
- Real-time client-side search and 1-click CSV download.

---

## 📡 Complete REST API Reference

All API endpoints return standard JSON responses: `{ success: true, data: [...] }` or `{ success: false, message: "..." }`.

### System Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status, MySQL database connection, 18-table count, and timestamp. |
| `GET` | `/api/dashboard/stats` | High-level KPI aggregations, occupancy metrics, and recent payments. |

### Reports & SQL Studio
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reports` | List all 13 available analytical report templates. |
| `GET` | `/api/reports/:key` | Execute a specific pre-compiled analytical report query. |
| `POST` | `/api/query` | Execute an arbitrary SQL query (SELECT / DML / DDL). |
| `GET` | `/api/query/schema` | Complete schema metadata dictionary across all 18 tables. |

### Dynamic 18-Table Explorer
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tables` | List all 18 database table names. |
| `GET` | `/api/tables/:tableName` | Retrieve schema, column metadata, foreign keys, and rows for any table. |
| `POST` | `/api/tables/:tableName` | Insert a new record into any table. |
| `PUT` | `/api/tables/:tableName` | Update an existing record by primary key. |
| `DELETE` | `/api/tables/:tableName` | Delete a record by primary key. |

### Entity-Specific CRUD Endpoints
| Entity | Base Path | Supported HTTP Methods |
|---|---|---|
| **Students** | `/api/students` | `GET`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Hostels** | `/api/hostels` | `GET`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Rooms** | `/api/rooms` | `GET`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Room Types** | `/api/room-types` | `GET`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Wardens** | `/api/wardens` | `GET`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Mess Halls** | `/api/mess` | `GET`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Meals** | `/api/meals` | `GET`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Staff** | `/api/staff` | `GET`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Suppliers** | `/api/suppliers` | `GET`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Inventory** | `/api/inventory` | `GET`, `POST`, `PUT /:id`, `DELETE /:id` |
| **Procurements** | `/api/procurements` | `GET`, `POST`, `DELETE` |
| **Payments** | `/api/payments` | `GET`, `POST`, `DELETE /:id` |

---

## 📁 Repository Structure

```text
hostelmanagementsystem/
├── database/
│   ├── schema_mysql.sql        # Production Aiven MySQL DDL (18 tables, InnoDB, FKs)
│   ├── schema.sql              # Relational schema definition (18 tables)
│   └── seed.sql                # Dataset initialization seeds
│
├── backend/
│   ├── package.json            # Express, mysql2, cors, dotenv
│   ├── server.js               # Application entry point & health check
│   ├── database.js             # Unified database access adapter
│   ├── db-mysql.js             # Aiven Cloud MySQL connection pool & SSL setup
│   ├── migrate-to-mysql.js     # Data migration pipeline
│   ├── test-connection.js      # Aiven MySQL connection & SSL verification test
│   ├── test-endpoints-and-crud.js # Integration test suite (all endpoints + 12 CRUD)
│   ├── verify-mysql.js         # Table, row count, and FK constraint verifier
│   └── routes/                 # Async REST route controllers
│       ├── dashboard.js        # KPI summaries & occupancy aggregations
│       ├── students.js         # Student profile CRUD
│       ├── hostels.js          # Residence block CRUD
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
│       └── query.js            # Universal SQL Studio execution engine
│
├── frontend/
│   ├── index.html              # HTML5 application shell & SVG favicon
│   ├── package.json            # React 18, Vite 6, Lucide React
│   ├── vite.config.js          # Vite configuration & development proxy
│   ├── vercel.json             # Vercel SPA client-side rewrite rules
│   └── src/
│       ├── index.css           # Cosmic Midnight design system
│       ├── main.jsx            # React root mount
│       ├── App.jsx             # Application router & toast container
│       ├── services/api.js     # Unified API service
│       ├── components/         # Reusable UI components (Navbar, Sidebar, Modals)
│       └── pages/              # View pages (Dashboard, Reports, SQL Studio, Tables)
│
├── .env.example                # Sample environment variables (safe template)
├── .gitignore                  # Git exclusions (.env, node_modules, dist)
└── README.md                   # Complete system documentation
```

---

## 🛠 Local Installation & Setup Guide

### Prerequisites
- **Node.js**: Version `>= 18.0.0`
- **npm**: Version `>= 9.0.0`
- **Git**: Installed and configured

### 1. Clone the Repository
```bash
git clone https://github.com/nishanth418/hostelmanagementsystem.git
cd hostelmanagementsystem
```

### 2. Configure Backend Environment
Create `backend/.env` based on `.env.example`:
```bash
# Aiven Cloud MySQL Configuration
DB_HOST=mysql-5c45aac-YOUR_HOST.aivencloud.com
DB_PORT=26121
DB_USER=avnadmin
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=defaultdb
DB_SSL=true

PORT=5000
NODE_ENV=development
```

### 3. Install Dependencies & Start Backend
```bash
cd backend
npm install
npm start
```
The backend will launch at `http://localhost:5000`.

### 4. Install Dependencies & Start Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The React application will be available at `http://localhost:3000`.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute for educational and commercial applications.
