import React, { useState, useEffect } from 'react';
import { Terminal, Play, AlertCircle, CheckCircle2, Database, Clock, RefreshCw, Download, Trash2 } from 'lucide-react';
import { api } from '../services/api';

const EXACT_18_TABLES = [
  'WARDEN',
  'WARDEN_PHONE',
  'HOSTEL',
  'ROOM_TYPE',
  'ROOM',
  'STUDENT',
  'STUDENT_PHONE',
  'MESS',
  'MESS_CONTACT',
  'MEAL',
  'STAFF',
  'STAFF_PHONE',
  'SUPPLIER',
  'SUPPLIER_PHONE',
  'INVENTORY_ITEM',
  'PROCURES',
  'PAYMENT',
  'PAYMENT_DETAIL'
];

const SQL_CATEGORIES = ['All', 'DQL (Queries)', 'DML (Modify)', 'DDL (Schema)', 'Joins & Aggregates', 'Multi-Statement'];

const QUICK_COMMANDS = [
  // DQL
  {
    category: 'DQL (Queries)',
    label: 'SELECT * FROM STUDENT',
    sql: 'SELECT * FROM STUDENT;'
  },
  {
    category: 'DQL (Queries)',
    label: 'WHERE & ORDER BY',
    sql: "SELECT StudentID, FirstName, LastName, Gender, PlanType\nFROM STUDENT\nWHERE Gender = 'Female'\nORDER BY FirstName ASC;"
  },
  {
    category: 'DQL (Queries)',
    label: 'Nested Subquery',
    sql: "SELECT StudentID, Amount, PaymentMode, Status\nFROM PAYMENT\nWHERE Amount > (SELECT AVG(Amount) FROM PAYMENT);"
  },
  {
    category: 'DQL (Queries)',
    label: 'WITH (CTE) Query',
    sql: "WITH HighRentRooms AS (\n  SELECT RoomNo, FloorNo, Type, RoomRent\n  FROM ROOM\n  WHERE RoomRent >= 5000\n)\nSELECT * FROM HighRentRooms\nORDER BY RoomRent DESC;"
  },
  // Joins & Aggregates
  {
    category: 'Joins & Aggregates',
    label: '3-Table INNER JOIN',
    sql: "SELECT s.StudentID, s.FirstName || ' ' || s.LastName AS FullName,\n       r.RoomNo, r.RoomRent, h.HostelName\nFROM STUDENT s\nJOIN ROOM r ON s.RoomNo = r.RoomNo\nJOIN HOSTEL h ON s.HostelID = h.HostelID;"
  },
  {
    category: 'Joins & Aggregates',
    label: 'LEFT JOIN & Aggregation',
    sql: "SELECT h.HostelName, COUNT(s.StudentID) AS TotalResidents\nFROM HOSTEL h\nLEFT JOIN STUDENT s ON h.HostelID = s.HostelID\nGROUP BY h.HostelID, h.HostelName;"
  },
  {
    category: 'Joins & Aggregates',
    label: 'GROUP BY & HAVING',
    sql: "SELECT PlanType, COUNT(*) AS StudentCount\nFROM STUDENT\nGROUP BY PlanType\nHAVING COUNT(*) >= 1;"
  },
  {
    category: 'Joins & Aggregates',
    label: 'Payment Aggregates',
    sql: "SELECT Status, COUNT(*) AS TotalCount, SUM(Amount) AS TotalCollected, ROUND(AVG(Amount), 2) AS AvgAmount\nFROM PAYMENT\nGROUP BY Status;"
  },
  // DML
  {
    category: 'DML (Modify)',
    label: 'INSERT Record',
    sql: "INSERT INTO ROOM_TYPE (TypeID, TypeName, AC_Type, Capacity)\nVALUES ('RT99', 'Deluxe Single', 'AC', 1);"
  },
  {
    category: 'DML (Modify)',
    label: 'UPDATE Record',
    sql: "UPDATE ROOM\nSET RoomRent = 5200\nWHERE RoomNo = 'R101';"
  },
  {
    category: 'DML (Modify)',
    label: 'DELETE Record',
    sql: "DELETE FROM ROOM_TYPE\nWHERE TypeID = 'RT99';"
  },
  // DDL
  {
    category: 'DDL (Schema)',
    label: 'CREATE TABLE',
    sql: "CREATE TABLE IF NOT EXISTS CAMPUS_EVENT (\n  EventID TEXT PRIMARY KEY,\n  EventName TEXT NOT NULL,\n  EventDate TEXT NOT NULL,\n  Venue TEXT NOT NULL\n);"
  },
  {
    category: 'DDL (Schema)',
    label: 'ALTER TABLE',
    sql: "ALTER TABLE CAMPUS_EVENT ADD COLUMN Organizer TEXT DEFAULT 'Admin';"
  },
  {
    category: 'DDL (Schema)',
    label: 'CREATE VIEW',
    sql: "CREATE VIEW IF NOT EXISTS VIEW_STUDENT_HOSTEL AS\nSELECT s.StudentID, s.FirstName || ' ' || s.LastName AS FullName, h.HostelName, s.RoomNo\nFROM STUDENT s\nJOIN HOSTEL h ON s.HostelID = h.HostelID;"
  },
  {
    category: 'DDL (Schema)',
    label: 'DROP TABLE',
    sql: "DROP TABLE IF EXISTS CAMPUS_EVENT;"
  },
  // Multi-Statement
  {
    category: 'Multi-Statement',
    label: 'Batch Script',
    sql: "CREATE TABLE IF NOT EXISTS DEMO_TEMP (ID INT PRIMARY KEY, Val TEXT);\nINSERT INTO DEMO_TEMP VALUES (1, 'SQL Studio Live');\nSELECT * FROM DEMO_TEMP;\nDROP TABLE DEMO_TEMP;"
  }
];

export default function SqlQueryPage({ showToast }) {
  const [sql, setSql] = useState('SELECT * FROM STUDENT;');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [schemaMap, setSchemaMap] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    loadSchema();
  }, []);

  async function loadSchema() {
    try {
      const res = await api.getSqlSchema();
      setSchemaMap(res.tables || {});
    } catch (err) {
      console.error('Error fetching schema map', err);
    }
  }

  async function handleExecuteQuery() {
    if (!sql.trim()) {
      showToast('Please enter a SQL command to execute', 'warning');
      return;
    }

    try {
      setExecuting(true);
      setErrorInfo(null);
      setResult(null);

      const res = await api.executeSqlQuery(sql);
      setResult(res);

      if (res.rows || res.data) {
        showToast(`Query returned ${res.count || (res.rows && res.rows.length) || 0} row(s) in ${res.executionTimeMs}ms`, 'success');
      } else if (res.changes !== undefined) {
        showToast(`Command executed successfully. Affected rows: ${res.changes}`, 'success');
        loadSchema();
      } else {
        showToast(res.message || 'Command executed successfully', 'success');
        loadSchema();
      }
    } catch (err) {
      setErrorInfo({
        message: err.message || 'An error occurred during query execution',
        status: err.status || 400
      });
      showToast(err.message || 'SQL Execution Error', 'error');
    } finally {
      setExecuting(false);
    }
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleExecuteQuery();
    }
  }

  function exportToCSV() {
    if (!resultRows.length) return;
    const headers = resultCols.join(',');
    const rows = resultRows.map(r => 
      resultCols.map(c => {
        const val = r[c] === null || r[c] === undefined ? '' : String(r[c]);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported query results to CSV', 'success');
  }

  const isSelectResult = result && (result.rows || result.data) && Array.isArray(result.rows || result.data);
  const resultRows = result ? (result.rows || result.data || []) : [];
  const resultCols = result ? (result.columns || (resultRows.length > 0 ? Object.keys(resultRows[0]) : [])) : [];
  const tablesList = Object.keys(schemaMap).length > 0 ? Object.keys(schemaMap) : EXACT_18_TABLES;
  const filteredCommands = activeCategory === 'All' 
    ? QUICK_COMMANDS 
    : QUICK_COMMANDS.filter(q => q.category === activeCategory);

  return (
    <div>
      {/* Category selector & quick query buttons toolbar */}
      <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginRight: 4 }}>
            SQL Operations:
          </span>
          {SQL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? '#2563eb' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: isActive ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Quick query action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {filteredCommands.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setSql(q.sql)}
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '5px 11px',
                  fontSize: '0.75rem',
                  fontFamily: q.label.startsWith('SELECT') ? 'var(--font-mono)' : 'inherit',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                {q.label}
              </button>
            ))}
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={loadSchema}
            title="Refresh tables schema"
            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
          >
            <RefreshCw size={12} />
            <span>Refresh</span>
          </button>
        </div>
      </div>


      {/* Main Console Grid: 18 Tables Explorer + SQL Editor */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, marginBottom: 16 }}>
        {/* 18 Tables Explorer */}
        <div
          className="panel"
          style={{
            padding: '12px',
            marginBottom: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '240px'
          }}
        >
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
              marginBottom: 8,
              paddingBottom: 6,
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Database size={14} color="#2563eb" />
            <span>18 Tables Explorer</span>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {tablesList.map((table) => {
              const isSelected = selectedTable === table;
              const colCount = schemaMap[table]?.length;
              return (
                <button
                  key={table}
                  onClick={() => {
                    setSelectedTable(isSelected ? null : table);
                    setSql(`SELECT * FROM ${table};`);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '5px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(37, 99, 235, 0.18)' : 'transparent',
                    border: isSelected ? '1px solid rgba(37, 99, 235, 0.4)' : '1px solid transparent',
                    color: isSelected ? '#ffffff' : '#cbd5e1',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#cbd5e1';
                    }
                  }}
                >
                  <span style={{ fontWeight: isSelected ? 600 : 500 }}>{table}</span>
                  {colCount !== undefined && (
                    <span style={{ fontSize: '0.68rem', color: isSelected ? '#93c5fd' : '#64748b' }}>
                      {colCount} cols
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SQL Editor Surface */}
        <div
          className="panel"
          style={{
            padding: '12px',
            marginBottom: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '240px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
              paddingBottom: 6,
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Terminal size={14} color="#2563eb" />
              <span>SQL Editor</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSql('')}
                title="Clear editor"
                style={{ padding: '4px 8px', fontSize: '0.78rem' }}
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleExecuteQuery}
                disabled={executing}
                style={{ padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600 }}
              >
                <Play size={13} />
                <span>{executing ? 'Executing...' : 'Run Query (Ctrl + Enter)'}</span>
              </button>
            </div>
          </div>

          <textarea
            className="sql-editor-box"
            style={{
              flex: 1,
              width: '100%',
              minHeight: 0,
              resize: 'none',
              background: '#070b14',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              color: '#f8fafc',
              lineHeight: 1.5,
              outline: 'none'
            }}
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="SELECT * FROM STUDENT;"
            spellCheck="false"
          />
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorInfo && (
        <div
          className="panel"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: 16
          }}
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ color: '#f87171', fontWeight: 600, fontSize: '0.84rem' }}>
                SQL Execution Error
              </div>
              <div style={{ color: '#fca5a5', fontSize: '0.80rem', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {errorInfo.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success DDL / DML Result Display */}
      {result && !isSelectResult && (
        <div
          className="panel"
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: 16
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.84rem' }}>
                Query executed successfully
              </span>
              {result.changes !== undefined && (
                <span style={{ color: '#cbd5e1', fontSize: '0.80rem' }}>
                  · Affected rows: <strong style={{ color: '#fff' }}>{result.changes}</strong>
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#38bdf8', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
              <Clock size={13} />
              <span>{result.executionTimeMs} ms</span>
            </div>
          </div>
        </div>
      )}

      {/* Query Results Table for SELECT / WITH */}
      {isSelectResult && (
        <div className="table-container">
          <div className="table-toolbar" style={{ padding: '10px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h3 style={{ color: '#fff', fontSize: '0.92rem', fontWeight: 600 }}>Query Results</h3>
              <span className="badge badge-success">{resultRows.length} Row(s)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={exportToCSV}
                style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#38bdf8', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                <Clock size={13} />
                <span>{result.executionTimeMs} ms</span>
              </div>
            </div>
          </div>

          <div className="data-table-wrapper" style={{ overflowX: 'auto', maxHeight: '55vh' }}>
            <table className="data-table" style={{ width: 'max-content', minWidth: '100%' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  {resultCols.map((col) => {
                    const cLower = col.toLowerCase();
                    const isDate = cLower === 'dob' || cLower.includes('date');
                    const isPhone = cLower.includes('phone') || cLower.includes('contact');
                    const isId = cLower.endsWith('id') || cLower.includes('roomno');
                    const isEmail = cLower.includes('email');
                    const minWidth = isDate ? '130px' : isPhone ? '135px' : isId ? '110px' : isEmail ? '190px' : '100px';

                    return (
                      <th
                        key={col}
                        style={{
                          whiteSpace: 'nowrap',
                          minWidth: minWidth,
                          padding: '10px 16px',
                          background: 'var(--bg-table-header)',
                          borderBottom: '1px solid var(--border-color)'
                        }}
                      >
                        {col}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {resultRows.length === 0 ? (
                  <tr>
                    <td colSpan={resultCols.length || 1} style={{ textAlign: 'center', padding: '26px 0', color: '#94a3b8' }}>
                      Query executed successfully with 0 rows returned.
                    </td>
                  </tr>
                ) : (
                  resultRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {resultCols.map((col) => {
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
                              padding: '10px 16px',
                              whiteSpace: 'nowrap',
                              minWidth: isDate ? '130px' : undefined,
                              fontFamily: isDate || isId || isPhone || isNum ? 'var(--font-mono)' : 'inherit',
                              color: isNum ? '#10b981' : isId ? '#38bdf8' : '#cbd5e1'
                            }}
                          >
                            {val === null || val === undefined ? (
                              <span style={{ color: '#f87171', fontStyle: 'italic', fontSize: '0.74rem' }}>NULL</span>
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
        </div>
      )}
    </div>
  );
}
