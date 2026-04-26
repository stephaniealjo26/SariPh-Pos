import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_HOME } from '../context/AuthContext';
import '../index.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSignup = () => {
    setError('');

    if (!username.trim() || !email.trim() || !password) {
      setError('Please enter username, email, and password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = register({
        username: username.trim(),
        email: email.trim(),
        password,
        role: 'User',
      });
      setLoading(false);

      if (result.success) {
        navigate(ROLE_HOME['User'] ?? '/shop', { replace: true });
      } else {
        setError(result.message);
      }
    }, 300);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSignup();
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-side">
          <div className="auth-side-inner">
            <div className="auth-brand">
              <div className="auth-logo">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="48" height="48">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
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
            <span className="auth-subtitle">Sign Up</span>
            <h1>Create your account</h1>
            <p>Register with a username, email, and password to start using SARIPH.POS.</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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
            <label>Email</label>
            <div className="input-icon-wrap">
              <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 5.25v13.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V5.25m19.5 0L12 13.5 2.25 5.25" />
              </svg>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="input-icon-wrap">
              <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="15" height="15">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
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

          <button className="btn-enter" onClick={handleSignup} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="auth-switch">
            Already have an account? <Link to="/">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
