import React, { useState, useEffect, useRef } from 'react';
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
import CashierDashboard from './pages/CashierDashboard.jsx';
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

// ── Top Navbar ────────────────────────────────────────────────────────────────
function Navbar({ onHamburgerClick, sidebarOpen }) {
  const { currentUser, logout } = useAuth();
  if (!currentUser) return null;

  const initial = (currentUser?.username?.[0] || '?').toUpperCase();
  const role = currentUser.role;
  const canSeeDashboard   = ['Administrator', 'Manager'].includes(role);
  const canSeeUsers       = role === 'Administrator';
  const canSeeProducts    = ['Administrator', 'Manager'].includes(role);
  const canSeePOS         = ['Cashier', 'Stock Clerk'].includes(role);
  const canSeeShop        = role === 'User';
  const canSeeCashierDash = ['Cashier', 'Stock Clerk'].includes(role);

  const navItems = [];
  if (canSeeDashboard)   navItems.push({ to: '/dashboard',         label: 'Dashboard', icon: '📊' });
  if (canSeeCashierDash) navItems.push({ to: '/cashier-dashboard', label: 'Dashboard', icon: '📊' });
  if (canSeeProducts)    navItems.push({ to: '/products',          label: 'Products',  icon: '📦' });
  if (canSeeUsers)       navItems.push({ to: '/users',             label: 'Users',     icon: '👥' });
  if (canSeePOS)         navItems.push({ to: '/pos',               label: 'POS',       icon: '🖥️' });
  if (canSeeShop)        navItems.push({ to: '/shop',              label: 'Shop',      icon: '🛒' });

  return (
    <header style={{
      height: 56,
      background: '#0a0a0a',
      borderBottom: '1px solid #1c1c1c',
      display: 'flex',
      alignItems: 'center',
      padding: '0 18px',
      gap: 14,
      flexShrink: 0,
      zIndex: 100,
      position: 'relative',
    }}>
      {!sidebarOpen && (
        <>
          <button
            onClick={onHamburgerClick}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer', padding: '6px', borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, color 0.15s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            title="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{
              width: 30, height: 30, background: '#2563eb', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', flexShrink: 0,
            }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: 0.3 }}>
              SARIPH<span style={{ color: '#2563eb' }}>.POS</span>
            </span>
          </NavLink>
        </>
      )}

      <nav style={{
        display: 'flex', alignItems: 'center', gap: 4, marginLeft: 24,
        flex: 1, justifyContent: 'center',
        opacity: sidebarOpen ? 0 : 1,
        pointerEvents: sidebarOpen ? 'none' : 'auto',
        transition: 'opacity 0.2s ease',
      }} className="navbar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'rgba(37,99,235,0.15)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              }
            }}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{currentUser.username}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {currentUser.role}
          </div>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{initial}</div>
        <button
          onClick={logout}
          title="Logout"
          style={{
            background: 'none', border: '1px solid rgba(220,38,38,0.35)', borderRadius: 7,
            color: '#fca5a5', cursor: 'pointer', padding: '6px 10px',
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.18)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#fca5a5'; }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}

// ── Sidebar Drawer ────────────────────────────────────────────────────────────
function SidebarDrawer({ open, onClose }) {
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!currentUser) return null;

  const role = currentUser.role;
  const canSeeDashboard   = ['Administrator', 'Manager'].includes(role);
  const canSeeUsers       = role === 'Administrator';
  const canSeeProducts    = ['Administrator', 'Manager'].includes(role);
  const canSeePOS         = ['Cashier', 'Stock Clerk'].includes(role);
  const canSeeShop        = role === 'User';
  const canSeeCashierDash = ['Cashier', 'Stock Clerk'].includes(role);

  const NavItem = ({ to, label, icon }) => (
    <NavLink to={to} className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, height: '100vh', width: 240,
      background: '#0a0a0a', borderRight: '1px solid #1c1c1c',
      zIndex: 201, display: 'flex', flexDirection: 'column',
      transform: open ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: open ? '4px 0 32px rgba(0,0,0,0.5)' : 'none',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 14px', borderBottom: '1px solid #1c1c1c',
      }}>
        <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, background: '#2563eb', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0,
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: 0.4 }}>
            SARIPH<span style={{ color: '#2563eb' }}>.POS</span>
          </span>
        </NavLink>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer', padding: 5, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          title="Close Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="sb-section-label">MAIN MENU</div>

      <nav className="sb-nav">
        {canSeeDashboard   && <NavItem to="/dashboard"         label="Dashboard" icon="📊" />}
        {canSeeCashierDash && <NavItem to="/cashier-dashboard" label="Dashboard" icon="📊" />}
        {canSeeProducts    && <NavItem to="/products"          label="Products"  icon="📦" />}
        {canSeeUsers       && <NavItem to="/users"             label="Users"     icon="👥" />}
        {canSeePOS         && <NavItem to="/pos"               label="POS"       icon="🖥️" />}
        {canSeeShop        && <NavItem to="/shop"              label="Shop"      icon="🛒" />}
      </nav>

      <div className="sb-bottom">
        <div className="sb-avatar">
          {(currentUser?.username?.[0] || '?').toUpperCase()}
        </div>
        <div className="sb-user-info" style={{ flex: 1 }}>
          <div className="sb-username">{currentUser.username}</div>
          <div className="sb-role">{currentUser.role}</div>
        </div>
      </div>
    </aside>
  );
}

// ── App Layout ────────────────────────────────────────────────────────────────
function AppLayout({ children }) {
  const { currentUser } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!currentUser) return children;

  const sidebarWidth = 240;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', flexDirection: 'row', height: '100%',
        transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <div style={{
          flex: 1, marginLeft: drawerOpen ? sidebarWidth : 0, minWidth: 0,
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column', height: '100vh',
        }}>
          <Navbar onHamburgerClick={() => setDrawerOpen(true)} sidebarOpen={drawerOpen} />
          <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

// ── App Routes ────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { currentUser } = useAuth();
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
        <Route path="/" element={<Navigate to={homeRoute} replace />} />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['Administrator', 'Manager']}>
            <Dashboard />
          </ProtectedRoute>
        }/>

        <Route path="/cashier-dashboard" element={
          <ProtectedRoute allowedRoles={['Cashier', 'Stock Clerk']}>
            <CashierDashboard />
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