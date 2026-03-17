import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login.jsx';
import POS from './pages/POS.jsx';
import Dashboard from './pages/Dashboard.jsx';
import './index.css';

// ── Protected Route ──────────────────────────────────────
function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) return <Navigate to="/" replace />;
  return children;
}

// ── Navbar ───────────────────────────────────────────────
function Navbar() {
  const { currentUser, logout } = useAuth();
  if (!currentUser) return null;

  return (
    <nav className="navbar">
      <div className="logo">SARIPH.POS</div>
      <div className="user-badge">
        <div className="menu">
          {currentUser.role === 'Cashier' && <Link to="/pos">Cashier</Link>}
          {currentUser.role === 'Administrator' && <Link to="/dashboard">Dashboard</Link>}
        </div>
        <span className="role-pill">{currentUser.role}</span>
        <button className="btn-logout" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

// ── Routes ───────────────────────────────────────────────
function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            currentUser
              ? <Navigate to={currentUser.role === 'Administrator' ? '/dashboard' : '/pos'} replace />
              : <Login />
          }
        />
        <Route
          path="/pos"
          element={
            <ProtectedRoute allowedRoles={['Cashier']}>
              <POS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// ── App ──────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;