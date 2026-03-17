import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAuditLogs, getCompletedTransactions } from './POS';
import './Dashboard.css';

const LOG_TYPE_LABELS = {
  void_item:   'VOID ITEM',
  cancel_sale: 'CANCEL',
  post_void:   'POST-VOID',
  reprint:     'REPRINT',
  sale:        'SALE',
};

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([
    { id: 1, name: 'Notebook',        price: 25, stock: 50,  status: 'Active' },
    { id: 2, name: 'Ballpen',         price: 12, stock: 100, status: 'Active' },
    { id: 3, name: 'Cooking Oil',     price: 55, stock: 15,  status: 'Active' },
    { id: 4, name: 'Sari-Sari Bread', price: 15, stock: 0,   status: 'Inactive' },
    { id: 5, name: 'Instant Noodles', price: 10, stock: 200, status: 'Active' },
    { id: 6, name: 'Canned Sardines', price: 22, stock: 80,  status: 'Active' },
  ]);

  const [auditLogs, setAuditLogs]       = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab]       = useState('products');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [form, setForm]                 = useState({ name: '', price: '', stock: '' });

  // Refresh live data every second
  useEffect(() => {
    const interval = setInterval(() => {
      setAuditLogs([...getAuditLogs()]);
      setTransactions([...getCompletedTransactions()]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleStatus = (id) =>
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p
    ));

  const handleLogout = () => { logout(); navigate('/'); };

  const openAdd  = ()  => { setForm({ name: '', price: '', stock: '' }); setEditTarget(null); setShowAddModal(true); };
  const openEdit = (p) => { setForm({ name: p.name, price: p.price, stock: p.stock }); setEditTarget(p.id); setShowAddModal(true); };

  const saveProduct = () => {
    if (!form.name.trim() || !form.price || !form.stock) return alert('All fields required.');
    if (editTarget) {
      setProducts(prev => prev.map(p =>
        p.id === editTarget
          ? { ...p, name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock) }
          : p
      ));
    } else {
      setProducts(prev => [...prev, {
        id: Date.now(), name: form.name,
        price: parseFloat(form.price), stock: parseInt(form.stock), status: 'Active',
      }]);
    }
    setShowAddModal(false);
  };

  // Sales summary
  const activeSales    = transactions.filter(t => !t.postVoided);
  const totalRevenue   = activeSales.reduce((sum, t) => sum + t.total, 0);
  const totalDiscounts = activeSales.reduce((sum, t) => sum + t.discountAmount, 0);
  const postVoidedCount = transactions.filter(t => t.postVoided).length;

  const SUMMARY_CARDS = [
    { label: 'Total Revenue',     value: `₱${totalRevenue.toFixed(2)}`,   accent: '#27ae60' },
    { label: 'Transactions',      value: activeSales.length,               accent: '#2980b9' },
    { label: 'Total Discounts',   value: `₱${totalDiscounts.toFixed(2)}`, accent: '#e67e22' },
    { label: 'Post-Voided Sales', value: postVoidedCount,                  accent: '#e74c3c' },
  ];

  return (
    <div className="db-wrapper">

      {/* ── TOP BAR ── */}
      <div className="db-top-bar">
        <div>
          <span className="db-logo-text">SARIPH.POS</span>
          <span className="db-role-tag">ADMIN DASHBOARD</span>
        </div>
        <div className="db-user-info">
          <span>👤 {currentUser?.username} ({currentUser?.role})</span>
          <button className="db-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="db-summary-row">
        {SUMMARY_CARDS.map((card, i) => (
          <div
            key={i}
            className="db-summary-card"
            style={{ borderTopColor: card.accent }}
          >
            <div className="db-summary-value">{card.value}</div>
            <div className="db-summary-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div className="db-tab-row">
        <button
          className={`db-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products
        </button>
        <button
          className={`db-tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          🧾 Transactions
        </button>
        <button
          className={`db-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          📋 Audit Logs
          {auditLogs.length > 0 && (
            <span className="db-tab-badge">{auditLogs.length}</span>
          )}
        </button>
      </div>

      {/* ── TAB: PRODUCTS ── */}
      {activeTab === 'products' && (
        <div className="db-card">
          <div className="db-card-header">
            <h3 className="db-card-title">Product Management</h3>
            <button className="db-btn-primary" onClick={openAdd}>+ Add Product</button>
          </div>
          <table className="db-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className={p.status === 'Inactive' ? 'inactive' : ''}>
                  <td>{p.name}</td>
                  <td>₱{p.price.toFixed(2)}</td>
                  <td>{p.stock} units</td>
                  <td className={`status-col ${p.status === 'Active' ? 'active' : 'inactive'}`}>
                    {p.status}
                  </td>
                  <td>
                    <button className="db-btn-small" onClick={() => openEdit(p)}>Edit</button>
                    <button
                      className={`db-btn-small ${p.status === 'Active' ? 'danger' : 'restore'}`}
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
      )}

      {/* ── TAB: TRANSACTIONS ── */}
      {activeTab === 'transactions' && (
        <div className="db-card">
          <div className="db-card-header">
            <h3 className="db-card-title">Sales Transactions</h3>
            <span className="db-card-meta">Live — refreshes automatically</span>
          </div>
          {transactions.length === 0 ? (
            <div className="db-empty-state">
              No transactions recorded yet. Complete a sale in the POS terminal.
            </div>
          ) : (
            <table className="db-table">
              <thead>
                <tr>
                  <th>TXN #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...transactions].reverse().map(t => (
                  <tr key={t.id}>
                    <td><strong>#{t.id}</strong></td>
                    <td className="date">{t.date}</td>
                    <td>{t.items.length}</td>
                    <td className={t.discountKey !== 'None' ? 'discount-applied' : 'discount-none'}>
                      {t.discountKey !== 'None'
                        ? `${t.discountKey} (-₱${t.discountAmount.toFixed(2)})`
                        : '—'}
                    </td>
                    <td className="total">₱{t.total.toFixed(2)}</td>
                    <td>
                      {t.postVoided
                        ? <span className="db-status-voided">POST-VOIDED</span>
                        : <span className="db-status-valid">VALID</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB: AUDIT LOGS ── */}
      {activeTab === 'audit' && (
        <div className="db-card">
          <div className="db-card-header">
            <h3 className="db-card-title">Supervisor Audit Logs</h3>
            <span className="db-card-meta">All sensitive activities tracked</span>
          </div>
          {auditLogs.length === 0 ? (
            <div className="db-empty-state">
              No audit events yet. Void, cancel, or reprint in POS to generate logs.
            </div>
          ) : (
            <div className="db-audit-list">
              {auditLogs.map(log => (
                <div
                  key={log.id}
                  className="db-log-entry"
                  data-type={log.type}
                >
                  <div className="db-log-header">
                    <span className="db-log-badge" data-type={log.type}>
                      {LOG_TYPE_LABELS[log.type] || 'EVENT'}
                    </span>
                    <span className="db-log-time">{log.time}</span>
                  </div>
                  <div className="db-log-action">
                    <strong>{log.user}</strong>: {log.action}
                  </div>
                  <div className="db-log-reason">📝 {log.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ADD / EDIT PRODUCT MODAL ── */}
      {showAddModal && (
        <div className="db-overlay">
          <div className="db-modal">
            <h3 className="db-modal-title">
              {editTarget ? 'Edit Product' : 'Add New Product'}
            </h3>

            <label className="db-label">Product Name</label>
            <input
              className="db-input"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Instant Coffee"
            />

            <label className="db-label">Price (₱)</label>
            <input
              className="db-input"
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
            />

            <label className="db-label">Stock (units)</label>
            <input
              className="db-input"
              type="number"
              value={form.stock}
              onChange={e => setForm({ ...form, stock: e.target.value })}
              placeholder="0"
            />

            <div className="db-btn-row">
              <button className="db-btn-primary" onClick={saveProduct}>
                {editTarget ? 'Save Changes' : 'Add Product'}
              </button>
              <button className="db-btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;