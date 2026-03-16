import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {

    const success = login(username, password);

    if (success) {
      console.log(`User ${username} logged in`);

      if (username === "cashier1") {
        navigate('/pos');
      } else {
        navigate('/dashboard');
      }

    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="login-screen">

      <div className="login-card">

        <h1>SARIPH.POS</h1>

        <p style={{ marginBottom: '20px', opacity: 0.7 }}>
          Secure Terminal Access
        </p>

        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

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