import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BedDouble, Filter } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../services/api';

export default function RoomsPage({ showToast }) {
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [hostelFilter, setHostelFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deleteRoomId, setDeleteRoomId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    room_number: '',
    hostel_id: '',
    type_id: '',
    floor: 1,
    status: 'Available'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
    loadMeta();
  }, [hostelFilter, typeFilter, statusFilter]);

  async function loadData() {
    try {
      setLoading(true);
      const res = await api.getRooms({
        hostel_id: hostelFilter,
        type_id: typeFilter,
        status: statusFilter
      });
      setRooms(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadMeta() {
    try {
      const [hRes, rtRes] = await Promise.all([api.getHostels(), api.getRoomTypes()]);
      setHostels(hRes.data);
      setRoomTypes(rtRes.data);
    } catch (err) {
      console.error(err);
    }
  }

  function openCreateModal() {
    setEditingRoom(null);
    setFormData({
      room_number: '',
      hostel_id: hostels[0]?.hostel_id ? String(hostels[0].hostel_id) : '',
      type_id: roomTypes[0]?.type_id ? String(roomTypes[0].type_id) : '',
      floor: 1,
      status: 'Available'
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function openEditModal(r) {
    setEditingRoom(r);
    setFormData({
      room_number: r.room_number,
      hostel_id: String(r.hostel_id),
      type_id: String(r.type_id),
      floor: r.floor,
      status: r.status
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function validate() {
    const errs = {};
    if (!formData.room_number.trim()) errs.room_number = 'Room number is required';
    if (!formData.hostel_id) errs.hostel_id = 'Hostel building is required';
    if (!formData.type_id) errs.type_id = 'Room type is required';
    if (formData.floor === undefined || formData.floor < 0) errs.floor = 'Valid floor number required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        room_number: formData.room_number,
        hostel_id: Number(formData.hostel_id),
        type_id: Number(formData.type_id),
        floor: Number(formData.floor),
        status: formData.status
      };

      if (editingRoom) {
        await api.updateRoom(editingRoom.room_id, payload);
        showToast('Room updated successfully', 'success');
      } else {
        await api.createRoom(payload);
        showToast('Room created successfully', 'success');
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
      await api.deleteRoom(deleteRoomId);
      showToast('Room deleted successfully', 'success');
      setDeleteRoomId(null);
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
          <h2>Room Directory</h2>
          <p>Rooms across hostels, floor distributions, capacities, and availability</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Add New Room
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Room Types</option>
              {roomTypes.map((t) => (
                <option key={t.type_id} value={t.type_id}>
                  {t.type_name}
                </option>
              ))}
            </select>

            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Room No.</th>
                <th>Hostel</th>
                <th>Floor</th>
                <th>Configuration</th>
                <th>Capacity</th>
                <th>Monthly Rent</th>
                <th>Occupancy Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0' }}>
                    Loading rooms...
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    No rooms found matching filters.
                  </td>
                </tr>
              ) : (
                rooms.map((r) => (
                  <tr key={r.room_id}>
                    <td style={{ fontWeight: 700, color: '#fff' }}>{r.room_number}</td>
                    <td style={{ color: '#cbd5e1' }}>{r.hostel_name}</td>
                    <td>Floor {r.floor}</td>
                    <td>{r.type_name}</td>
                    <td>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{r.capacity}</span> Bed{r.capacity > 1 ? 's' : ''}
                    </td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>₹{r.fee_per_month?.toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          r.status === 'Available'
                            ? 'badge-success'
                            : r.status === 'Occupied'
                            ? 'badge-info'
                            : 'badge-danger'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => openEditModal(r)}
                          title="Edit room"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => setDeleteRoomId(r.room_id)}
                          title="Delete room"
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

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? `Edit Room: ${editingRoom.room_number}` : 'Add New Room'}
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Room Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. A-105"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              />
              {errors.room_number && <span className="form-error">{errors.room_number}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Floor Number *</label>
              <input
                type="number"
                className="form-input"
                min="0"
                max="20"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              />
              {errors.floor && <span className="form-error">{errors.floor}</span>}
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Hostel Building *</label>
              <select
                className="form-select"
                value={formData.hostel_id}
                onChange={(e) => setFormData({ ...formData, hostel_id: e.target.value })}
              >
                <option value="">Select Hostel</option>
                {hostels.map((h) => (
                  <option key={h.hostel_id} value={h.hostel_id}>
                    {h.name} ({h.type})
                  </option>
                ))}
              </select>
              {errors.hostel_id && <span className="form-error">{errors.hostel_id}</span>}
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Room Type *</label>
              <select
                className="form-select"
                value={formData.type_id}
                onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
              >
                <option value="">Select Room Configuration</option>
                {roomTypes.map((t) => (
                  <option key={t.type_id} value={t.type_id}>
                    {t.type_name} - {t.capacity} Bed(s) (₹{t.fee_per_month}/mo)
                  </option>
                ))}
              </select>
              {errors.type_id && <span className="form-error">{errors.type_id}</span>}
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Room Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
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
              {saving ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteRoomId)}
        onClose={() => setDeleteRoomId(null)}
        onConfirm={handleDelete}
        title="Delete Room Record"
        message="Are you sure you want to delete this room? If students are currently assigned to it, the deletion will be rejected for safety."
        confirmText="Confirm Delete"
        isLoading={saving}
      />
    </div>
  );
}
