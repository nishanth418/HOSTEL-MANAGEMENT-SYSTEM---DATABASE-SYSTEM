import React from 'react';
import {
  LayoutDashboard,
  FileBarChart2,
  Terminal,
  Database,
  Table2,
  X
} from 'lucide-react';

export const EXACT_18_TABLES = [
  'WARDEN',
  'WARDEN_PHONE',
  'HOSTEL',
  'ROOM_TYPE',
  'ROOM',
  'STUDENT',
  'STUDENT_PHONE',
  'MESS',
  'MESS_CONTACT',
  'MEAL',
  'STAFF',
  'STAFF_PHONE',
  'SUPPLIER',
  'SUPPLIER_PHONE',
  'INVENTORY_ITEM',
  'PROCURES',
  'PAYMENT',
  'PAYMENT_DETAIL'
];

export const TABLE_GROUPS = [
  {
    groupId: 'warden',
    groupTitle: 'WARDEN MANAGEMENT',
    accent: '#818cf8',
    headingColor: '#a5b4fc',
    accentBorder: 'rgba(129, 140, 248, 0.24)',
    accentBgHover: 'rgba(129, 140, 248, 0.10)',
    accentBgActive: 'rgba(99, 102, 241, 0.22)',
    accentBorderActive: '#818cf8',
    tables: ['WARDEN', 'WARDEN_PHONE']
  },
  {
    groupId: 'hostel-student',
    groupTitle: 'HOSTEL & STUDENT MANAGEMENT',
    accent: '#38bdf8',
    headingColor: '#7dd3fc',
    accentBorder: 'rgba(56, 189, 248, 0.24)',
    accentBgHover: 'rgba(56, 189, 248, 0.10)',
    accentBgActive: 'rgba(56, 189, 248, 0.20)',
    accentBorderActive: '#38bdf8',
    tables: ['HOSTEL', 'ROOM_TYPE', 'ROOM', 'STUDENT', 'STUDENT_PHONE']
  },
  {
    groupId: 'mess-meals',
    groupTitle: 'MESS & MEALS',
    accent: '#34d399',
    headingColor: '#6ee7b7',
    accentBorder: 'rgba(52, 211, 153, 0.24)',
    accentBgHover: 'rgba(52, 211, 153, 0.10)',
    accentBgActive: 'rgba(16, 185, 129, 0.20)',
    accentBorderActive: '#34d399',
    tables: ['MESS', 'MESS_CONTACT', 'MEAL']
  },
  {
    groupId: 'staff',
    groupTitle: 'STAFF MANAGEMENT',
    accent: '#fbbf24',
    headingColor: '#fde68a',
    accentBorder: 'rgba(251, 191, 36, 0.24)',
    accentBgHover: 'rgba(251, 191, 36, 0.10)',
    accentBgActive: 'rgba(245, 158, 11, 0.20)',
    accentBorderActive: '#fbbf24',
    tables: ['STAFF', 'STAFF_PHONE']
  },
  {
    groupId: 'supplier-inventory',
    groupTitle: 'SUPPLIER & INVENTORY',
    accent: '#fb7185',
    headingColor: '#fda4af',
    accentBorder: 'rgba(251, 113, 133, 0.24)',
    accentBgHover: 'rgba(251, 113, 133, 0.10)',
    accentBgActive: 'rgba(244, 63, 94, 0.20)',
    accentBorderActive: '#fb7185',
    tables: ['SUPPLIER', 'SUPPLIER_PHONE', 'INVENTORY_ITEM', 'PROCURES']
  },
  {
    groupId: 'payments',
    groupTitle: 'PAYMENTS',
    accent: '#c084fc',
    headingColor: '#d8b4fe',
    accentBorder: 'rgba(192, 132, 252, 0.24)',
    accentBgHover: 'rgba(192, 132, 252, 0.10)',
    accentBgActive: 'rgba(168, 85, 247, 0.20)',
    accentBorderActive: '#c084fc',
    tables: ['PAYMENT', 'PAYMENT_DETAIL']
  }
];

export const OVERVIEW_CONFIG = {
  dashboard: {
    accent: '#818cf8',
    headingColor: '#a5b4fc',
    accentBorder: 'rgba(129, 140, 248, 0.28)',
    accentBgHover: 'rgba(129, 140, 248, 0.12)',
    accentBgActive: 'rgba(99, 102, 241, 0.22)',
    accentBorderActive: '#818cf8'
  },
  reports: {
    accent: '#38bdf8',
    headingColor: '#7dd3fc',
    accentBorder: 'rgba(56, 189, 248, 0.28)',
    accentBgHover: 'rgba(56, 189, 248, 0.12)',
    accentBgActive: 'rgba(56, 189, 248, 0.20)',
    accentBorderActive: '#38bdf8'
  },
  'sql-query': {
    accent: '#34d399',
    headingColor: '#6ee7b7',
    accentBorder: 'rgba(52, 211, 153, 0.28)',
    accentBgHover: 'rgba(52, 211, 153, 0.12)',
    accentBgActive: 'rgba(16, 185, 129, 0.20)',
    accentBorderActive: '#34d399'
  }
};

export const NAVIGATION_ITEMS = [
  { section: 'OVERVIEW' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, overviewConfig: OVERVIEW_CONFIG['dashboard'] },
  { id: 'reports', label: 'Reports (13 Views)', icon: FileBarChart2, overviewConfig: OVERVIEW_CONFIG['reports'] },
  { id: 'sql-query', label: 'SQL Studio', icon: Terminal, overviewConfig: OVERVIEW_CONFIG['sql-query'] },

  { section: 'DATABASE TABLES' },
  ...TABLE_GROUPS.flatMap((group) => [
    { subGroup: group.groupTitle, headingColor: group.headingColor, accentBorder: group.accentBorder },
    ...group.tables.map((table) => ({
      id: `table_${table}`,
      tableName: table,
      label: table,
      icon: Table2,
      group
    }))
  ])
];

export default function Sidebar({ activeTab, onSelectTab, mobileOpen, onCloseMobile, healthInfo }) {
  const [hoveredItem, setHoveredItem] = React.useState(null);

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Database size={22} />
        </div>
        <div className="logo-text">
          <h2>HostelHub</h2>
          <span>18 Relational Tables</span>
        </div>
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {NAVIGATION_ITEMS.map((item, index) => {
          if (item.section) {
            return (
              <div key={`section-${index}`} className="nav-section-title">
                {item.section}
              </div>
            );
          }

          if (item.subGroup) {
            return (
              <div
                key={`subgroup-${index}`}
                className="nav-subgroup-title"
                style={{ color: item.headingColor }}
              >
                <span>{item.subGroup}</span>
                <span
                  style={{
                    flex: 1,
                    height: 1,
                    background: item.accentBorder || 'rgba(255, 255, 255, 0.1)',
                    marginLeft: 6
                  }}
                />
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isTableItem = Boolean(item.tableName);
          const group = item.group;
          const config = isTableItem ? group : item.overviewConfig;
          const isHovered = hoveredItem === item.id;

          // Consistent premium dark SaaS styling for all navigation buttons (group.accentBgActive)
          const itemStyle = {
            background: isActive
              ? (config?.accentBgActive || group?.accentBgActive || 'rgba(99, 102, 241, 0.22)')
              : isHovered
              ? (config?.accentBgHover || '#18223a')
              : '#111827',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: isActive
              ? (config?.accentBorderActive || '#818cf8')
              : isHovered
              ? (config?.accentBorder || 'rgba(255, 255, 255, 0.2)')
              : 'rgba(255, 255, 255, 0.07)',
            color: isActive ? '#ffffff' : isHovered ? '#ffffff' : '#cbd5e1',
            boxShadow: 'none',
            borderLeft: isActive
              ? `3px solid ${config?.accent || '#818cf8'}`
              : '1px solid rgba(255, 255, 255, 0.07)',
            transition: 'all 0.18s ease',
            borderRadius: isTableItem ? 'var(--radius-sm)' : 'var(--radius-md)'
          };

          return (
            <button
              key={item.id}
              className={`nav-item ${isTableItem ? 'nav-table-item' : 'nav-overview-item'} ${isActive ? 'active' : ''}`}
              style={itemStyle}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
            >
              <Icon
                size={isTableItem ? 14 : 16}
                color={config ? config.accent : undefined}
                style={{
                  opacity: isActive || isHovered ? 1 : 0.85,
                  filter: 'none',
                  flexShrink: 0
                }}
              />
              <span style={{ fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="db-badge-card">
          <div className="db-badge-icon">
            <Database size={18} />
          </div>
          <div className="db-badge-info">
            <h4>DATABASE SYSTEM</h4>
            <p>18 / 18 Relational Tables</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
