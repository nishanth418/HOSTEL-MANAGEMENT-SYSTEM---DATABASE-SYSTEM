import React, { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  BedDouble,
  AlertCircle,
  UserCheck,
  Truck,
  Boxes,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Database,
  Table2
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { api } from '../services/api';
import { TABLE_GROUPS } from '../components/Sidebar';

export default function DashboardPage({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardStats();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        <div className="spin-animation" style={{ display: 'inline-block', marginBottom: 12 }}>
          <TrendingUp size={32} color="#2563eb" />
        </div>
        <p>Loading database dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel" style={{ borderLeft: '4px solid #ef4444' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <AlertCircle color="#ef4444" size={24} />
          <div>
            <h4 style={{ color: '#fff' }}>Error Loading Dashboard</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{error}</p>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={fetchStats}>
          Retry Connection
        </button>
      </div>
    );
  }

  const s = data?.summary || {};

  return (
    <div>
      {/* Dashboard Page Header */}
      <div className="page-header dashboard-page-header">
        <div className="page-header-title">
          <h1 className="dashboard-main-heading">Hostel Operations Dashboard</h1>
          <p className="dashboard-subheading">Real-time analytics and management overview from relational database</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('reports')}>
            View All Reports
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid">
        <StatCard
          title="Total Students"
          value={s.totalStudents || 0}
          subtext="Active hostellers"
          icon={Users}
          color="#2563eb"
          gradient="rgba(37, 99, 235, 0.12)"
        />
        <StatCard
          title="Hostel Buildings"
          value={s.totalHostels || 0}
          subtext="Campuses North & South"
          icon={Building2}
          color="#0ea5e9"
          gradient="rgba(14, 165, 233, 0.12)"
        />
        <StatCard
          title="Total Rooms"
          value={s.totalRooms || 0}
          subtext={`${s.occupiedRooms || 0} Occupied (${s.occupancyRate || 0}%)`}
          icon={BedDouble}
          color="#10b981"
          gradient="rgba(16, 185, 129, 0.12)"
        />
        <StatCard
          title="Staff Members"
          value={s.totalStaff || 0}
          subtext="Cooks, cleaners, security"
          icon={UserCheck}
          color="#f59e0b"
          gradient="rgba(245, 158, 11, 0.12)"
        />
        <StatCard
          title="Suppliers"
          value={s.totalSuppliers || 0}
          subtext="Active vendor contracts"
          icon={Truck}
          color="#ec4899"
          gradient="rgba(236, 72, 153, 0.12)"
        />
        <StatCard
          title="Inventory Items"
          value={s.totalInventoryItems || 0}
          subtext="Food, linen, electricals"
          icon={Boxes}
          color="#14b8a6"
          gradient="rgba(20, 184, 166, 0.12)"
        />
        <StatCard
          title="Total Fee Collection"
          value={`₹${(s.totalPaymentsAmount || 0).toLocaleString()}`}
          subtext={`${s.totalPaymentsCount || 0} payment records`}
          icon={CreditCard}
          color="#10b981"
          gradient="rgba(16, 185, 129, 0.12)"
        />
      </div>

      {/* Recent Payments Section */}
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">Recent Fee Transactions</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('payments')}>
            All Payments
          </button>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Student</th>
                <th>Room & Hostel</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentPayments?.map((p) => (
                <tr key={p.payment_id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {p.transaction_id}
                  </td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{p.student_name}</td>
                  <td>
                    {p.room_number ? `${p.room_number} (${p.hostel_name})` : '-'}
                  </td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>
                    ₹{p.total_amount.toLocaleString()}
                  </td>
                  <td>{p.payment_method}</td>
                  <td>
                    <span className={`badge ${p.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                      {p.payment_status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', minWidth: '120px', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>{p.payment_date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 18 Database Tables Grouped Navigation Explorer */}
      <div className="panel" style={{ marginTop: 28 }}>
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database size={20} color="#2563eb" />
            <h3 className="panel-title">Database Tables Explorer (18 Relational Tables)</h3>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Direct Database Views with PK/FK relationships
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {TABLE_GROUPS.map((group) => (
            <div
              key={group.groupTitle}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${group.accentBorder}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: group.headingColor,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>{group.groupTitle}</span>
                <span
                  style={{
                    fontSize: '0.66rem',
                    background: group.accentBgHover,
                    border: `1px solid ${group.accentBorder}`,
                    padding: '1px 6px',
                    borderRadius: 4,
                    color: group.headingColor
                  }}
                >
                  {group.tables.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {group.tables.map((table) => (
                  <button
                    key={table}
                    className="db-table-chip"
                    onClick={() => onNavigate(`table_${table}`)}
                    style={{
                      background: '#111827',
                      border: `1px solid ${group.accentBorder}`,
                      color: '#cbd5e1',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.80rem',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#18223a';
                      e.currentTarget.style.borderColor = group.accent;
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#111827';
                      e.currentTarget.style.borderColor = group.accentBorder;
                      e.currentTarget.style.color = '#cbd5e1';
                    }}
                  >
                    <Table2 size={13} color={group.accent} />
                    <span>{table}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
