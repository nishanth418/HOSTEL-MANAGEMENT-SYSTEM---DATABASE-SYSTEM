import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const type = toast.type || 'info';
        return (
          <div key={toast.id} className={`toast toast-${type}`}>
            {type === 'success' && <CheckCircle2 size={20} color="#10b981" />}
            {type === 'error' && <AlertCircle size={20} color="#ef4444" />}
            {type === 'warning' && <AlertTriangle size={20} color="#f59e0b" />}
            {type === 'info' && <Info size={20} color="#38bdf8" />}
            <div style={{ flex: 1 }}>{toast.message}</div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
