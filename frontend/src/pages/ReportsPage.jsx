import React, { useState, useEffect } from 'react';
import { FileBarChart2, Download, Code, Play, Search, Clock, Check } from 'lucide-react';
import { api } from '../services/api';

const REPORTS = [
  { key: 'student-room-hostel', title: '1. Student + Room + Hostel' },
  { key: 'student-phones', title: '2. Student + Student Phone' },
  { key: 'hostel-warden', title: '3. Hostel + Warden' },
  { key: 'room-type-hostel', title: '4. Room + Room Type + Hostel' },
  { key: 'mess-meal', title: '5. Mess + Meal' },
  { key: 'mess-staff', title: '6. Mess + Staff' },
  { key: 'supplier-inventory', title: '7. Supplier + Inventory' },
  { key: 'procurement-supplier-inventory', title: '8. Procurement + Supplier + Inventory' },
  { key: 'student-payment', title: '9. Student + Payment' },
  { key: 'hostel-occupancy', title: '10. Overall Hostel Occupancy' },
  { key: 'available-rooms', title: '11. Available Rooms' },
  { key: 'student-payment-summary', title: '12. Student Payment Summary' },
  { key: 'inventory-procurement-summary', title: '13. Inventory & Procurement Summary' }
];

export default function ReportsPage({ showToast }) {
  const [selectedKey, setSelectedKey] = useState('student-room-hostel');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSql, setShowSql] = useState(false);
  const [filterTerm, setFilterTerm] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReport(selectedKey);
  }, [selectedKey]);

  async function loadReport(key) {
    try {
      setLoading(true);
      const res = await api.getReportData(key);
      setReportData(res);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    if (!reportData || !reportData.data || reportData.data.length === 0) return;
    const items = reportData.data;
    const headers = Object.keys(items[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of items) {
      const values = headers.map((header) => {
        const val = row[header];
        const escaped = ('' + (val === null || val === undefined ? '' : val)).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedKey}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report downloaded as CSV', 'success');
  }

  function copySql() {
    if (!reportData?.sql) return;
    navigator.clipboard.writeText(reportData.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('SQL Query copied to clipboard', 'info');
  }

  const columns = reportData?.data && reportData.data.length > 0 ? Object.keys(reportData.data[0]) : [];

  const filteredData = (reportData?.data || []).filter((row) => {
    if (!filterTerm) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(filterTerm.toLowerCase())
    );
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title">
          <h2>Multi-Table Relational Reports</h2>
          <p>Complex analytical reports generated across 18 relational tables using SQL JOINs</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setShowSql(!showSql)}>
            <Code size={16} />
            {showSql ? 'Hide SQL' : 'View SQL'}
          </button>
          <button className="btn btn-primary" onClick={exportCsv} disabled={!reportData?.data?.length}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 14,
          marginBottom: 20
        }}
      >
        {REPORTS.map((r) => {
          const isSelected = selectedKey === r.key;
          return (
            <button
              key={r.key}
              onClick={() => setSelectedKey(r.key)}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-sm)',
                background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                color: isSelected ? '#fff' : 'var(--text-secondary)',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {r.title}
            </button>
          );
        })}
      </div>

      {/* SQL Query Inspector Panel */}
      {showSql && reportData?.sql && (
        <div className="panel" style={{ background: '#0c101c', border: '1px solid rgba(37, 99, 235, 0.3)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.78rem', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Underlying SQL Query
            </span>
            <button className="btn btn-secondary btn-sm" onClick={copySql}>
              {copied ? <Check size={14} color="#10b981" /> : <Code size={14} />}
              <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              color: '#38bdf8',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6
            }}
          >
            {reportData.sql}
          </pre>
        </div>
      )}

      {/* Report Info & Results */}
      <div className="table-container">
        <div className="table-toolbar">
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700 }}>
              {reportData?.title || 'Report Results'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{reportData?.description}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontSize: '0.8rem' }}>
              <Clock size={14} />
              <span>{reportData?.executionTimeMs || 0} ms</span>
            </div>

            <div className="search-input-wrapper" style={{ minWidth: 220, maxWidth: 300 }}>
              <Search size={14} />
              <input
                type="text"
                className="search-input"
                placeholder="Filter results..."
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="data-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: 'max-content', minWidth: '100%' }}>
            <thead>
              <tr>
                {columns.map((col) => {
                  const cLower = col.toLowerCase();
                  const isDate = cLower === 'dob' || cLower.includes('date');
                  const isPhone = cLower.includes('phone') || cLower.includes('contact');
                  const isId = cLower.endsWith('id') || cLower.includes('roomno');
                  const minWidth = isDate ? '130px' : isPhone ? '135px' : isId ? '110px' : 'auto';

                  return (
                    <th key={col} style={{ whiteSpace: 'nowrap', minWidth }}>
                      {col.replace(/_/g, ' ')}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length || 1} style={{ textAlign: 'center', padding: '40px 0' }}>
                    Executing SQL Report...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length || 1} style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    No rows returned for this query.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((col) => {
                      const val = row[col];
                      const cLower = col.toLowerCase();
                      const isDate = cLower === 'dob' || cLower.includes('date');
                      const isPhone = cLower.includes('phone') || cLower.includes('contact');
                      const isId = cLower.endsWith('id') || cLower.includes('roomno');
                      const isNum = typeof val === 'number';

                      return (
                        <td
                          key={col}
                          style={{
                            color: isNum ? '#10b981' : isId ? '#38bdf8' : '#cbd5e1',
                            whiteSpace: 'nowrap',
                            minWidth: isDate ? '130px' : undefined,
                            fontFamily: isDate || isId || isPhone || isNum ? 'var(--font-mono)' : 'inherit'
                          }}
                        >
                          {val === null || val === undefined ? (
                            '-'
                          ) : isDate ? (
                            <span style={{ display: 'inline-block', whiteSpace: 'nowrap', minWidth: '100px', letterSpacing: '0.02em' }}>
                              {String(val)}
                            </span>
                          ) : (
                            <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                              {String(val)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', color: '#94a3b8', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>Showing {filteredData.length} records</span>
          <span>Database: hostel.db</span>
        </div>
      </div>
    </div>
  );
}
