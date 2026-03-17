import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../index.css';
import { getAuditLogs, getCompletedTransactions } from './POS';
import './Dashboard.css';

const LOG_TYPE_LABELS = {
  void_item:   'VOID ITEM',
  cancel_sale: 'CANCEL',
  post_void:   'POST-VOID',
  reprint:     'REPRINT',
  sale:        'SALE',
};

const initialProducts = [
  { id: 1, name: 'Notebook', price: 25, stock: 50, status: 'Active' },
  { id: 2, name: 'Ballpen', price: 12, stock: 100, status: 'Active' },
  { id: 3, name: 'Cooking Oil', price: 55, stock: 15, status: 'Active' },
  { id: 4, name: 'Sari-Sari Bread', price: 15, stock: 0, status: 'Inactive' },
];

const initialLogs = [
  { time: '17:45 PM', user: 'Stephanie', action: 'Void Item #2', reason: 'Customer changed mind' },
  { time: '18:10 PM', user: 'Renz', action: 'Reprint Receipt #88', reason: 'Printer jammed' },
  { time: '19:02 PM', user: 'Admin', action: 'Product deactivated: Bread', reason: 'Out of stock' },
];

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState(initialProducts);
  const [logs, setLogs] = useState(initialLogs);

  const toggleStatus = (id) => {
    setProducts(products.map((p) => {
      if (p.id !== id) return p;
      const next = p.status === 'Active' ? 'Inactive' : 'Active';
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLogs((prev) => [
        { time: now, user: currentUser.username, action: `Product ${next.toLowerCase()}: ${p.name}`, reason: 'Manual status change' },
        ...prev,
      ]);
      return { ...p, status: next };
    }));
  };

  return (
    <div className="dash-body">
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="sc-label">Today's sales</div>
          <div className="sc-val">₱1,240</div>
          <div className="sc-sub">+12% vs yesterday</div>
        </div>
        <div className="stat-card">
          <div className="sc-label">Transactions</div>
          <div className="sc-val">34</div>
          <div className="sc-sub">+3 this hour</div>
        </div>
        <div className="stat-card">
          <div className="sc-label">Void items</div>
          <div className="sc-val">2</div>
          <div className="sc-sub">Requires review</div>
        </div>
      </div>

      {/* Product Management */}
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Product management</span>
          <button className="btn-add">+ Add product</button>
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
            {products.map((p) => (
              <tr key={p.id}>
                <td className="td-name">{p.name}</td>
                <td className="mono">₱{p.price.toFixed(2)}</td>
                <td>{p.stock} units</td>
                <td>
                  <span className={p.status === 'Active' ? 'bdg bdg-green' : 'bdg bdg-red'}>
                    <span className="bdg-dot" />
                    {p.status}
                  </span>
                </td>
                <td>
                  <button className="t-btn">Edit</button>
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

      {/* Audit Logs */}
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Supervisor audit logs</span>
        </div>
        <div className="audit-wrap">
          {logs.map((log, i) => (
            <div key={i} className="audit-item">
              <div className="audit-ico">
                <svg width="15" height="15" fill="none" stroke="#1d4ed8" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
              </div>
              <div>
                <div className="ai-time">{log.time} · {log.user}</div>
                <div className="ai-action">{log.action}</div>
                <div className="ai-reason">Reason: {log.reason}</div>
              </div>
            </div>
          ))}
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
          </div>        </div>
      )}
    </div>
  );
};

export default Dashboard;