import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CalendarDays, Filter, Clock } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

export default function MealsPage({ showToast }) {
  const [meals, setMeals] = useState([]);
  const [messList, setMessList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [messFilter, setMessFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [deleteMealId, setDeleteMealId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    mess_id: '',
    day_of_week: 'Monday',
    meal_type: 'Breakfast',
    menu_description: '',
    start_time: '07:30',
    end_time: '09:30'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadMessList();
  }, []);

  useEffect(() => {
    loadMeals();
  }, [messFilter, dayFilter, typeFilter]);

  async function loadMessList() {
    try {
      const res = await api.getMess();
      setMessList(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadMeals() {
    try {
      setLoading(true);
      const res = await api.getMeals({
        mess_id: messFilter,
        day_of_week: dayFilter,
        meal_type: typeFilter
      });
      setMeals(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingMeal(null);
    setFormData({
      mess_id: messList[0]?.mess_id ? String(messList[0].mess_id) : '',
      day_of_week: dayFilter || 'Monday',
      meal_type: typeFilter || 'Breakfast',
      menu_description: '',
      start_time: '07:30',
      end_time: '09:30'
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function openEditModal(m) {
    setEditingMeal(m);
    setFormData({
      mess_id: String(m.mess_id),
      day_of_week: m.day_of_week,
      meal_type: m.meal_type,
      menu_description: m.menu_description,
      start_time: m.start_time,
      end_time: m.end_time
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function validate() {
    const errs = {};
    if (!formData.mess_id) errs.mess_id = 'Mess facility is required';
    if (!formData.menu_description.trim()) errs.menu_description = 'Menu description is required';
    if (!formData.start_time) errs.start_time = 'Start time is required';
    if (!formData.end_time) errs.end_time = 'End time is required';
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
        mess_id: Number(formData.mess_id)
      };

      if (editingMeal) {
        await api.updateMeal(editingMeal.meal_id, payload);
        showToast('Meal schedule updated', 'success');
      } else {
        await api.createMeal(payload);
        showToast('Meal scheduled successfully', 'success');
      }
      setIsModalOpen(false);
      loadMeals();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setSaving(true);
      await api.deleteMeal(deleteMealId);
      showToast('Meal schedule deleted', 'success');
      setDeleteMealId(null);
      loadMeals();
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
          <h2>Weekly Meal Timetable</h2>
          <p>Schedule dining menus, service hours, and nutritional offerings per mess facility</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Schedule Meal
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
              value={messFilter}
              onChange={(e) => setMessFilter(e.target.value)}
            >
              <option value="">All Mess Halls</option>
              {messList.map((m) => (
                <option key={m.mess_id} value={m.mess_id}>
                  {m.mess_name}
                </option>
              ))}
            </select>

            <select
              className="select-filter"
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
            >
              <option value="">All Days of Week</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              className="select-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Meal Types</option>
              {MEAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Meal Type</th>
                <th>Timing</th>
                <th>Mess Facility</th>
                <th>Menu & Delicacies</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0' }}>
                    Loading meal timetable...
                  </td>
                </tr>
              ) : meals.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    No meals scheduled for the selected filters.
                  </td>
                </tr>
              ) : (
                meals.map((m) => (
                  <tr key={m.meal_id}>
                    <td>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{m.day_of_week}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          m.meal_type === 'Breakfast'
                            ? 'badge-warning'
                            : m.meal_type === 'Lunch'
                            ? 'badge-success'
                            : m.meal_type === 'Snacks'
                            ? 'badge-info'
                            : 'badge-danger'
                        }`}
                      >
                        {m.meal_type}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1', fontSize: '0.84rem' }}>
                        <Clock size={14} color="#94a3b8" />
                        {m.start_time} - {m.end_time}
                      </div>
                    </td>
                    <td style={{ color: '#fff', fontWeight: 500 }}>{m.mess_name}</td>
                    <td style={{ maxWidth: 360, color: '#cbd5e1' }}>{m.menu_description}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => openEditModal(m)}
                          title="Edit meal"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => setDeleteMealId(m.meal_id)}
                          title="Delete meal"
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
        title={editingMeal ? 'Edit Scheduled Meal' : 'Schedule New Meal'}
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group form-grid-full">
              <label className="form-label">Mess Facility *</label>
              <select
                className="form-select"
                value={formData.mess_id}
                onChange={(e) => setFormData({ ...formData, mess_id: e.target.value })}
              >
                <option value="">Select Mess Hall</option>
                {messList.map((m) => (
                  <option key={m.mess_id} value={m.mess_id}>
                    {m.mess_name} ({m.type})
                  </option>
                ))}
              </select>
              {errors.mess_id && <span className="form-error">{errors.mess_id}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Day of Week *</label>
              <select
                className="form-select"
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Meal Type *</label>
              <select
                className="form-select"
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
              >
                {MEAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input
                type="time"
                className="form-input"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
              {errors.start_time && <span className="form-error">{errors.start_time}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input
                type="time"
                className="form-input"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
              {errors.end_time && <span className="form-error">{errors.end_time}</span>}
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Menu Description & Items *</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="e.g. Idli, Sambar, Coconut Chutney, Tea & Coffee..."
                value={formData.menu_description}
                onChange={(e) => setFormData({ ...formData, menu_description: e.target.value })}
              />
              {errors.menu_description && <span className="form-error">{errors.menu_description}</span>}
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
              {saving ? 'Saving...' : editingMeal ? 'Update Schedule' : 'Schedule Meal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteMealId)}
        onClose={() => setDeleteMealId(null)}
        onConfirm={handleDelete}
        title="Delete Scheduled Meal"
        message="Are you sure you want to remove this meal from the weekly schedule?"
        confirmText="Confirm Delete"
        isLoading={saving}
      />
    </div>
  );
}
