import React from 'react';
import { Menu, Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import { NAVIGATION_ITEMS } from './Sidebar';

export default function Navbar({ activeTab, onToggleMobile, onRefresh, isRefreshing, healthInfo }) {
  const isTable = activeTab.startsWith('table_');
  const tableName = isTable ? activeTab.replace('table_', '') : null;
  const currentItem = NAVIGATION_ITEMS.find((item) => item.id === activeTab) || { label: 'Dashboard' };

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          onClick={onToggleMobile}
          className="btn btn-secondary btn-icon"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div className="header-title-box">
          {activeTab === 'dashboard' ? (
            <div className="header-breadcrumb-context">
              <span className="header-breadcrumb-label">Dashboard</span>
              <span className="header-breadcrumb-separator">/</span>
              <span className="header-breadcrumb-support">Hostel Management System Control Center</span>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ margin: 0 }}>{currentItem.label}</h1>
                {isTable && (
                  <span
                    style={{
                      background: 'rgba(37, 99, 235, 0.12)',
                      border: '1px solid rgba(37, 99, 235, 0.28)',
                      color: '#93c5fd',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    TABLE VIEW
                  </span>
                )}
              </div>
              <p>
                {isTable
                  ? `Direct relational table view for ${tableName}`
                  : 'Hostel Management System Control Center'}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="header-right">
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          title="Refresh current data from database"
          disabled={isRefreshing}
        >
          <RefreshCw size={14} className={isRefreshing ? 'spin-animation' : ''} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>

        <div className="status-pill" title="Foreign keys enabled, Database active">
          <div className="status-indicator" />
          <span>Database Connected (18 Tables)</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #mobile-menu-btn {
            display: inline-flex !important;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </header>
  );
}
