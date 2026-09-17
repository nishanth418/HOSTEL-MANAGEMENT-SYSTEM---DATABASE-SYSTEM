import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CreditCard, Eye, Filter, Receipt } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { api } from '../services/api';

const METHODS = ['UPI', 'Net Banking', 'Cash', 'Credit Card', 'Debit Card'];
const STATUSES = ['Paid', 'Pending', 'Failed', 'Refunded'];
const FEE_TYPES = ['Hostel Rent', 'Mess Fee', 'Security Deposit', 'Maintenance', 'Late Fee', 'Other'];

export default function PaymentsPage({ showToast }) {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [deletePaymentId, setDeletePaymentId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    student_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    total_amount: 14000,
    payment_method: 'UPI',
    payment_status: 'Paid',
    transaction_id: `TXN-${Date.now()}`,
    fee_type: 'Hostel Rent',
    remarks: 'Monthly hostel fee'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    loadPayments();
  }, [statusFilter, methodFilter]);

  async function loadStudents() {
    try {
      const res = await api.getStudents();
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadPayments() {
    try {
      setLoading(true);
      const res = await api.getPayments({
        payment_status: statusFilter,
        method: methodFilter
      });
      setPayments(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingPayment(null);
    setFormData({
      student_id: students[0]?.student_id ? String(students[0].student_id) : '',
      payment_date: new Date().toISOString().split('T')[0],
      total_amount: 14000,
      payment_method: 'UPI',
      payment_status: 'Paid',
      transaction_id: `TXN-${new Date().getFullYear()}-UPI-${Math.floor(10000 + Math.random() * 90000)}`,
      fee_type: 'Hostel Rent',
      remarks: 'Standard monthly fee'
    });
    setErrors({});
    setIsModalOpen(true);
  }

  async function openViewModal(p) {
    try {
      const res = await api.getPayment(p.payment_id);
      setViewingPayment(res.data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function openEditModal(p) {
    setEditingPayment(p);
    setFormData({
      student_id: String(p.student_id),
      payment_date: p.payment_date,
      total_amount: p.total_amount,
      payment_method: p.payment_method,
      payment_status: p.payment_status,
      transaction_id: p.transaction_id,
      fee_type: 'Hostel Rent',
      remarks: ''
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function validate() {
    const errs = {};
    if (!formData.student_id) errs.student_id = 'Student is required';
    if (!formData.payment_date) errs.payment_date = 'Payment date is required';
    if (!formData.total_amount || formData.total_amount <= 0) errs.total_amount = 'Valid payment amount required';
    if (!formData.transaction_id.trim()) errs.transaction_id = 'Transaction ID is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        student_id: Number(formData.student_id),
        payment_date: formData.payment_date,
        total_amount: Number(formData.total_amount),
        payment_method: formData.payment_method,
        payment_status: formData.payment_status,
        transaction_id: formData.transaction_id,
        details: [
          {
            fee_type: formData.fee_type,
            amount: Number(formData.total_amount),
            remarks: formData.remarks
          }
        ]
      };

      if (editingPayment) {
        await api.updatePayment(editingPayment.payment_id, payload);
        showToast('Payment updated successfully', 'success');
      } else {
        await api.createPayment(payload);
        showToast('Fee payment recorded', 'success');
      }
      setIsModalOpen(false);
      loadPayments();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setSaving(true);
      await api.deletePayment(deletePaymentId);
      showToast('Payment record deleted', 'success');
      setDeletePaymentId(null);
      loadPayments();
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
          <h2>Student Fee Payments</h2>
          <p>Fee payment ledger, transaction references, invoices, and payment breakdown</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Record Fee Payment
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Payment Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              className="select-filter"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="">All Payment Methods</option>
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
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
                <th>Txn ID</th>
                <th>Student</th>
                <th>Room & Hostel</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0' }}>
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.payment_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#38bdf8' }}>
                      {p.transaction_id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{p.student_name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{p.student_email}</div>
                    </td>
                    <td>
                      {p.room_number ? `${p.room_number} (${p.hostel_name})` : '-'}
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981', fontSize: '0.94rem' }}>
                      ₹{p.total_amount.toLocaleString()}
                    </td>
                    <td>{p.payment_method}</td>
                    <td style={{ whiteSpace: 'nowrap', minWidth: '120px', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>{p.payment_date}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          p.payment_status === 'Paid'
                            ? 'badge-success'
                            : p.payment_status === 'Pending'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {p.payment_status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => openViewModal(p)}
                          title="View Invoice"
                        >
                          <Receipt size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => openEditModal(p)}
                          title="Edit payment"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => setDeletePaymentId(p.payment_id)}
                          title="Delete payment"
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
        title={editingPayment ? 'Edit Fee Payment Record' : 'Record Student Fee Payment'}
      >
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group form-grid-full">
              <label className="form-label">Select Student *</label>
              <select
                className="form-select"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.first_name} {s.last_name} ({s.email}) - Room: {s.room_number || 'None'}
                  </option>
                ))}
              </select>
              {errors.student_id && <span className="form-error">{errors.student_id}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                type="number"
                className="form-input"
                min="100"
                step="50"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              />
              {errors.total_amount && <span className="form-error">{errors.total_amount}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Payment Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              />
              {errors.payment_date && <span className="form-error">{errors.payment_date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                className="form-select"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Status *</label>
              <select
                className="form-select"
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Transaction Reference ID *</label>
              <input
                type="text"
                className="form-input"
                value={formData.transaction_id}
                onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
              />
              {errors.transaction_id && <span className="form-error">{errors.transaction_id}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Fee Breakdown Category</label>
              <select
                className="form-select"
                value={formData.fee_type}
                onChange={(e) => setFormData({ ...formData, fee_type: e.target.value })}
              >
                {FEE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Remarks / Notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Month of March rent"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
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
              {saving ? 'Saving...' : editingPayment ? 'Update Payment' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Payment Breakdown Invoice Modal */}
      {viewingPayment && (
        <Modal
          isOpen={true}
          onClose={() => setViewingPayment(null)}
          title={`Payment Receipt #${viewingPayment.transaction_id}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>{viewingPayment.student_name}</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.84rem' }}>{viewingPayment.student_email}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${viewingPayment.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                    {viewingPayment.payment_status}
                  </span>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 4 }}>
                    {viewingPayment.payment_date}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.86rem', color: '#cbd5e1' }}>
                Assigned Room: {viewingPayment.room_number ? `${viewingPayment.room_number} (${viewingPayment.hostel_name})` : 'Unassigned'}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: 10 }}>Fee Breakdown Line Items</h4>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fee Type</th>
                      <th>Remarks</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingPayment.details?.map((d) => (
                      <tr key={d.detail_id}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{d.fee_type}</td>
                        <td style={{ color: '#94a3b8' }}>{d.remarks || '-'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>
                          ₹{d.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                      <td colSpan="2" style={{ fontWeight: 700, color: '#fff' }}>Total Paid via {viewingPayment.payment_method}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#10b981', fontSize: '1.05rem' }}>
                        ₹{viewingPayment.total_amount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => setViewingPayment(null)}>
                Close Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletePaymentId)}
        onClose={() => setDeletePaymentId(null)}
        onConfirm={handleDelete}
        title="Delete Payment Record"
        message="Are you sure you want to delete this payment record? Payment detail line items will also be removed."
        confirmText="Confirm Delete"
        isLoading={saving}
      />
    </div>
  );
}
