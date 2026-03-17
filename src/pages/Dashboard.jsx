import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuditLogs } from '../utils/AuditLogs.jsx';
import '../index.css';

const Dashboard = () => {
  const { currentUser } = useAuth();

  // --- PRODUCT STATE ---
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('pos_products');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Notebook', price: 25, stock: 50, status: 'Active' },
      { id: 2, name: 'Ballpen', price: 12, stock: 100, status: 'Active' },
      { id: 3, name: 'Cooking Oil', price: 55, stock: 15, status: 'Active' },
      { id: 4, name: 'Sari-Sari Bread', price: 15, stock: 30, status: 'Active' },
      { id: 5, name: 'Instant Noodles', price: 14, stock: 80, status: 'Active' },
      { id: 6, name: 'Canned Sardines', price: 22, stock: 45, status: 'Active' },
    ];
  });

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalSales: 0, txnCount: 0, voidCount: 0 });

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', stock: '' });

  // --- DATA REFRESH ---
  const loadData = () => {
    const recent = getAuditLogs() || [];
    setLogs(recent.slice(0, 5));

    const txns = JSON.parse(localStorage.getItem('completedTransactions') || '[]');
    const sales = txns.reduce((sum, t) => sum + (parseFloat(t.total) || 0), 0);
    const voids = recent.filter(l => l.action === 'VOID_ITEM').length;

    setStats({ totalSales: sales, txnCount: txns.length, voidCount: voids });
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // --- ACTIONS ---
  const handleSave = () => {
    if (!form.name || !form.price) return alert('Please fill in name and price.');

    let updated;
    if (editTarget !== null) {
      updated = products.map(p =>
        p.id === editTarget
          ? { ...p, name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 }
          : p
      );
    } else {
      const newProduct = {
        id: Date.now(),
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        status: 'Active',
      };
      updated = [newProduct, ...products];
    }

    setProducts(updated);
    localStorage.setItem('pos_products', JSON.stringify(updated));
    // Notify POS tab
    window.dispatchEvent(new Event('storage'));
    closeModal();
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditTarget(null);
    setForm({ name: '', price: '', stock: '' });
  };

  const toggleStatus = (id) => {
    const updated = products.map(p =>
      p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p
    );
    setProducts(updated);
    localStorage.setItem('pos_products', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleEdit = (p) => {
    setEditTarget(p.id);
    setForm({ name: p.name, price: p.price, stock: p.stock });
    setShowAddModal(true);
  };

  return (
    <div className="dash-body">
      {/* ── STATS ── */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="sc-label">Today's Sales</div>
          <div className="sc-val">
            ₱{stats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="sc-sub">Real-time revenue</div>
        </div>
        <div className="stat-card">
          <div className="sc-label">Transactions</div>
          <div className="sc-val">{stats.txnCount}</div>
          <div className="sc-sub">Orders processed</div>
        </div>
        <div className="stat-card">
          <div className="sc-label">Voids</div>
          <div className="sc-val">{stats.voidCount}</div>
          <div className="sc-sub">Flagged actions</div>
        </div>
      </div>

      {/* ── INVENTORY ── */}
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Product Management</span>
          <button className="btn-add" onClick={() => setShowAddModal(true)}>+ Add Product</button>
        </div>
        <table className="dash-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td className="td-name">{p.name}</td>
                <td className="mono">₱{Number(p.price).toFixed(2)}</td>
                <td>{p.stock} units</td>
                <td>
                  <span className={`bdg ${p.status === 'Active' ? 'bdg-green' : 'bdg-red'}`}>
                    <span className="bdg-dot" /> {p.status}
                  </span>
                </td>
                <td>
                  <button className="t-btn" onClick={() => handleEdit(p)}>Edit</button>
                  <button
                    className={`t-btn ${p.status === 'Active' ? 'deact' : 'act'}`}
                    onClick={() => toggleStatus(p.id)}
                  >
                    {p.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── AUDIT LOGS ── */}
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Recent Activity</span>
        </div>
        <div className="audit-wrap">
          {logs.length === 0 ? (
            <p style={{ padding: '20px', color: 'var(--ink3)' }}>No activity yet.</p>
          ) : (
            logs.map((log, i) => (
              <div key={log.id || i} className="audit-item">
                <div className="audit-ico">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="ai-time">{log.time} · {log.performedBy || 'System'}</div>
                  <div className="ai-action">{log.action?.replace('_', ' ')}</div>
                  {log.details && <div className="ai-reason">{typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── MODAL ── */}
      {showAddModal && (
        <div className="db-overlay">
          <div className="db-modal">
            <h3 className="db-modal-title">{editTarget !== null ? 'Edit Product' : 'New Product'}</h3>
            <label className="db-label">Name</label>
            <input
              className="db-input"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Product name"
            />
            <label className="db-label">Price (₱)</label>
            <input
              className="db-input"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
            />
            <label className="db-label">Stock</label>
            <input
              className="db-input"
              type="number"
              min="0"
              value={form.stock}
              onChange={e => setForm({ ...form, stock: e.target.value })}
              placeholder="0"
            />
            <div className="db-btn-row">
              <button className="db-btn-primary" onClick={handleSave}>Save</button>
              <button className="db-btn-secondary" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;