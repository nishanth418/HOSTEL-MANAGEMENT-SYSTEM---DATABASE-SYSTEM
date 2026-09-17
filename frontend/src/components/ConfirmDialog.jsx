import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to perform this action? This cannot be undone.',
  confirmText = 'Delete',
  isDestructive = true,
  isLoading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="460px">
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-sm)',
            background: isDestructive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(37, 99, 235, 0.15)',
            border: isDestructive ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(37, 99, 235, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDestructive ? '#ef4444' : '#2563eb',
            flexShrink: 0
          }}
        >
          <AlertTriangle size={20} />
        </div>
        <div>
          <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
        <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </button>
        <button
          className={isDestructive ? 'btn btn-danger' : 'btn btn-primary'}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
