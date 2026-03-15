import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [role, setRole] = useState('Cashier');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Audit log simulation
    console.log(`User logged in as: ${role} at ${new Date().toLocaleTimeString()}`);
    
    if (role === 'Cashier') navigate('/pos');
    else navigate('/dashboard');
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>SARIPH.POS</h1>
        <p style={{ marginBottom: '20px', opacity: 0.7 }}>Secure Terminal Access</p>
        
        <div style={{ textAlign: 'left', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>
          SELECT USER ROLE
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Cashier">Cashier</option>
          <option value="Supervisor">Supervisor</option>
          <option value="Administrator">Administrator</option>
        </select>

        <button className="btn-enter" onClick={handleLogin}>
          Enter System
        </button>

        <div style={{ marginTop: '25px', fontSize: '10px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
          THE DREAM TEAM © 2026
        </div>
      </div>
    </div>
  );
};

export default Login;