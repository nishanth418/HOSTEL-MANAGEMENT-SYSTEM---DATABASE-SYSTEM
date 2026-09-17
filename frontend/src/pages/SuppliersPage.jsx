import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Truck, Phone, Search } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../services/api';

const CATEGORIES = ['Groceries', 'Vegetables', 'Dairy', 'Furniture', 'Cleaning Supplies', 'Electrical', 'Plumbing', 'Stationery', 'Other'];

export default function SuppliersPage({ showToast }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteSupplierId, setDeleteSupplierId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    address: '',
    category: 'Groceries',
    phones: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSuppliers();
  }, [categoryFilter]);

  async function loadSuppliers() {
    try {
      setLoading(true);
      const res = await api.getSuppliers({
        search,
        category: categoryFilter
      });
      setSuppliers(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadSuppliers();
  }

  function openCreateModal() {
    setEditingSupplier(null);
    setFormData({
      name: '',
      company_name: '',
      email: '',
      address: '',
      category: 'Groceries',
      phones: ''
    });
    setErrors({});
    setIsModalOpen(true);
  }

  async function openEditModal(s) {
    try {
      const res = await api.getSupplier(s.supplier_id);
      const data = res.data;
      setEditingSupplier(data);
      setFormData({
        name: data.name,
        company_name: data.company_name,
        email: data.email,
        address: data.address,
        category: data.category,
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
    if (!formData.name.trim()) errs.name = 'Contact person name is required';
    if (!formData.company_name.trim()) errs.company_name = 'Company name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid email required';
    if (!formData.address.trim()) errs.address = 'Vendor address is required';
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
        company_name: formData.company_name,
        email: formData.email,
        address: formData.address,
        category: formData.category,
        phones: formData.phones ? formData.phones.split(',').map((p) => p.trim()).filter(Boolean) : []
      };

      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.supplier_id, payload);
        showToast('Supplier updated successfully', 'success');
      } else {
        await api.createSupplier(payload);
        showToast('Supplier registered successfully', 'success');
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setSaving(true);
      await api.deleteSupplier(deleteSupplierId);
      showToast('Supplier deleted successfully', 'success');
      setDeleteSupplierId(null);
      loadSuppliers();
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
          <h2>Vendor & Supplier Directory</h2>
          <p>Approved institutional suppliers, delivery categories, and procurement history</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Register Supplier
          </button>
        </div>
      </div>

      <div className="table-container">
        {/* Filters */}
        <div className="table-toolbar">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, flex: 1, flexWrap: 'wrap' }}>
            <div className="search-input-wrapper">
              <Search size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Search vendor company, contact name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

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

            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Company Name</th>
                <th>Contact Representative</th>
                <th>Supply Category</th>
                <th>Contact Phone</th>
                <th>Email</th>
                <th>Procured Orders</th>
                <th>Total Volume</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px 0' }}>
                    Loading suppliers...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.supplier_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>#{s.supplier_id}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{s.company_name}</td>
                    <td>{s.name}</td>
                    <td>
                      <span className="badge badge-info">{s.category}</span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                      {s.phone_numbers || 'No phone registered'}
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.84rem' }}>{s.email}</td>
                    <td>
                      <span className="badge badge-success">{s.total_orders || 0} Orders</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>
                      ₹{(s.total_procured_value || 0).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => openEditModal(s)}
                          title="Edit supplier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => setDeleteSupplierId(s.supplier_id)}
                          title="Delete supplier"
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
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.company_name}` : 'Register New Vendor'}
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Company / Business Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Khandelwal Agro Provisions"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
              {errors.company_name && <span className="form-error">{errors.company_name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Contact Person *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Full Name"
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
                placeholder="sales@vendor.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
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

            <div className="form-group form-grid-full">
              <label className="form-label">Phone Numbers (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91-11-27781100, +91-9811882233"
                value={formData.phones}
                onChange={(e) => setFormData({ ...formData, phones: e.target.value })}
              />
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Office / Warehouse Address *</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Shop number, Market, City..."
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
              {saving ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Register Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteSupplierId)}
        onClose={() => setDeleteSupplierId(null)}
        onConfirm={handleDelete}
        title="Delete Supplier Record"
        message="Are you sure you want to delete this supplier? If procurement orders exist for this vendor, deletion will be blocked by foreign key protection."
        confirmText="Confirm Delete"
        isLoading={saving}
      />
    </div>
  );
}
