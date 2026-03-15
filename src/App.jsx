import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login.jsx';
import POS from './pages/POS.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  return (
    <Router>
      <nav style={{ background: '#000', padding: '10px 20px', display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>SARIPH.POS</Link>
        <Link to="/pos" style={{ color: '#fff', textDecoration: 'none' }}>Cashier</Link>
        <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Admin</Link>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;