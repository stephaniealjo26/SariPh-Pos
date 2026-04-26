import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ROLE_HOME } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { TransactionProvider } from './context/TransactionContext';
import { OrderProvider } from './context/OrderContext';

import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import POS from './pages/POS.jsx';
import UserShop from './pages/UserShop.jsx';
import Dashboard from './pages/Dashboard.jsx';
import UserManagement from './pages/Usermanagement.jsx';
import ProductManagement from './pages/ProductManagement.jsx';
import './index.css';

// ── Role-based route guard ────────────────────────────────────────────────────
function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role))
    return <Navigate to={ROLE_HOME[currentUser.role] ?? '/'} replace />;
  return children;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar() {
  const { currentUser, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!currentUser) return null;

  const role = currentUser.role;
  const canSeeDashboard = ['Administrator', 'Manager'].includes(role);
  const canSeeUsers     = role === 'Administrator';
  const canSeeProducts  = ['Administrator', 'Manager'].includes(role);
  const canSeePOS       = ['Cashier', 'Stock Clerk'].includes(role);
  const canSeeShop      = role === 'User';

  const initial = (currentUser?.username?.[0] || '?').toUpperCase();

  const NavItem = ({ to, label, icon }) => (
    <NavLink to={to} className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sb-top">
        <div className="sb-logo">
          <div className="sb-logo-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          {!collapsed && <span className="sb-brand">SARIPH<span className="sb-brand-dot">.POS</span></span>}
        </div>
        <button className="sb-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {collapsed ? <path d="M9 5l7 7-7 7"/> : <path d="M15 19l-7-7 7-7"/>}
          </svg>
        </button>
      </div>

      {!collapsed && <div className="sb-section-label">MAIN MENU</div>}

      <nav className="sb-nav">
        {canSeeDashboard && <NavItem to="/dashboard" label="Dashboard" icon="📊" />}
        {canSeeProducts  && <NavItem to="/products"  label="Products"  icon="📦" />}
        {canSeeUsers     && <NavItem to="/users"     label="Users"     icon="👥" />}
        {canSeePOS       && <NavItem to="/pos"       label="POS"       icon="🖥️" />}
        {canSeeShop      && <NavItem to="/shop"      label="Shop"      icon="🛒" />}
      </nav>

      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-avatar">{initial}</div>
          {!collapsed && (
            <div className="sb-user-info">
              <div className="sb-username">{currentUser?.username}</div>
              <div className="sb-role">{currentUser?.role}</div>
            </div>
          )}
        </div>
        <button className="sb-logout" onClick={logout} title="Logout">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}

// ── App Layout ────────────────────────────────────────────────────────────────
function AppLayout({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return children;
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}

// ── App Routes ────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { currentUser } = useAuth();

  // ✅ FIX: Compute home once, don't re-derive inside JSX on every render
  const homeRoute = currentUser ? (ROLE_HOME[currentUser.role] ?? '/pos') : '/';

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        {/* ✅ FIX: Use a stable homeRoute string, not inline expression */}
        <Route path="/" element={<Navigate to={homeRoute} replace />} />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Manager']}>
            <Dashboard />
          </ProtectedRoute>
        }/>

        <Route path="/products" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Manager']}>
            <ProductManagement />
          </ProtectedRoute>
        }/>

        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['Administrator']}>
            <UserManagement />
          </ProtectedRoute>
        }/>

        {/* ✅ FIX: Separate /pos and /shop routes — no conditional rendering inside route */}
        <Route path="/pos" element={
          <ProtectedRoute allowedRoles={['Cashier', 'Stock Clerk']}>
            <POS />
          </ProtectedRoute>
        }/>

        <Route path="/shop" element={
          <ProtectedRoute allowedRoles={['User']}>
            <UserShop />
          </ProtectedRoute>
        }/>

        <Route path="/signup" element={<Navigate to={homeRoute} replace />} />
        <Route path="*" element={<Navigate to={homeRoute} replace />} />
      </Routes>
    </AppLayout>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <TransactionProvider>
          <OrderProvider>
            <Router>
              <AppRoutes />
            </Router>
          </OrderProvider>
        </TransactionProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;