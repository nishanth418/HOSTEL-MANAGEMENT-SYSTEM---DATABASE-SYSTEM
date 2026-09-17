import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCheck, Filter } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../services/api';

const ROLES = ['Cook', 'Cleaner', 'Security', 'Electrician', 'Plumber', 'Supervisor', 'Administrator', 'Other'];

export default function StaffPage({ showToast }) {
  const [staffList, setStaffList] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [messList, setMessList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [hostelFilter, setHostelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteStaffId, setDeleteStaffId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Cook',
    salary: 22000,
    hostel_id: '',
    mess_id: '',
    join_date: new Date().toISOString().split('T')[0],
    status: 'Active',
    phones: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadStaff();
  }, [roleFilter, hostelFilter, statusFilter]);

  async function loadMeta() {
    try {
      const [hRes, mRes] = await Promise.all([api.getHostels(), api.getMess()]);
      setHostels(hRes.data);
      setMessList(mRes.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadStaff() {
    try {
      setLoading(true);
      const res = await api.getStaff({
        role: roleFilter,
        hostel_id: hostelFilter,
        status: statusFilter
      });
      setStaffList(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingStaff(null);
    setFormData({
      name: '',
      role: 'Cook',
      salary: 22000,
      hostel_id: hostels[0]?.hostel_id ? String(hostels[0].hostel_id) : '',
      mess_id: '',
      join_date: new Date().toISOString().split('T')[0],
      status: 'Active',
      phones: ''
    });
    setErrors({});
    setIsModalOpen(true);
  }

  async function openEditModal(st) {
    try {
      const res = await api.getStaffById(st.staff_id);
      const data = res.data;
      setEditingStaff(data);
      setFormData({
        name: data.name,
        role: data.role,
        salary: data.salary,
        hostel_id: data.hostel_id ? String(data.hostel_id) : '',
        mess_id: data.mess_id ? String(data.mess_id) : '',
        join_date: data.join_date,
        status: data.status,
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
    if (!formData.name.trim()) errs.name = 'Staff name is required';
    if (!formData.role) errs.role = 'Staff role is required';
    if (formData.salary === undefined || formData.salary < 0) errs.salary = 'Valid salary required';
    if (!formData.join_date) errs.join_date = 'Join date is required';
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
        role: formData.role,
        salary: Number(formData.salary),
        hostel_id: formData.hostel_id ? Number(formData.hostel_id) : null,
        mess_id: formData.mess_id ? Number(formData.mess_id) : null,
        join_date: formData.join_date,
        status: formData.status,
        phones: formData.phones ? formData.phones.split(',').map((p) => p.trim()).filter(Boolean) : []
      };

      if (editingStaff) {
        await api.updateStaff(editingStaff.staff_id, payload);
        showToast('Staff member updated successfully', 'success');
      } else {
        await api.createStaff(payload);
        showToast('Staff registered successfully', 'success');
      }
      setIsModalOpen(false);
      loadStaff();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setSaving(true);
      await api.deleteStaff(deleteStaffId);
      showToast('Staff deleted successfully', 'success');
      setDeleteStaffId(null);
      loadStaff();
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
          <h2>Staff Registry</h2>
          <p>Hostel and mess support personnel, duty roles, salaries, and phone contacts</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Register Staff
          </button>
        </div>
      </div>

      <div className="table-container">
        {/* Filters */}
        <div className="table-toolbar">
          <div className="table-filter-group">
            <Filter size={16} color="#94a3b8" />
            <select
              className="select-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <select
              className="select-filter"
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
            >
              <option value="">All Hostels</option>
              {hostels.map((h) => (
                <option key={h.hostel_id} value={h.hostel_id}>
                  {h.name}
                </option>
              ))}
            </select>

            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Resigned">Resigned</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Staff Name</th>
                <th>Designation Role</th>
                <th>Assigned Facility</th>
                <th>Phone Contacts</th>
                <th>Monthly Salary</th>
                <th>Join Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px 0' }}>
                    Loading staff records...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    No staff records found.
                  </td>
                </tr>
              ) : (
                staffList.map((st) => (
                  <tr key={st.staff_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{st.staff_id}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{st.name}</td>
                    <td>
                      <span className="badge badge-info">{st.role}</span>
                    </td>
                    <td>
                      {st.hostel_name && <div>{st.hostel_name}</div>}
                      {st.mess_name && <div style={{ fontSize: '0.74rem', color: '#38bdf8' }}>{st.mess_name}</div>}
                      {!st.hostel_name && !st.mess_name && <span style={{ color: '#94a3b8' }}>Unassigned</span>}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      {st.phone_numbers || 'No phone registered'}
                    </td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>₹{st.salary?.toLocaleString()}</td>
                    <td>{st.join_date}</td>
                    <td>
                      <span
                        className={`badge ${
                          st.status === 'Active'
                            ? 'badge-success'
                            : st.status === 'On Leave'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => openEditModal(st)}
                          title="Edit staff"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => setDeleteStaffId(st.staff_id)}
                          title="Delete staff"
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
        title={editingStaff ? `Edit Staff: ${editingStaff.name}` : 'Register Staff Member'}
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group form-grid-full">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Role / Designation *</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
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
              <label className="form-label">Assigned Hostel</label>
              <select
                className="form-select"
                value={formData.hostel_id}
                onChange={(e) => setFormData({ ...formData, hostel_id: e.target.value })}
              >
                <option value="">No Hostel Assigned</option>
                {hostels.map((h) => (
                  <option key={h.hostel_id} value={h.hostel_id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Mess</label>
              <select
                className="form-select"
                value={formData.mess_id}
                onChange={(e) => setFormData({ ...formData, mess_id: e.target.value })}
              >
                <option value="">No Mess Assigned</option>
                {messList.map((m) => (
                  <option key={m.mess_id} value={m.mess_id}>
                    {m.mess_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date of Joining *</label>
              <input
                type="date"
                className="form-input"
                value={formData.join_date}
                onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
              />
              {errors.join_date && <span className="form-error">{errors.join_date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Employment Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Phone Numbers (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91-9711012345, +91-9711012346"
                value={formData.phones}
                onChange={(e) => setFormData({ ...formData, phones: e.target.value })}
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
              {saving ? 'Saving...' : editingStaff ? 'Update Staff' : 'Register Staff'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteStaffId)}
        onClose={() => setDeleteStaffId(null)}
        onConfirm={handleDelete}
        title="Delete Staff Record"
        message="Are you sure you want to delete this staff member? Contact phone records will be removed."
        confirmText="Confirm Delete"
        isLoading={saving}
      />
    </div>
  );
}
