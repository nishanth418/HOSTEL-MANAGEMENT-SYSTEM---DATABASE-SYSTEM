import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShoppingBag, Filter } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../services/api';

export default function ProcurementPage({ showToast }) {
  const [procurements, setProcurements] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcure, setEditingProcure] = useState(null);
  const [deleteProcureId, setDeleteProcureId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    supplier_id: '',
    item_id: '',
    procure_date: new Date().toISOString().split('T')[0],
    quantity: 50,
    unit_price: 100,
    status: 'Completed'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadProcurements();
  }, [supplierFilter, statusFilter]);

  async function loadMeta() {
    try {
      const [sRes, iRes] = await Promise.all([api.getSuppliers(), api.getInventory()]);
      setSuppliers(sRes.data);
      setItems(iRes.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadProcurements() {
    try {
      setLoading(true);
      const res = await api.getProcurements({
        supplier_id: supplierFilter,
        status: statusFilter
      });
      setProcurements(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingProcure(null);
    setFormData({
      supplier_id: suppliers[0]?.supplier_id ? String(suppliers[0].supplier_id) : '',
      item_id: items[0]?.item_id ? String(items[0].item_id) : '',
      procure_date: new Date().toISOString().split('T')[0],
      quantity: 50,
      unit_price: 100,
      status: 'Completed'
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function openEditModal(p) {
    setEditingProcure(p);
    setFormData({
      supplier_id: String(p.supplier_id),
      item_id: String(p.item_id),
      procure_date: p.procure_date,
      quantity: p.quantity,
      unit_price: p.unit_price,
      status: p.status
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function validate() {
    const errs = {};
    if (!formData.supplier_id) errs.supplier_id = 'Supplier is required';
    if (!formData.item_id) errs.item_id = 'Inventory item is required';
    if (!formData.procure_date) errs.procure_date = 'Procure date is required';
    if (!formData.quantity || formData.quantity <= 0) errs.quantity = 'Quantity must be greater than 0';
    if (formData.unit_price === undefined || formData.unit_price < 0) errs.unit_price = 'Valid unit price required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        supplier_id: Number(formData.supplier_id),
        item_id: Number(formData.item_id),
        procure_date: formData.procure_date,
        quantity: Number(formData.quantity),
        unit_price: Number(formData.unit_price),
        status: formData.status
      };

      if (editingProcure) {
        await api.updateProcurement(editingProcure.procure_id, payload);
        showToast('Procurement order updated', 'success');
      } else {
        await api.createProcurement(payload);
        showToast('Procurement created and stock updated', 'success');
      }
      setIsModalOpen(false);
      loadProcurements();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setSaving(true);
      await api.deleteProcurement(deleteProcureId);
      showToast('Procurement order deleted', 'success');
      setDeleteProcureId(null);
      loadProcurements();
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
          <h2>Procurement Purchase Orders</h2>
          <p>Commercial purchase orders, batch quantities, unit costs, and fulfillment status</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            New Procurement Order
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
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option value="">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.supplier_id} value={s.supplier_id}>
                  {s.company_name}
                </option>
              ))}
            </select>

            <select
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Item Purchased</th>
                <th>Supplier Company</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Purchase Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px 0' }}>
                    Loading procurements...
                  </td>
                </tr>
              ) : procurements.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    No procurement records found.
                  </td>
                </tr>
              ) : (
                procurements.map((p) => (
                  <tr key={p.procure_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>PO#{p.procure_id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{p.item_name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{p.item_category}</div>
                    </td>
                    <td>
                      <div style={{ color: '#fff', fontWeight: 500 }}>{p.supplier_company}</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{p.supplier_name}</div>
                    </td>
                    <td>
                      {p.quantity} {p.item_unit}
                    </td>
                    <td>₹{p.unit_price} / {p.item_unit}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>₹{p.total_cost.toLocaleString()}</td>
                    <td>{p.procure_date}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.status === 'Completed'
                            ? 'badge-success'
                            : p.status === 'Pending'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => openEditModal(p)}
                          title="Edit order"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => setDeleteProcureId(p.procure_id)}
                          title="Delete order"
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
        title={editingProcure ? `Edit Purchase Order #PO-${editingProcure.procure_id}` : 'Create Procurement Order'}
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group form-grid-full">
              <label className="form-label">Select Supplier *</label>
              <select
                className="form-select"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              >
                <option value="">Select Vendor</option>
                {suppliers.map((s) => (
                  <option key={s.supplier_id} value={s.supplier_id}>
                    {s.company_name} ({s.category})
                  </option>
                ))}
              </select>
              {errors.supplier_id && <span className="form-error">{errors.supplier_id}</span>}
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Select Inventory Item *</label>
              <select
                className="form-select"
                value={formData.item_id}
                onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
              >
                <option value="">Select Item</option>
                {items.map((i) => (
                  <option key={i.item_id} value={i.item_id}>
                    {i.item_name} ({i.category} - current: {i.quantity} {i.unit})
                  </option>
                ))}
              </select>
              {errors.item_id && <span className="form-error">{errors.item_id}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Purchase Quantity *</label>
              <input
                type="number"
                className="form-input"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
              {errors.quantity && <span className="form-error">{errors.quantity}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Unit Price (₹) *</label>
              <input
                type="number"
                className="form-input"
                min="0"
                step="0.5"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              />
              {errors.unit_price && <span className="form-error">{errors.unit_price}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Order Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.procure_date}
                onChange={(e) => setFormData({ ...formData, procure_date: e.target.value })}
              />
              {errors.procure_date && <span className="form-error">{errors.procure_date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Order Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Completed">Completed (Auto-adds to inventory)</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-grid-full" style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.84rem', color: '#94a3b8' }}>Estimated Total: </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
                ₹{(Number(formData.quantity || 0) * Number(formData.unit_price || 0)).toLocaleString()}
              </span>
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
              {saving ? 'Saving...' : editingProcure ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteProcureId)}
        onClose={() => setDeleteProcureId(null)}
        onConfirm={handleDelete}
        title="Delete Procurement Order"
        message="Are you sure you want to delete this procurement record?"
        confirmText="Confirm Delete"
        isLoading={saving}
      />
    </div>
  );
}
