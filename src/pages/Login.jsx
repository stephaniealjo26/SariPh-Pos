import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../index.css";

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

        <p style={{ marginBottom: '25px', opacity: 0.7 }}>
          Secure Terminal Access
        </p>

        <label style={{ fontSize: "12px", fontWeight: "600" }}>
          Username
        </label>

        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginBottom: "15px" }}
        />

        <label style={{ fontSize: "12px", fontWeight: "600" }}>
          Password
        </label>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: "20px" }}
        />

        <button className="btn-enter" onClick={handleLogin}>
          Enter System
        </button>

        <div style={{
          marginTop: '25px',
          fontSize: '10px',
          borderTop: '1px solid #ddd',
          paddingTop: '10px',
          opacity: 0.7
        }}>
          THE DREAM TEAM © 2026
        </div>

      </div>
    </div>
  );
};

export default Login;