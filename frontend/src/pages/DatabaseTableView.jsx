import React, { useState, useEffect } from 'react';
import {
  Table2,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Download,
  Key,
  Link2,
  AlertCircle,
  Database
} from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../services/api';

// Helper to classify columns for responsive styling and wrapping prevention
function getColumnCategory(colName = '', colType = '') {
  const name = (colName || '').toLowerCase();
  const type = (colType || '').toUpperCase();

  if (name === 'dob' || name.includes('date') || name.includes('_day') || name.includes('_month') || name.includes('_year')) {
    return 'date';
  }
  if (name.includes('phone') || name.includes('contact')) {
    return 'phone';
  }
  if (name.endsWith('id') || name === 'id' || name.includes('_id') || name.includes('roomno')) {
    return 'id';
  }
  if (name.includes('email')) {
    return 'email';
  }
  if (name.includes('description') || name.includes('allergy') || name.includes('address')) {
    return 'long-text';
  }
  if (
    type.includes('INT') ||
    type.includes('REAL') ||
    type.includes('NUM') ||
    name.includes('amount') ||
    name.includes('rent') ||
    name.includes('salary') ||
    name.includes('cost') ||
    name.includes('capacity')
  ) {
    return 'number';
  }
  return 'default';
}

function getColumnMinWidth(category) {
  switch (category) {
    case 'date':
      return '130px';
    case 'phone':
      return '135px';
    case 'id':
      return '110px';
    case 'email':
      return '190px';
    case 'long-text':
      return '220px';
    case 'number':
      return '100px';
    default:
      return '120px';
  }
}

export default function DatabaseTableView({ tableName, showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form data for add / edit
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadTableData();
  }, [tableName, refreshKey]);

  async function loadTableData() {
    try {
      setLoading(true);
      const res = await api.getTableInfo(tableName, searchTerm);
      setData(res);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadTableData();
  }

  function handleOpenAddModal() {
    const initial = {};
    if (data?.columns) {
      data.columns.forEach((col) => {
        initial[col.name] = '';
      });
    }
    setFormData(initial);
    setIsAddModalOpen(true);
  }

  function handleOpenEditModal(row) {
    setEditingRow(row);
    const formVals = {};
    if (data?.columns) {
      data.columns.forEach((col) => {
        formVals[col.name] = row[col.name] !== null && row[col.name] !== undefined ? String(row[col.name]) : '';
      });
    }
    setFormData(formVals);
  }

  async function handleSaveNewRow(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {};
      for (const [key, val] of Object.entries(formData)) {
        if (val !== '') {
          const colDef = data?.columns.find((c) => c.name === key);
          if (colDef && (colDef.type.includes('INT') || colDef.type.includes('REAL') || colDef.type.includes('NUM'))) {
            payload[key] = Number(val);
          } else {
            payload[key] = val;
          }
        }
      }

      await api.insertTableRow(tableName, payload);
      showToast(`Record inserted into ${tableName} successfully`, 'success');
      setIsAddModalOpen(false);
      loadTableData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEditRow(e) {
    e.preventDefault();
    if (!editingRow || !data?.primaryKeys) return;

    try {
      setSaving(true);
      const keyCriteria = {};
      data.primaryKeys.forEach((pk) => {
        keyCriteria[pk] = editingRow[pk];
      });

      const values = {};
      for (const [key, val] of Object.entries(formData)) {
        const colDef = data?.columns.find((c) => c.name === key);
        if (val === '') {
          values[key] = null;
        } else if (colDef && (colDef.type.includes('INT') || colDef.type.includes('REAL') || colDef.type.includes('NUM'))) {
          values[key] = Number(val);
        } else {
          values[key] = val;
        }
      }

      await api.updateTableRow(tableName, keyCriteria, values);
      showToast(`Record in ${tableName} updated successfully`, 'success');
      setEditingRow(null);
      loadTableData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || !data?.primaryKeys) return;

    try {
      setSaving(true);
      const keyCriteria = {};
      data.primaryKeys.forEach((pk) => {
        keyCriteria[pk] = deleteTarget[pk];
      });

      await api.deleteTableRow(tableName, keyCriteria);
      showToast(`Record deleted from ${tableName} successfully`, 'success');
      setDeleteTarget(null);
      loadTableData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  function exportCsv() {
    if (!data?.data || data.data.length === 0) return;
    const headers = data.columns.map((c) => c.name);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data.data) {
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
    link.setAttribute('download', `${tableName}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${tableName} data to CSV`, 'success');
  }

  const columns = data?.columns || [];
  const rows = data?.data || [];

  return (
    <div>
      {/* Table Header */}
      <div className="page-header">
        <div className="page-header-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database size={24} color="#2563eb" />
            <h2>{tableName}</h2>
            <span
              style={{
                background: 'rgba(37, 99, 235, 0.12)',
                border: '1px solid rgba(37, 99, 235, 0.28)',
                color: '#93c5fd',
                fontSize: '0.74rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Relational Table
            </span>
          </div>
          <p>
            Relational table containing all <strong>{columns.length} columns</strong> and{' '}
            <strong>{data?.totalRows || 0} actual rows</strong> from <code>hostel.db</code>
          </p>
        </div>

        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setRefreshKey((k) => k + 1)}>
            <RefreshCw size={15} />
            Refresh
          </button>
          <button className="btn btn-secondary" onClick={exportCsv} disabled={rows.length === 0}>
            <Download size={15} />
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} />
            Insert Record
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginBottom: 16,
          gap: 12
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8 }}>
          <div className="search-input-wrapper" style={{ minWidth: 220, maxWidth: 320 }}>
            <Search size={14} />
            <input
              type="text"
              className="search-input"
              placeholder={`Search ${tableName}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchTerm('');
                setRefreshKey((k) => k + 1);
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Relational Table with Horizontal Scrolling & ALL columns */}
      <div className="table-container">
        <div className="data-table-wrapper" style={{ overflowX: 'auto', maxHeight: '72vh' }}>
          <table className="data-table" style={{ width: 'max-content', minWidth: '100%' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                {columns.map((col) => {
                  const category = getColumnCategory(col.name, col.type);
                  const minWidth = getColumnMinWidth(category);

                  return (
                    <th
                      key={col.name}
                      style={{
                        padding: '12px 18px',
                        background: 'var(--bg-table-header)',
                        borderBottom: '1px solid var(--border-color)',
                        whiteSpace: 'nowrap',
                        minWidth: minWidth
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#fff', fontSize: '0.84rem', fontWeight: 700 }}>
                          {col.name}
                        </span>

                        {col.keyBadge && (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              color: col.keyBadge === 'PK, FK' ? '#fef08a' : col.keyBadge === 'PK' ? '#fbbf24' : '#38bdf8'
                            }}
                          >
                            ({col.keyBadge})
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            color: '#64748b',
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          {col.type}
                        </span>
                        {col.fkRef && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              color: '#38bdf8',
                              fontFamily: 'var(--font-mono)'
                            }}
                            title={`References ${col.fkRef.table}(${col.fkRef.to})`}
                          >
                            → {col.fkRef.table}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
                <th
                  style={{
                    padding: '12px 18px',
                    background: 'var(--bg-table-header)',
                    borderBottom: '1px solid var(--border-color)',
                    textAlign: 'right',
                    position: 'sticky',
                    right: 0,
                    zIndex: 11,
                    minWidth: '100px'
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '50px 0' }}>
                    <div className="spin-animation" style={{ display: 'inline-block', marginBottom: 8 }}>
                      <RefreshCw size={24} color="#2563eb" />
                    </div>
                    <p style={{ color: '#94a3b8' }}>Loading {tableName} records from database...</p>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}
                  >
                    No records found in table <strong>{tableName}</strong>.
                  </td>
                </tr>
              ) : (
                rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {columns.map((col) => {
                      const val = row[col.name];
                      const isNull = val === null || val === undefined;
                      const category = getColumnCategory(col.name, col.type);
                      const minWidth = getColumnMinWidth(category);
                      const isLongText = category === 'long-text';

                      return (
                        <td
                          key={col.name}
                          style={{
                            padding: '12px 18px',
                            whiteSpace: isLongText ? 'normal' : 'nowrap',
                            minWidth: minWidth,
                            maxWidth: isLongText ? '320px' : undefined,
                            fontFamily:
                              category === 'date' || category === 'id' || category === 'phone' || category === 'number' || col.isPk
                                ? 'var(--font-mono)'
                                : 'inherit',
                            fontSize: '0.84rem'
                          }}
                        >
                          {isNull ? (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: '#f87171',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                fontStyle: 'italic'
                              }}
                            >
                              NULL
                            </span>
                          ) : col.isPk ? (
                            <span style={{ display: 'inline-block', whiteSpace: 'nowrap', fontWeight: 700, color: '#fff' }}>
                              {String(val)}
                            </span>
                          ) : col.isFk ? (
                            <span style={{ display: 'inline-block', whiteSpace: 'nowrap', color: '#38bdf8', fontWeight: 500 }}>
                              {String(val)}
                            </span>
                          ) : category === 'date' ? (
                            <span
                              style={{
                                display: 'inline-block',
                                whiteSpace: 'nowrap',
                                minWidth: '100px',
                                letterSpacing: '0.02em',
                                color: '#cbd5e1'
                              }}
                            >
                              {String(val)}
                            </span>
                          ) : typeof val === 'number' ? (
                            <span style={{ display: 'inline-block', whiteSpace: 'nowrap', color: '#34d399', fontWeight: 600 }}>
                              {String(val)}
                            </span>
                          ) : (
                            <span
                              style={{
                                display: isLongText ? 'inline' : 'inline-block',
                                whiteSpace: isLongText ? 'normal' : 'nowrap',
                                color: '#cbd5e1'
                              }}
                            >
                              {String(val)}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* Action buttons */}
                    <td
                      style={{
                        padding: '12px 18px',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        background: 'var(--bg-card)',
                        position: 'sticky',
                        right: 0,
                        minWidth: '100px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => handleOpenEditModal(row)}
                          title="Edit row"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => setDeleteTarget(row)}
                          title="Delete row"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
            color: '#94a3b8'
          }}
        >
          <div>
            Showing <strong>{rows.length}</strong> of <strong>{data?.totalRows || 0}</strong> record(s) in{' '}
            <strong style={{ color: '#fff' }}>{tableName}</strong>
          </div>
          <div>All attributes rendered from database (Zero columns omitted)</div>
        </div>
      </div>

      {/* Insert Record Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Insert Record into ${tableName}`}
        maxWidth="680px"
      >
        <form onSubmit={handleSaveNewRow}>
          <div className="form-grid">
            {columns.map((col) => {
              const isAutoIncrement = col.isPk && col.type.includes('INT');
              return (
                <div
                  key={col.name}
                  className={`form-group ${col.type.includes('TEXT') && col.name.includes('address') ? 'form-grid-full' : ''}`}
                >
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      {col.name}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                      {col.type} {col.keyBadge ? `(${col.keyBadge})` : ''}
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={isAutoIncrement ? 'Auto-assigned if left blank' : `Enter ${col.name}`}
                    value={formData[col.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [col.name]: e.target.value })}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Inserting...' : 'Insert Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Record Modal */}
      {editingRow && (
        <Modal
          isOpen={true}
          onClose={() => setEditingRow(null)}
          title={`Edit Record in ${tableName}`}
          maxWidth="680px"
        >
          <form onSubmit={handleSaveEditRow}>
            <div className="form-grid">
              {columns.map((col) => {
                const isPk = col.isPk;
                return (
                  <div
                    key={col.name}
                    className={`form-group ${col.type.includes('TEXT') && col.name.includes('address') ? 'form-grid-full' : ''}`}
                  >
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        {col.name}
                      </span>
                      <span style={{ color: isPk ? '#fbbf24' : '#94a3b8', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                        {col.type} {col.keyBadge ? `(${col.keyBadge})` : ''}
                      </span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      disabled={isPk}
                      style={isPk ? { opacity: 0.6, cursor: 'not-allowed', background: '#070b14' } : {}}
                      value={formData[col.name] !== undefined ? formData[col.name] : ''}
                      onChange={(e) => setFormData({ ...formData, [col.name]: e.target.value })}
                    />
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditingRow(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete Record from ${tableName}`}
        message="Are you sure you want to permanently delete this row? If foreign key constraints reference this record in other tables, database constraints will protect the relationship and reject deletion."
        confirmText="Delete Record"
        isLoading={saving}
      />
    </div>
  );
}
