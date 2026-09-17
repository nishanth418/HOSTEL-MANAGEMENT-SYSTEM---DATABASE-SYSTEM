import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Utensils, Phone } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../services/api';

export default function MessPage({ showToast }) {
  const [messList, setMessList] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMess, setEditingMess] = useState(null);
  const [deleteMessId, setDeleteMessId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    mess_name: '',
    hostel_id: '',
    capacity: 300,
    type: 'Both',
    contacts: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [mRes, hRes] = await Promise.all([api.getMess(), api.getHostels()]);
      setMessList(mRes.data);
      setHostels(hRes.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingMess(null);
    setFormData({
      mess_name: '',
      hostel_id: hostels[0]?.hostel_id ? String(hostels[0].hostel_id) : '',
      capacity: 300,
      type: 'Both',
      contacts: ''
    });
    setErrors({});
    setIsModalOpen(true);
  }

  async function openEditModal(m) {
    try {
      const res = await api.getMessById(m.mess_id);
      const data = res.data;
      setEditingMess(data);
      setFormData({
        mess_name: data.mess_name,
        hostel_id: data.hostel_id ? String(data.hostel_id) : '',
        capacity: data.capacity,
        type: data.type,
        contacts: data.contacts ? data.contacts.join(', ') : ''
      });
      setErrors({});
      setIsModalOpen(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function validate() {
    const errs = {};
    if (!formData.mess_name.trim()) errs.mess_name = 'Mess hall name is required';
    if (!formData.capacity || formData.capacity <= 0) errs.capacity = 'Capacity must be at least 1';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        mess_name: formData.mess_name,
        hostel_id: formData.hostel_id ? Number(formData.hostel_id) : null,
        capacity: Number(formData.capacity),
        type: formData.type,
        contacts: formData.contacts ? formData.contacts.split(',').map((c) => c.trim()).filter(Boolean) : []
      };

      if (editingMess) {
        await api.updateMess(editingMess.mess_id, payload);
        showToast('Mess updated successfully', 'success');
      } else {
        await api.createMess(payload);
        showToast('Mess created successfully', 'success');
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
      await api.deleteMess(deleteMessId);
      showToast('Mess deleted successfully', 'success');
      setDeleteMessId(null);
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
          <h2>Mess Halls & Dining Facilities</h2>
          <p>Mess dining halls, dietary plans, contact hotlines, and kitchen assignments</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Add New Mess
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mess Name</th>
                <th>Dietary Type</th>
                <th>Seating Capacity</th>
                <th>Associated Hostel</th>
                <th>Contact Hotline</th>
                <th>Staff Active</th>
                <th>Scheduled Meals</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px 0' }}>
                    Loading mess facilities...
                  </td>
                </tr>
              ) : messList.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    No mess facilities registered.
                  </td>
                </tr>
              ) : (
                messList.map((m) => (
                  <tr key={m.mess_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{m.mess_id}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{m.mess_name}</td>
                    <td>
                      <span className={`badge ${m.type === 'Veg' ? 'badge-success' : m.type === 'Non-Veg' ? 'badge-danger' : 'badge-info'}`}>
                        {m.type}
                      </span>
                    </td>
                    <td>{m.capacity} Seats</td>
                    <td>{m.hostel_name || 'Central Facility'}</td>
                    <td style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      {m.contact_numbers || 'No direct phone'}
                    </td>
                    <td>
                      <span className="badge badge-warning">{m.staff_count || 0} Staff</span>
                    </td>
                    <td>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{m.total_meals_scheduled || 0} Meals</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => openEditModal(m)}
                          title="Edit mess"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => setDeleteMessId(m.mess_id)}
                          title="Delete mess"
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
        title={editingMess ? `Edit Mess: ${editingMess.mess_name}` : 'Register New Dining Facility'}
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group form-grid-full">
              <label className="form-label">Mess Facility Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Annapoorna North Dining"
                value={formData.mess_name}
                onChange={(e) => setFormData({ ...formData, mess_name: e.target.value })}
              />
              {errors.mess_name && <span className="form-error">{errors.mess_name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Dietary Provision *</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Both">Both (Veg & Non-Veg)</option>
                <option value="Veg">Pure Vegetarian</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Special">Special Diet</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Dining Capacity (Seats) *</label>
              <input
                type="number"
                className="form-input"
                min="10"
                step="10"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
              {errors.capacity && <span className="form-error">{errors.capacity}</span>}
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Associated Hostel Building</label>
              <select
                className="form-select"
                value={formData.hostel_id}
                onChange={(e) => setFormData({ ...formData, hostel_id: e.target.value })}
              >
                <option value="">Campus Central Mess (No specific hostel)</option>
                {hostels.map((h) => (
                  <option key={h.hostel_id} value={h.hostel_id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Contact Numbers (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91-11-27891001, +91-9811002233"
                value={formData.contacts}
                onChange={(e) => setFormData({ ...formData, contacts: e.target.value })}
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
              {saving ? 'Saving...' : editingMess ? 'Update Mess' : 'Create Mess'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteMessId)}
        onClose={() => setDeleteMessId(null)}
        onConfirm={handleDelete}
        title="Delete Mess Facility"
        message="Are you sure you want to delete this mess facility? Associated meal schedules and contacts will be removed, and staff assignments will be reset."
        confirmText="Confirm Delete"
        isLoading={saving}
      />
    </div>
  );
}
