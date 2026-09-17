import React, { useState, useEffect } from 'react';
import { Terminal, Play, AlertCircle, CheckCircle2, Database, Clock, RefreshCw } from 'lucide-react';
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

const QUICK_COMMANDS = [
  {
    label: 'SELECT * FROM STUDENT;',
    sql: 'SELECT * FROM STUDENT;'
  },
  {
    label: 'SELECT * FROM WARDEN;',
    sql: 'SELECT * FROM WARDEN;'
  },
  {
    label: 'SELECT * FROM ROOM;',
    sql: 'SELECT * FROM ROOM;'
  },
  {
    label: 'INSERT example',
    sql: "INSERT INTO ROOM_TYPE (TypeID, TypeName, AC_Type, Capacity)\nVALUES ('RT4', 'Deluxe Single', 'AC', 1);"
  },
  {
    label: 'UPDATE example',
    sql: "UPDATE ROOM\nSET RoomRent = 5200\nWHERE RoomNo = 'R101';"
  },
  {
    label: 'DELETE example',
    sql: "DELETE FROM ROOM_TYPE\nWHERE TypeID = 'RT4';"
  }
];

export default function SqlQueryPage({ showToast }) {
  const [sql, setSql] = useState('SELECT * FROM STUDENT;');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [schemaMap, setSchemaMap] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);

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

  const isSelectResult = result && (result.rows || result.data) && Array.isArray(result.rows || result.data);
  const resultRows = result ? (result.rows || result.data || []) : [];
  const resultCols = result ? (result.columns || (resultRows.length > 0 ? Object.keys(resultRows[0]) : [])) : [];
  const tablesList = Object.keys(schemaMap).length > 0 ? Object.keys(schemaMap) : EXACT_18_TABLES;

  return (
    <div>
      {/* Quick query buttons toolbar with Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {QUICK_COMMANDS.map((q, idx) => (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#38bdf8', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
              <Clock size={13} />
              <span>{result.executionTimeMs} ms</span>
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
