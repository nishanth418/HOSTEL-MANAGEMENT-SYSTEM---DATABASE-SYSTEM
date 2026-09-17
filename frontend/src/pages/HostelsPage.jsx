import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Eye } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../services/api';

export default function HostelsPage({ showToast }) {
  const [hostels, setHostels] = useState([]);
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const [deleteHostelId, setDeleteHostelId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Boys',
    total_floors: 3,
    warden_id: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [hRes, wRes] = await Promise.all([api.getHostels(), api.getWardens()]);
      setHostels(hRes.data);
      setWardens(wRes.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingHostel(null);
    setFormData({
      name: '',
      type: 'Boys',
      total_floors: 3,
      warden_id: '',
      address: ''
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function openEditModal(h) {
    setEditingHostel(h);
    setFormData({
      name: h.name,
      type: h.type,
      total_floors: h.total_floors,
      warden_id: h.warden_id ? String(h.warden_id) : '',
      address: h.address
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function validate() {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Hostel name is required';
    if (!formData.total_floors || formData.total_floors <= 0) errs.total_floors = 'Total floors must be at least 1';
    if (!formData.address.trim()) errs.address = 'Campus location address is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        ...formData,
        total_floors: Number(formData.total_floors),
        warden_id: formData.warden_id ? Number(formData.warden_id) : null
      };

      if (editingHostel) {
        await api.updateHostel(editingHostel.hostel_id, payload);
        showToast('Hostel updated successfully', 'success');
      } else {
        await api.createHostel(payload);
        showToast('Hostel created successfully', 'success');
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
      await api.deleteHostel(deleteHostelId);
      showToast('Hostel deleted successfully', 'success');
      setDeleteHostelId(null);
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
          <h2>Hostel Buildings</h2>
          <p>Hostel blocks, floor plans, resident capacity, and warden assignments</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Add New Hostel
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hostel Name</th>
                <th>Type</th>
                <th>Floors</th>
                <th>Warden</th>
                <th>Rooms</th>
                <th>Capacity</th>
                <th>Location</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px 0' }}>
                    Loading hostels...
                  </td>
                </tr>
              ) : hostels.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    No hostels found in database.
                  </td>
                </tr>
              ) : (
                hostels.map((h) => (
                  <tr key={h.hostel_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{h.hostel_id}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{h.name}</td>
                    <td>
                      <span className={`badge ${h.type === 'Boys' ? 'badge-info' : h.type === 'Girls' ? 'badge-warning' : 'badge-success'}`}>
                        {h.type}
                      </span>
                    </td>
                    <td>{h.total_floors} Floors</td>
                    <td>
                      {h.warden_name ? (
                        <div>
                          <div style={{ color: '#fff', fontWeight: 500 }}>{h.warden_name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{h.warden_email}</div>
                        </div>
                      ) : (
                        <span style={{ color: '#f59e0b', fontSize: '0.78rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{h.occupied_rooms || 0}</span>
                      <span style={{ color: '#94a3b8' }}> / {h.total_rooms || 0}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#10b981' }}>{h.total_capacity || 0} Beds</td>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: 220 }}>{h.address}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => openEditModal(h)}
                          title="Edit hostel"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => setDeleteHostelId(h.hostel_id)}
                          title="Delete hostel"
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

      {/* Add / Edit Hostel Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHostel ? `Edit Hostel: ${editingHostel.name}` : 'Create New Hostel Building'}
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group form-grid-full">
              <label className="form-label">Hostel Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Aryabhata Boys Hostel"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Resident Type *</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-ed">Co-ed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Floors *</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="20"
                value={formData.total_floors}
                onChange={(e) => setFormData({ ...formData, total_floors: e.target.value })}
              />
              {errors.total_floors && <span className="form-error">{errors.total_floors}</span>}
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Supervising Warden</label>
              <select
                className="form-select"
                value={formData.warden_id}
                onChange={(e) => setFormData({ ...formData, warden_id: e.target.value })}
              >
                <option value="">No Warden Assigned</option>
                {wardens.map((w) => (
                  <option key={w.warden_id} value={w.warden_id}>
                    {w.name} ({w.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Address & Campus Location *</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Block, Campus Sector, City..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              {errors.address && <span className="form-error">{errors.address}</span>}
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
              {saving ? 'Saving...' : editingHostel ? 'Update Hostel' : 'Create Hostel'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteHostelId)}
        onClose={() => setDeleteHostelId(null)}
        onConfirm={handleDelete}
        title="Delete Hostel Building"
        message="Are you sure you want to delete this hostel? You cannot delete a hostel if it still has rooms assigned to it (Foreign Key Protection)."
        confirmText="Confirm Delete"
        isLoading={saving}
      />
    </div>
  );
}
