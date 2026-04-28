import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Badge color per role
const ROLE_BADGE = {
  Administrator: 'bdg-red',
  Manager:       'bdg-blue',
  Cashier:       'bdg-green',
  'Stock Clerk': 'bdg-yellow',
  User:          'bdg-gray',
};

const EMPTY_FORM = { username: '', password: '', role: 'Cashier' };

const UserManagement = () => {
  const { users, addUser, editUser, deleteUser, currentUser, ROLES } = useAuth();

  // Modal state: null | 'add' | 'edit' | 'delete'
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null); // user being edited/deleted
  const [form, setForm]         = useState(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');

  /* ── Open modals ── */
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setError('');
    setShowPass(false);
    setModal('add');
  };

  const openEdit = (user) => {
    setSelected(user);
    setForm({ username: user.username, password: user.password, role: user.role });
    setError('');
    setShowPass(false);
    setModal('edit');
  };

  const openDelete = (user) => {
    setSelected(user);
    setError('');
    setModal('delete');
  };

  const closeModal = () => { setModal(null); setSelected(null); setError(''); };

  /* ── Save handlers ── */
  const handleAdd = () => {
    if (!form.username.trim()) { setError('Username is required.'); return; }
    if (!form.password.trim()) { setError('Password is required.'); return; }
    if (form.password.length < 4) { setError('Password must be at least 4 characters.'); return; }
    const result = addUser(form);
    if (!result.success) { setError(result.message); return; }
    closeModal();
  };

  const handleEdit = () => {
    if (!form.username.trim()) { setError('Username is required.'); return; }
    if (form.password && form.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    // Only send password if user typed a new one
    const updates = {
      username: form.username,
      role: form.role,
      ...(form.password ? { password: form.password } : {}),
    };
    const result = editUser(selected.id, updates);
    if (!result.success) { setError(result.message); return; }
    closeModal();
  };

  const handleDelete = () => {
    const result = deleteUser(selected.id);
    if (!result.success) { setError(result.message); return; }
    closeModal();
  };

  /* ── Shared form fields ── */
  const FormFields = ({ isEdit = false }) => (
    <>
      {error && (
        <div style={{
          background: 'var(--red-bg, #fff0f0)', color: 'var(--red-text, #c0392b)',
          borderRadius: 'var(--radius-sm, 6px)', padding: '8px 12px',
          fontSize: '12px', marginBottom: '12px', border: '1px solid var(--red-text,#c0392b)',
        }}>
          {error}
        </div>
      )}

      <label className="db-label">Username</label>
      <input
        className="db-input"
        value={form.username}
        onChange={e => setForm({ ...form, username: e.target.value })}
        placeholder="Enter username"
        autoComplete="off"
      />

      <label className="db-label">
        {isEdit ? 'New Password' : 'Password'}
        {isEdit && <span style={{ color: 'var(--ink3,#999)', fontWeight: 400, marginLeft: 4 }}>(leave blank to keep current)</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          className="db-input"
          type={showPass ? 'text' : 'password'}
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          placeholder={isEdit ? 'New password (optional)' : 'Enter password'}
          style={{ paddingRight: '38px', width: '100%', boxSizing: 'border-box' }}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPass(s => !s)}
          style={{
            position: 'absolute', right: '10px', top: '50%',
            transform: 'translateY(-50%)', background: 'none',
            border: 'none', cursor: 'pointer', color: 'var(--ink3,#999)', padding: 0,
          }}
          tabIndex={-1}
        >
          {showPass ? '🙈' : '👁'}
        </button>
      </div>

      <label className="db-label">Role</label>
      <select
        className="sp-select"
        value={form.role}
        onChange={e => setForm({ ...form, role: e.target.value })}
        style={{ margin: '0 0 4px', width: '100%' }}
      >
        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
    </>
  );

  return (
    <div className="dash-body">
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">User Management</span>
          <button className="btn-add" onClick={openAdd}>+ Add User</button>
        </div>

        <table className="dash-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Role</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id}>
                <td className="mono" style={{ color: 'var(--ink3)' }}>{i + 1}</td>
                <td className="td-name">
                  {u.username}
                  {u.id === currentUser?.id && (
                    <span style={{
                      fontSize: '10px', marginLeft: 6,
                      color: 'var(--ink3)', fontStyle: 'italic',
                    }}>(you)</span>
                  )}
                </td>
                <td>
                  <span className={`bdg ${ROLE_BADGE[u.role] ?? 'bdg-gray'}`}>
                    <span className="bdg-dot" /> {u.role}
                  </span>
                </td>
                <td className="mono" style={{ color: 'var(--ink3)', letterSpacing: '2px' }}>
                  {'•'.repeat(Math.min(u.password?.length ?? 0, 10))}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => openEdit(u)}
                      style={actionBtn('#2563eb')}
                      title="Edit user"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => openDelete(u)}
                      style={actionBtn('#dc2626')}
                      title="Delete user"
                      disabled={u.id === currentUser?.id}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── ADD MODAL ── */}
      {modal === 'add' && (
        <div className="db-overlay">
          <div className="db-modal">
            <h3 className="db-modal-title">Add New User</h3>
            <FormFields />
            <div className="db-btn-row">
              <button className="db-btn-primary" onClick={handleAdd}>Add User</button>
              <button className="db-btn-secondary" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {modal === 'edit' && selected && (
        <div className="db-overlay">
          <div className="db-modal">
            <h3 className="db-modal-title">Edit User — {selected.username}</h3>
            <FormFields isEdit />
            <div className="db-btn-row">
              <button className="db-btn-primary" onClick={handleEdit}>Save Changes</button>
              <button className="db-btn-secondary" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {modal === 'delete' && selected && (
        <div className="db-overlay">
          <div className="db-modal">
            <h3 className="db-modal-title" style={{ color: 'var(--red-text, #c0392b)' }}>
              Delete User
            </h3>
            <p style={{ fontSize: '14px', marginBottom: 16 }}>
              Are you sure you want to delete <strong>{selected.username}</strong>?
              This action cannot be undone.
            </p>
            {error && (
              <div style={{
                background: 'var(--red-bg,#fff0f0)', color: 'var(--red-text,#c0392b)',
                borderRadius: 'var(--radius-sm,6px)', padding: '8px 12px',
                fontSize: '12px', marginBottom: 12,
              }}>
                {error}
              </div>
            )}
            <div className="db-btn-row">
              <button
                onClick={handleDelete}
                style={{
                  ...actionBtn('#dc2626'),
                  padding: '8px 20px', fontSize: '13px', fontWeight: 600,
                }}
              >
                Yes, Delete
              </button>
              <button className="db-btn-secondary" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const actionBtn = (color) => ({
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '5px',
    border: `1px solid ${color}`,
    background: 'transparent',
    color: color,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
});

export default UserManagement;