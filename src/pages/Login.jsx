import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_HOME } from '../context/AuthContext';
import "../index.css";

const Login = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleLogin = () => {

    setError('');
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login(username, password);
      setLoading(false);
      if (result.success) {
        const home = ROLE_HOME[result.role] ?? '/pos';
        navigate(home, { replace: true });
      } else {
        setError(result.message);
      }
    }, 300);
  };

  // ✅ handleKey defined here — triggers login on Enter key
  const handleKey = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-side">
          <div className="auth-side-inner">
            <div className="auth-brand">
              <div className="auth-logo">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="48" height="48">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3"/>
                </svg>
              </div>
              <div>
                <span className="auth-brand-name">SARIPH.POS</span>
                <p className="auth-brand-tagline">Smart store management for inventory, sales, and users.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-panel-head">
            <span className="auth-subtitle">Sign In</span>
            <h1>SARIPH.POS</h1>
            <p>Enter your credentials to access the system.</p>
          </div>

          {error && (
            <div className="auth-error-box">
              {error}
            </div>
          )}

          <div className="auth-field">
            <label>Username</label>
            <div className="input-icon-wrap">
              <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKey}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="input-icon-wrap">
              <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>
          </div>

          <button className="btn-enter" onClick={handleLogin} disabled={loading}>
            {loading ? 'Verifying...' : 'Enter System'}
          </button>

          <div className="auth-switch">
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;