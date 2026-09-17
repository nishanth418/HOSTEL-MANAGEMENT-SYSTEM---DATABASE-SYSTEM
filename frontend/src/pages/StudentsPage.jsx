import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Phone, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../services/api';

export default function StudentsPage({ showToast }) {
  const [students, setStudents] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [hostelFilter, setHostelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [deleteStudentId, setDeleteStudentId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    dob: '',
    gender: 'Male',
    blood_group: 'O+',
    guardian_name: '',
    guardian_phone: '',
    address: '',
    admission_date: new Date().toISOString().split('T')[0],
    room_id: '',
    status: 'Active',
    phones: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadData();
    loadHostelsAndRooms();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const res = await api.getStudents({
        search: searchTerm,
        hostel_id: hostelFilter,
        status: statusFilter
      });
      setStudents(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadHostelsAndRooms() {
    try {
      const [hRes, rRes] = await Promise.all([api.getHostels(), api.getRooms()]);
      setHostels(hRes.data);
      setRooms(rRes.data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleFilterSubmit(e) {
    e.preventDefault();
    loadData();
  }

  function openCreateModal() {
    setEditingStudent(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      dob: '2004-01-01',
      gender: 'Male',
      blood_group: 'O+',
      guardian_name: '',
      guardian_phone: '',
      address: '',
      admission_date: new Date().toISOString().split('T')[0],
      room_id: '',
      status: 'Active',
      phones: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  }

  async function openEditModal(student) {
    try {
      const res = await api.getStudent(student.student_id);
      const s = res.data;
      setEditingStudent(s);
      setFormData({
        first_name: s.first_name || '',
        last_name: s.last_name || '',
        email: s.email || '',
        dob: s.dob || '',
        gender: s.gender || 'Male',
        blood_group: s.blood_group || 'O+',
        guardian_name: s.guardian_name || '',
        guardian_phone: s.guardian_phone || '',
        address: s.address || '',
        admission_date: s.admission_date || '',
        room_id: s.room_id ? String(s.room_id) : '',
        status: s.status || 'Active',
        phones: s.phones ? s.phones.join(', ') : ''
      });
      setFormErrors({});
      setIsModalOpen(true);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function validateForm() {
    const errors = {};
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid email is required';
    if (!formData.dob) errors.dob = 'Date of birth is required';
    if (!formData.guardian_name.trim()) errors.guardian_name = 'Guardian name is required';
    if (!formData.guardian_phone.trim()) errors.guardian_phone = 'Guardian phone is required';
    if (!formData.address.trim()) errors.address = 'Permanent address is required';
    if (!formData.admission_date) errors.admission_date = 'Admission date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSaveStudent(e) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const payload = {
        ...formData,
        room_id: formData.room_id ? Number(formData.room_id) : null,
        phones: formData.phones
          ? formData.phones.split(',').map((p) => p.trim()).filter(Boolean)
          : []
      };

      if (editingStudent) {
        await api.updateStudent(editingStudent.student_id, payload);
        showToast('Student updated successfully', 'success');
      } else {
        await api.createStudent(payload);
        showToast('Student created successfully', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStudent() {
    try {
      setSaving(true);
      await api.deleteStudent(deleteStudentId);
      showToast('Student deleted successfully', 'success');
      setDeleteStudentId(null);
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
          <h2>Student Management</h2>
          <p>Student registry, room occupancy, guardian contact records</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Add New Student
          </button>
        </div>
      </div>

      <div className="table-container">
        {/* Filters Toolbar */}
        <div className="table-toolbar">
          <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: 12, flex: 1, flexWrap: 'wrap' }}>
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, email, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

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
              <option value="Alumni">Alumni</option>
              <option value="Suspended">Suspended</option>
            </select>

            <button type="submit" className="btn btn-secondary btn-sm">
              Apply Filter
            </button>
          </form>
        </div>

        {/* Students Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Hostel & Room</th>
                <th>Phones</th>
                <th>Guardian Info</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0' }}>
                    Loading students...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    No student records found matching the query.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.student_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{s.student_id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>
                        {s.first_name} {s.last_name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        {s.gender} • {s.blood_group || 'N/A'}
                      </div>
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{s.email}</td>
                    <td>
                      {s.room_number ? (
                        <div>
                          <span style={{ fontWeight: 600, color: '#38bdf8' }}>{s.room_number}</span>
                          <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>
                            {s.hostel_name} (Fl. {s.floor})
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#f59e0b', fontSize: '0.78rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                        {s.phone_numbers || 'No phone registered'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: '#fff' }}>{s.guardian_name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{s.guardian_phone}</div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          s.status === 'Active'
                            ? 'badge-success'
                            : s.status === 'Suspended'
                            ? 'badge-danger'
                            : 'badge-info'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => setViewingStudent(s)}
                          title="View full record"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => openEditModal(s)}
                          title="Edit student"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => setDeleteStudentId(s.student_id)}
                          title="Delete student"
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

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.first_name} ${editingStudent.last_name}` : 'Register New Student'}
        maxWidth="700px"
      >
        <form onSubmit={handleSaveStudent}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
              {formErrors.first_name && <span className="form-error">{formErrors.first_name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
              {formErrors.last_name && <span className="form-error">{formErrors.last_name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {formErrors.email && <span className="form-error">{formErrors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                className="form-input"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
              {formErrors.dob && <span className="form-error">{formErrors.dob}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
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
              <label className="form-label">Blood Group</label>
              <select
                className="form-select"
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Guardian Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.guardian_name}
                onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
              />
              {formErrors.guardian_name && <span className="form-error">{formErrors.guardian_name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Guardian Phone *</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91-9876543210"
                value={formData.guardian_phone}
                onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
              />
              {formErrors.guardian_phone && <span className="form-error">{formErrors.guardian_phone}</span>}
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Student Phone Numbers (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91-9011122233, +91-9011122234"
                value={formData.phones}
                onChange={(e) => setFormData({ ...formData, phones: e.target.value })}
              />
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Permanent Address *</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              {formErrors.address && <span className="form-error">{formErrors.address}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Room Allocation</label>
              <select
                className="form-select"
                value={formData.room_id}
                onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              >
                <option value="">No Room Assigned</option>
                {rooms.map((r) => (
                  <option key={r.room_id} value={r.room_id}>
                    {r.room_number} - {r.hostel_name} ({r.type_name}, Status: {r.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Admission Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.admission_date}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
              />
              {formErrors.admission_date && <span className="form-error">{formErrors.admission_date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Alumni">Alumni</option>
                <option value="Suspended">Suspended</option>
              </select>
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
              {saving ? 'Saving...' : editingStudent ? 'Update Student' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Student Record Modal */}
      {viewingStudent && (
        <Modal
          isOpen={true}
          onClose={() => setViewingStudent(null)}
          title={`Student Profile: ${viewingStudent.first_name} ${viewingStudent.last_name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>STUDENT ID</span>
                <p style={{ fontWeight: 600, color: '#fff' }}>#{viewingStudent.student_id}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>STATUS</span>
                <p>
                  <span className={`badge ${viewingStudent.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                    {viewingStudent.status}
                  </span>
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>EMAIL</span>
                <p style={{ color: '#fff' }}>{viewingStudent.email}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>GENDER & BLOOD GROUP</span>
                <p style={{ color: '#fff' }}>
                  {viewingStudent.gender} • {viewingStudent.blood_group || '-'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ASSIGNED ROOM</span>
                <p style={{ color: '#38bdf8', fontWeight: 600 }}>
                  {viewingStudent.room_number ? `${viewingStudent.room_number} (${viewingStudent.hostel_name})` : 'Unassigned'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ADMISSION DATE</span>
                <p style={{ color: '#fff' }}>{viewingStudent.admission_date}</p>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>CONTACT PHONES</span>
              <p style={{ color: '#fff' }}>{viewingStudent.phone_numbers || 'No phone registered'}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>GUARDIAN DETAILS</span>
              <p style={{ color: '#fff', fontWeight: 600 }}>{viewingStudent.guardian_name}</p>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem' }}>{viewingStudent.guardian_phone}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PERMANENT ADDRESS</span>
              <p style={{ color: '#cbd5e1', fontSize: '0.86rem' }}>{viewingStudent.address}</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <button className="btn btn-secondary" onClick={() => setViewingStudent(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteStudentId)}
        onClose={() => setDeleteStudentId(null)}
        onConfirm={handleDeleteStudent}
        title="Delete Student Record"
        message="Are you sure you want to delete this student? If payment records exist for this student, the foreign key safety check will block deletion."
        confirmText="Confirm Delete"
        isLoading={saving}
      />
    </div>
  );
}
