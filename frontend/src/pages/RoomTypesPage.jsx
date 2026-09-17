import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../services/api';

export default function RoomTypesPage({ showToast }) {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [deleteTypeId, setDeleteTypeId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    type_name: '',
    capacity: 1,
    fee_per_month: 5000,
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const res = await api.getRoomTypes();
      setTypes(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingType(null);
    setFormData({
      type_name: '',
      capacity: 1,
      fee_per_month: 5000,
      description: ''
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function openEditModal(t) {
    setEditingType(t);
    setFormData({
      type_name: t.type_name,
      capacity: t.capacity,
      fee_per_month: t.fee_per_month,
      description: t.description || ''
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function validate() {
    const errs = {};
    if (!formData.type_name.trim()) errs.type_name = 'Room type name is required';
    if (!formData.capacity || formData.capacity <= 0) errs.capacity = 'Capacity must be at least 1';
    if (formData.fee_per_month === undefined || formData.fee_per_month < 0) errs.fee_per_month = 'Valid fee required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        type_name: formData.type_name,
        capacity: Number(formData.capacity),
        fee_per_month: Number(formData.fee_per_month),
        description: formData.description
      };

      if (editingType) {
        await api.updateRoomType(editingType.type_id, payload);
        showToast('Room type updated successfully', 'success');
      } else {
        await api.createRoomType(payload);
        showToast('Room type created successfully', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setSaving(true);
      await api.deleteRoomType(deleteTypeId);
      showToast('Room type deleted successfully', 'success');
      setDeleteTypeId(null);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-title">
          <h2>Room Configurations & Fees</h2>
          <p>Define standard room classifications, occupancy limits, and monthly fee pricing</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Add Room Type
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Configuration Name</th>
                <th>Bed Capacity</th>
                <th>Monthly Rent</th>
                <th>Rooms Configured</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0' }}>
                    Loading room configurations...
                  </td>
                </tr>
              ) : types.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    No room types configured.
                  </td>
                </tr>
              ) : (
                types.map((t) => (
                  <tr key={t.type_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{t.type_id}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{t.type_name}</td>
                    <td>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{t.capacity}</span> Person(s)
                    </td>
                    <td style={{ color: '#10b981', fontWeight: 700, fontSize: '0.92rem' }}>
                      ₹{t.fee_per_month.toLocaleString()} / mo
                    </td>
                    <td>
                      <span className="badge badge-info">{t.total_rooms_configured || 0} Rooms</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: 280 }}>
                      {t.description || '-'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => openEditModal(t)}
                          title="Edit configuration"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => setDeleteTypeId(t.type_id)}
                          title="Delete configuration"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingType ? `Edit Configuration: ${editingType.type_name}` : 'Create Room Configuration'}
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group form-grid-full">
              <label className="form-label">Configuration Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Single Occupancy (AC)"
                value={formData.type_name}
                onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
              />
              {errors.type_name && <span className="form-error">{errors.type_name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Bed Capacity *</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="10"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
              {errors.capacity && <span className="form-error">{errors.capacity}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Rent (₹) *</label>
              <input
                type="number"
                className="form-input"
                min="0"
                step="100"
                value={formData.fee_per_month}
                onChange={(e) => setFormData({ ...formData, fee_per_month: e.target.value })}
              />
              {errors.fee_per_month && <span className="form-error">{errors.fee_per_month}</span>}
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Description & Amenities</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Amenities included, study desk, AC, attached bathroom..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingType ? 'Update Configuration' : 'Create Configuration'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTypeId)}
        onClose={() => setDeleteTypeId(null)}
        onConfirm={handleDelete}
        title="Delete Room Configuration"
        message="Are you sure you want to delete this room type? If any rooms are currently configured with this type, database constraints will prevent deletion."
        confirmText="Confirm Delete"
        isLoading={saving}
      />
    </div>
  );
}
