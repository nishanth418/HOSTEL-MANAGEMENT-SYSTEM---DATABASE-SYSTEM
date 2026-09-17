import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Boxes, AlertTriangle, Filter } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../services/api';

const CATEGORIES = ['Food & Provisions', 'Cleaning', 'Furniture', 'Electronics & Lighting', 'Plumbing', 'Bedding', 'Other'];
const UNITS = ['kg', 'litres', 'pieces', 'boxes', 'packets', 'bundles'];

export default function InventoryPage({ showToast }) {
  const [items, setItems] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    item_name: '',
    category: 'Food & Provisions',
    quantity: 100,
    unit: 'kg',
    min_required_quantity: 20,
    hostel_id: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadHostels();
  }, []);

  useEffect(() => {
    loadInventory();
  }, [categoryFilter, lowStockOnly]);

  async function loadHostels() {
    try {
      const res = await api.getHostels();
      setHostels(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadInventory() {
    try {
      setLoading(true);
      const res = await api.getInventory({
        category: categoryFilter,
        low_stock: lowStockOnly ? 'true' : ''
      });
      setItems(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingItem(null);
    setFormData({
      item_name: '',
      category: 'Food & Provisions',
      quantity: 100,
      unit: 'kg',
      min_required_quantity: 20,
      hostel_id: hostels[0]?.hostel_id ? String(hostels[0].hostel_id) : ''
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      min_required_quantity: item.min_required_quantity,
      hostel_id: item.hostel_id ? String(item.hostel_id) : ''
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function validate() {
    const errs = {};
    if (!formData.item_name.trim()) errs.item_name = 'Item name is required';
    if (formData.quantity === undefined || formData.quantity < 0) errs.quantity = 'Valid stock quantity required';
    if (formData.min_required_quantity === undefined || formData.min_required_quantity < 0) {
      errs.min_required_quantity = 'Valid minimum threshold required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        item_name: formData.item_name,
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        min_required_quantity: Number(formData.min_required_quantity),
        hostel_id: formData.hostel_id ? Number(formData.hostel_id) : null
      };

      if (editingItem) {
        await api.updateInventoryItem(editingItem.item_id, payload);
        showToast('Item updated successfully', 'success');
      } else {
        await api.createInventoryItem(payload);
        showToast('Inventory item added successfully', 'success');
      }
      setIsModalOpen(false);
      loadInventory();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setSaving(true);
      await api.deleteInventoryItem(deleteItemId);
      showToast('Inventory item deleted', 'success');
      setDeleteItemId(null);
      loadInventory();
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
          <h2>Inventory & Provisions</h2>
          <p>Real-time campus supply stock, re-order thresholds, and hostel assignments</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Add Inventory Item
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: '#cbd5e1', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
              />
              Show Low Stock Items Only
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min. Threshold</th>
                <th>Assigned Hostel</th>
                <th>Stock Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0' }}>
                    Loading inventory...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                items.map((i) => {
                  const isLow = i.quantity <= i.min_required_quantity;
                  return (
                    <tr key={i.item_id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{i.item_id}</td>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{i.item_name}</td>
                      <td>{i.category}</td>
                      <td style={{ fontWeight: 700, color: isLow ? '#f87171' : '#10b981' }}>
                        {i.quantity} {i.unit}
                      </td>
                      <td style={{ color: '#94a3b8' }}>
                        {i.min_required_quantity} {i.unit}
                      </td>
                      <td>{i.hostel_name || 'Central Store'}</td>
                      <td>
                        {isLow ? (
                          <span className="badge badge-danger">
                            <AlertTriangle size={12} />
                            Re-order Needed
                          </span>
                        ) : (
                          <span className="badge badge-success">Adequate</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            onClick={() => openEditModal(i)}
                            title="Edit item"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-icon btn-sm"
                            onClick={() => setDeleteItemId(i.item_id)}
                            title="Delete item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Item: ${editingItem.item_name}` : 'Add Inventory Item'}
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group form-grid-full">
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Basmati Rice or LED Tube Light"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              />
              {errors.item_name && <span className="form-error">{errors.item_name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Measurement Unit *</label>
              <select
                className="form-select"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Initial / Current Stock *</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
              {errors.quantity && <span className="form-error">{errors.quantity}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Min. Safety Stock Threshold *</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={formData.min_required_quantity}
                onChange={(e) => setFormData({ ...formData, min_required_quantity: e.target.value })}
              />
              {errors.min_required_quantity && <span className="form-error">{errors.min_required_quantity}</span>}
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Storage Location / Hostel</label>
              <select
                className="form-select"
                value={formData.hostel_id}
                onChange={(e) => setFormData({ ...formData, hostel_id: e.target.value })}
              >
                <option value="">Central Campus Warehouse</option>
                {hostels.map((h) => (
                  <option key={h.hostel_id} value={h.hostel_id}>
                    {h.name}
                  </option>
                ))}
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
              {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteItemId)}
        onClose={() => setDeleteItemId(null)}
        onConfirm={handleDelete}
        title="Delete Inventory Item"
        message="Are you sure you want to delete this inventory item? If any procurement records reference it, the action will be blocked by foreign key protection."
        confirmText="Confirm Delete"
        isLoading={saving}
      />
    </div>
  );
}
