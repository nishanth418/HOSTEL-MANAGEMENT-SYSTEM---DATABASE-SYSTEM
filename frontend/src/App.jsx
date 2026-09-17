import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import { api } from './services/api';

// Pages
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import HostelsPage from './pages/HostelsPage';
import RoomsPage from './pages/RoomsPage';
import RoomTypesPage from './pages/RoomTypesPage';
import WardensPage from './pages/WardensPage';
import MessPage from './pages/MessPage';
import MealsPage from './pages/MealsPage';
import StaffPage from './pages/StaffPage';
import SuppliersPage from './pages/SuppliersPage';
import InventoryPage from './pages/InventoryPage';
import ProcurementPage from './pages/ProcurementPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import SqlQueryPage from './pages/SqlQueryPage';
import DatabaseTableView from './pages/DatabaseTableView';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import Footer from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [healthInfo, setHealthInfo] = useState(null);

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    try {
      const res = await api.getHealth();
      setHealthInfo(res);
    } catch (err) {
      console.warn('Backend connection warning:', err.message);
    }
  }

  function showToast(message, type = 'info') {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  }

  function dismissToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function handleRefresh() {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    checkHealth();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Data refreshed from database', 'info');
    }, 400);
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        healthInfo={healthInfo}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar
          activeTab={activeTab}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          healthInfo={healthInfo}
        />

        <main className="page-content" key={refreshKey}>
          {activeTab === 'dashboard' && <DashboardPage onNavigate={setActiveTab} />}
          {activeTab === 'students' && <StudentsPage showToast={showToast} />}
          {activeTab === 'hostels' && <HostelsPage showToast={showToast} />}
          {activeTab === 'rooms' && <RoomsPage showToast={showToast} />}
          {activeTab === 'room-types' && <RoomTypesPage showToast={showToast} />}
          {activeTab === 'wardens' && <WardensPage showToast={showToast} />}
          {activeTab === 'mess' && <MessPage showToast={showToast} />}
          {activeTab === 'meals' && <MealsPage showToast={showToast} />}
          {activeTab === 'staff' && <StaffPage showToast={showToast} />}
          {activeTab === 'suppliers' && <SuppliersPage showToast={showToast} />}
          {activeTab === 'inventory' && <InventoryPage showToast={showToast} />}
          {activeTab === 'procurement' && <ProcurementPage showToast={showToast} />}
          {activeTab === 'payments' && <PaymentsPage showToast={showToast} />}
          {activeTab === 'reports' && <ReportsPage showToast={showToast} />}
          {activeTab === 'sql-query' && <SqlQueryPage showToast={showToast} />}
          {activeTab === 'privacy' && <PrivacyPolicyPage onNavigate={setActiveTab} />}
          {activeTab === 'terms' && <TermsPage onNavigate={setActiveTab} />}
          {activeTab.startsWith('table_') && (
            <DatabaseTableView
              tableName={activeTab.replace('table_', '')}
              showToast={showToast}
            />
          )}
        </main>
        <Footer onNavigate={setActiveTab} />
      </div>

      {/* Global Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
