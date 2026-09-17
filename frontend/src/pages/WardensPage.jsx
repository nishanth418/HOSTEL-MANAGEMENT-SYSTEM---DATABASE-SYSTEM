import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShieldCheck, Phone } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../services/api';

export default function WardensPage({ showToast }) {
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarden, setEditingWarden] = useState(null);
  const [deleteWardenId, setDeleteWardenId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: 'Male',
    address: '',
    join_date: new Date().toISOString().split('T')[0],
    salary: 70000,
    phones: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const res = await api.getWardens();
      setWardens(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingWarden(null);
    setFormData({
      name: '',
      email: '',
      gender: 'Male',
      address: '',
      join_date: new Date().toISOString().split('T')[0],
      salary: 70000,
      phones: ''
    });
    setErrors({});
    setIsModalOpen(true);
  }

  async function openEditModal(w) {
    try {
      const res = await api.getWarden(w.warden_id);
      const data = res.data;
      setEditingWarden(data);
      setFormData({
        name: data.name,
        email: data.email,
        gender: data.gender || 'Male',
        address: data.address || '',
        join_date: data.join_date,
        salary: data.salary,
        phones: data.phones ? data.phones.join(', ') : ''
      });
      setErrors({});
      setIsModalOpen(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function validate() {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Warden name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid email required';
    if (!formData.join_date) errs.join_date = 'Join date is required';
    if (formData.salary === undefined || formData.salary < 0) errs.salary = 'Valid salary required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        gender: formData.gender,
        address: formData.address,
        join_date: formData.join_date,
        salary: Number(formData.salary),
        phones: formData.phones ? formData.phones.split(',').map((p) => p.trim()).filter(Boolean) : []
      };

      if (editingWarden) {
        await api.updateWarden(editingWarden.warden_id, payload);
        showToast('Warden updated successfully', 'success');
      } else {
        await api.createWarden(payload);
        showToast('Warden created successfully', 'success');
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
      await api.deleteWarden(deleteWardenId);
      showToast('Warden deleted successfully', 'success');
      setDeleteWardenId(null);
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
          <h2>Warden Administration</h2>
          <p>Supervising wardens, contact phone directories, and hostel allocations</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Add New Warden
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Warden Name</th>
                <th>Email</th>
                <th>Assigned Hostel</th>
                <th>Contact Phones</th>
                <th>Monthly Salary</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0' }}>
                    Loading wardens...
                  </td>
                </tr>
              ) : wardens.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    No wardens found.
                  </td>
                </tr>
              ) : (
                wardens.map((w) => (
                  <tr key={w.warden_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{w.warden_id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{w.name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{w.gender}</div>
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{w.email}</td>
                    <td>
                      {w.hostel_name ? (
                        <span className="badge badge-info">{w.hostel_name}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Not assigned</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: '#fff' }}>
                        {w.phone_numbers || 'No phone registered'}
                      </div>
                    </td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>₹{w.salary?.toLocaleString()}</td>
                    <td style={{ whiteSpace: 'nowrap', minWidth: '120px', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>{w.join_date}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => openEditModal(w)}
                          title="Edit warden"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => setDeleteWardenId(w.warden_id)}
                          title="Delete warden"
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarden ? `Edit Warden: ${editingWarden.name}` : 'Register New Warden'}
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group form-grid-full">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Dr. Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="warden@hostelhub.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Salary (₹) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
              {errors.salary && <span className="form-error">{errors.salary}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Join Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.join_date}
                onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
              />
              {errors.join_date && <span className="form-error">{errors.join_date}</span>}
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Phone Numbers (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91-9811223344, +91-9811223345"
                value={formData.phones}
                onChange={(e) => setFormData({ ...formData, phones: e.target.value })}
              />
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Residential Address</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Quarter Number, Campus..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              {saving ? 'Saving...' : editingWarden ? 'Update Warden' : 'Create Warden'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteWardenId)}
        onClose={() => setDeleteWardenId(null)}
        onConfirm={handleDelete}
        title="Delete Warden Record"
        message="Are you sure you want to delete this warden? If assigned to a hostel, the hostel's warden link will be safely set to NULL."
        confirmText="Confirm Delete"
        isLoading={saving}
      />
    </div>
  );
}
