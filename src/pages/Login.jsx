import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLE_HOME } from '../context/AuthContext';
import "../index.css";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
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
    // Small delay for UX feel
    setTimeout(() => {
      const { success, message, role } = (() => {
        const result = login(username, password);
        return result;
      })();
      setLoading(false);
      if (success) {
        // Get role from returned user via auth context — re-read from storage
        const session = JSON.parse(localStorage.getItem('sariph_session') || 'null');
        const home = session ? (ROLE_HOME[session.role] ?? '/pos') : '/pos';
        navigate(home, { replace: true });
      } else {
        setError(message);
      }
    }, 300);
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div className="login-screen">
      <div className="login-card">

        {/* Avatar */}
        <div className="login-avatar">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="36" height="36">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>

        <h1>SARIPH.POS</h1>
        <p>Secure Terminal Access</p>

        {/* Error */}
        {error && (
          <div style={{
            background: 'var(--red-bg, #fff0f0)',
            color: 'var(--red-text, #c0392b)',
            borderRadius: 'var(--radius-sm, 6px)',
            padding: '8px 12px',
            fontSize: '12px',
            marginBottom: '8px',
            textAlign: 'center',
            border: '1px solid var(--red-text, #c0392b)',
          }}>
            {error}
          </div>
        )}

        {/* Username */}
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

        {/* Password */}
        <label>Password</label>
        <div className="input-icon-wrap" style={{ position: 'relative' }}>
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="15" height="15">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKey}
            style={{ paddingRight: '36px' }}
          />
          {/* Show/hide toggle */}
          <button
            type="button"
            onClick={() => setShowPass(s => !s)}
            style={{
              position: 'absolute', right: '10px', top: '50%',
              transform: 'translateY(-50%)', background: 'none',
              border: 'none', cursor: 'pointer', padding: 0,
              color: 'var(--ink3, #999)',
            }}
            tabIndex={-1}
            title={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? (
              <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>

        <button className="btn-enter" onClick={handleLogin} disabled={loading}>
          {loading ? 'Verifying...' : 'Enter System'}
        </button>

        <div className="login-footer-text">
          THE DREAM TEAM © 2026
        </div>

      </div>
    </div>
  );
};

export default Login;