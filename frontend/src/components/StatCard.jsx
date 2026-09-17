import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = '#2563eb', gradient }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div
          className="stat-card-icon"
          style={{
            background: gradient || `${color}18`,
            border: `1px solid ${color}33`,
            color: color
          }}
        >
          {Icon && <Icon size={18} />}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      {subtext && <div className="stat-card-sub">{subtext}</div>}
    </div>
  );
}
