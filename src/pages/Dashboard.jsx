import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useTransactions, DISCOUNT_TYPES } from '../context/TransactionContext';

const peso = (n) => `₱${Number(n).toFixed(2)}`;

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { products } = useProducts();
  const { transactions, auditLog, todayStats } = useTransactions();
  const [tab, setTab] = useState('overview'); // 'overview' | 'transactions' | 'audit'

  // ✅ FIX: todayStats is already a value from context, NOT a function — remove the ()
  const stats = todayStats;
  const activeProducts  = products.filter(p => p.active).length;
  const lowStock        = products.filter(p => p.active && p.stock <= 5);
  const outOfStock      = products.filter(p => p.active && p.stock === 0);
  const totalRevenue    = transactions.filter(t => t.status === 'COMPLETED').reduce((s, t) => s + t.total, 0);

  const AUDIT_COLORS = {
    SALE:      { bg: '#dcfce7', color: '#166534' },
    CANCEL:    { bg: '#fef9c3', color: '#854d0e' },
    VOID_ITEM: { bg: '#fee2e2', color: '#991b1b' },
    POST_VOID: { bg: '#fce7f3', color: '#9d174d' },
    REPRINT:   { bg: '#ede9fe', color: '#5b21b6' },
  };

  return (
    <div className="dash-body">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Dashboard</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--ink3)', fontSize: 13 }}>
          Welcome back, <strong>{currentUser.username}</strong> · {currentUser.role}
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: "Today's Sales",    value: stats.count,            sub: 'transactions today', color: '#2563eb' },
          { label: "Today's Revenue",  value: peso(stats.total),      sub: 'completed sales',    color: '#22c55e' },
          { label: "Items Sold Today", value: stats.items,            sub: 'units',              color: '#7c3aed' },
          { label: "Total Revenue",    value: peso(totalRevenue),     sub: 'all time',           color: '#f59e0b' },
          { label: "Active Products",  value: activeProducts,         sub: 'in catalog',         color: '#0891b2' },
          { label: "Low Stock",        value: lowStock.length,        sub: '≤5 units remaining', color: '#ea580c' },
          { label: "Out of Stock",     value: outOfStock.length,      sub: 'needs restocking',   color: '#dc2626' },
          { label: "Total Transactions",value: transactions.length,   sub: 'all time',           color: '#6b7280' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            padding: '14px 16px', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink1)', margin: '2px 0 1px' }}>{s.label}</div>
            <div style={{ fontSize: 10, color: 'var(--ink3)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {[['overview', '📊 Overview'], ['transactions', '🧾 Transactions'], ['audit', '📋 Audit Log']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13,
            fontWeight: tab === key ? 700 : 400,
            background: tab === key ? 'var(--accent, #2563eb)' : 'var(--surface)',
            color: tab === key ? '#fff' : 'var(--ink2)',
            boxShadow: tab === key ? '0 2px 6px rgba(37,99,235,.3)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      {/* ── Overview tab ── */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Low stock alert */}
          <div className="panel">
            <div className="panel-head"><span className="panel-title">⚠️ Low Stock Alert</span></div>
            {lowStock.length === 0
              ? <p style={{ color: 'var(--ink3)', fontSize: 13, padding: '8px 0' }}>All products are well-stocked.</p>
              : <table className="dash-table">
                  <thead><tr><th>Product</th><th>Stock</th></tr></thead>
                  <tbody>
                    {lowStock.map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td style={{ fontWeight: 700, color: p.stock === 0 ? '#dc2626' : '#f59e0b' }}>
                          {p.stock} {p.stock === 0 ? '❌' : '⚠️'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>

          {/* Recent transactions */}
          <div className="panel">
            <div className="panel-head"><span className="panel-title">🧾 Recent Transactions</span></div>
            {transactions.length === 0
              ? <p style={{ color: 'var(--ink3)', fontSize: 13, padding: '8px 0' }}>No transactions yet.</p>
              : <table className="dash-table">
                  <thead><tr><th>TX ID</th><th>Cashier</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {transactions.slice(0, 6).map(tx => (
                      <tr key={tx.id}>
                        <td className="mono" style={{ fontSize: 10 }}>{tx.id.slice(0, 14)}…</td>
                        <td>{tx.cashier}</td>
                        <td style={{ fontWeight: 600 }}>{peso(tx.total)}</td>
                        <td>
                          <span style={{
                            fontSize: 10, padding: '2px 6px', borderRadius: 99, fontWeight: 700,
                            background: tx.status === 'VOIDED' ? '#fee2e2' : '#dcfce7',
                            color: tx.status === 'VOIDED' ? '#991b1b' : '#166534',
                          }}>{tx.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </div>
      )}

      {/* ── Transactions tab ── */}
      {tab === 'transactions' && (
        <div className="panel">
          <div className="panel-head"><span className="panel-title">All Transactions</span></div>
          {transactions.length === 0
            ? <p style={{ color: 'var(--ink3)', fontSize: 13 }}>No transactions recorded.</p>
            : <table className="dash-table">
                <thead>
                  <tr><th>TX ID</th><th>Cashier</th><th>Date</th><th>Items</th><th>Discount</th><th>Total</th><th>Reprints</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} style={{ opacity: tx.status === 'VOIDED' ? 0.6 : 1 }}>
                      <td className="mono" style={{ fontSize: 10 }}>{tx.id}</td>
                      <td>{tx.cashier}</td>
                      <td style={{ fontSize: 11 }}>{new Date(tx.createdAt).toLocaleString()}</td>
                      <td>{tx.items.reduce((s, i) => s + i.qty, 0)}</td>
                      <td style={{ fontSize: 11, color: tx.discountAmount > 0 ? '#22c55e' : 'var(--ink3)' }}>
                        {tx.discountAmount > 0 ? `${DISCOUNT_TYPES_LABEL(tx.discountType)} -${peso(tx.discountAmount)}` : '—'}
                      </td>
                      <td style={{ fontWeight: 700 }}>{peso(tx.total)}</td>
                      <td style={{ textAlign: 'center', color: tx.reprints > 0 ? '#7c3aed' : 'var(--ink3)' }}>
                        {tx.reprints || 0}
                      </td>
                      <td>
                        <span style={{
                          fontSize: 10, padding: '2px 6px', borderRadius: 99, fontWeight: 700,
                          background: tx.status === 'VOIDED' ? '#fee2e2' : '#dcfce7',
                          color: tx.status === 'VOIDED' ? '#991b1b' : '#166534',
                        }}>{tx.status}</span>
                        {tx.status === 'VOIDED' && tx.voidApprover && (
                          <div style={{ fontSize: 9, color: 'var(--ink3)' }}>by {tx.voidApprover}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}

      {/* ── Audit log tab ── */}
      {tab === 'audit' && (
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Audit Log</span></div>
          {auditLog.length === 0
            ? <p style={{ color: 'var(--ink3)', fontSize: 13 }}>No audit entries.</p>
            : <table className="dash-table">
                <thead>
                  <tr><th>Type</th><th>TX ID</th><th>User</th><th>Details</th><th>Timestamp</th></tr>
                </thead>
                <tbody>
                  {auditLog.map((entry, i) => {
                    const style = AUDIT_COLORS[entry.type] ?? { bg: '#f3f4f6', color: '#374151' };
                    return (
                      <tr key={i}>
                        <td>
                          <span style={{
                            fontSize: 10, padding: '2px 7px', borderRadius: 99,
                            background: style.bg, color: style.color, fontWeight: 700,
                          }}>{entry.type}</span>
                        </td>
                        <td className="mono" style={{ fontSize: 10 }}>{entry.txId?.slice(0, 14)}…</td>
                        <td style={{ fontSize: 12 }}>{entry.cashier || entry.approver || '—'}</td>
                        <td style={{ fontSize: 12, color: 'var(--ink2)' }}>{entry.details}</td>
                        <td style={{ fontSize: 11, color: 'var(--ink3)', whiteSpace: 'nowrap' }}>
                          {new Date(entry.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          }
        </div>
      )}
    </div>
  );
};

const DISCOUNT_TYPES_LABEL = (key) => {
  const map = { NONE: 'None', SENIOR: 'Senior', PWD: 'PWD', ATHLETE: 'Athlete', SOLO_PARENT: 'Solo Parent' };
  return map[key] ?? key;
};

export default Dashboard;