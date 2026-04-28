import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions, DISCOUNT_TYPES } from '../context/TransactionContext';

const peso = (n) => `₱${Number(n).toFixed(2)}`;

const DISCOUNT_LABEL = (key) => {
  const map = { NONE: '—', SENIOR: 'Senior', PWD: 'PWD', ATHLETE: 'Athlete', SOLO_PARENT: 'Solo Parent' };
  return map[key] ?? key;
};

const StatusBadge = ({ status }) => (
  <span style={{
    fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700,
    background: status === 'VOIDED' ? '#fee2e2' : '#dcfce7',
    color: status === 'VOIDED' ? '#991b1b' : '#166534',
  }}>{status}</span>
);

const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{
    background: 'var(--surface)', borderRadius: 'var(--radius)',
    padding: '16px 18px', border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: 14,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10,
      background: color + '18', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink1)' }}>{label}</div>
      <div style={{ fontSize: 10, color: 'var(--ink3)' }}>{sub}</div>
    </div>
  </div>
);

const CashierDashboard = () => {
  const { currentUser } = useAuth();
  const { transactions } = useTransactions();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedTx, setExpandedTx] = useState(null);

  // Filter only this cashier's transactions
  const myTransactions = useMemo(() =>
    transactions.filter(tx => tx.cashier === currentUser.username),
    [transactions, currentUser.username]
  );

  // Stats
  const todayStr = new Date().toDateString();
  const todayTx = myTransactions.filter(tx =>
    tx.createdAt && new Date(tx.createdAt).toDateString() === todayStr && tx.status === 'COMPLETED'
  );
  const completedAll = myTransactions.filter(tx => tx.status === 'COMPLETED');
  const voidedAll    = myTransactions.filter(tx => tx.status === 'VOIDED');

  const todayRevenue  = todayTx.reduce((s, tx) => s + (Number(tx.total) || 0), 0);
  const totalRevenue  = completedAll.reduce((s, tx) => s + (Number(tx.total) || 0), 0);
  const todayItems    = todayTx.reduce((s, tx) =>
    s + (tx.items?.reduce((a, i) => a + (Number(i.qty) || 0), 0) || 0), 0);

  // Filtered list
  const filtered = useMemo(() => {
    return myTransactions.filter(tx => {
      const matchStatus = statusFilter === 'ALL' || tx.status === statusFilter;
      const matchSearch = !search || tx.id?.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [myTransactions, statusFilter, search]);

  return (
    <div className="dash-body" style={{ padding: 24 }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>My Dashboard</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--ink3)', fontSize: 13 }}>
          Logged in as <strong>{currentUser.username}</strong> · {currentUser.role}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        <StatCard icon="🧾" label="Today's Sales"    value={todayTx.length}       sub="transactions today"     color="#2563eb" />
        <StatCard icon="💰" label="Today's Revenue"  value={peso(todayRevenue)}   sub="completed today"        color="#22c55e" />
        <StatCard icon="📦" label="Items Sold Today" value={todayItems}           sub="units processed"        color="#7c3aed" />
        <StatCard icon="📊" label="Total Sales"      value={completedAll.length}  sub="all completed"          color="#f59e0b" />
        <StatCard icon="💵" label="Total Revenue"    value={peso(totalRevenue)}   sub="all time"               color="#0891b2" />
        <StatCard icon="🚫" label="Voided"           value={voidedAll.length}     sub="cancelled transactions" color="#dc2626" />
      </div>

      {/* ── Transaction History Panel ── */}
      <div className="panel" style={{
        background: 'var(--surface)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', overflow: 'hidden',
      }}>

        {/* Panel Header */}
        <div style={{
          padding: '14px 18px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
        }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>My Transaction History</span>
          <span style={{ fontSize: 12, color: 'var(--ink3)' }}>
            {myTransactions.length} total transaction{myTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Search + Filters */}
        <div style={{
          padding: '12px 18px', borderBottom: '1px solid var(--border)',
          display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <input
            style={{
              flex: 1, minWidth: 180,
              padding: '8px 12px', borderRadius: 8,
              border: '1px solid var(--border)', fontSize: 13,
              background: 'var(--bg)', color: 'var(--ink)', outline: 'none',
            }}
            placeholder="🔍 Search by TX ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {['ALL', 'COMPLETED', 'VOIDED'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{
              padding: '7px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
              fontWeight: statusFilter === f ? 700 : 500,
              background: statusFilter === f
                ? (f === 'VOIDED' ? '#fee2e2' : f === 'COMPLETED' ? '#dcfce7' : '#2563eb')
                : 'var(--surface)',
              color: statusFilter === f
                ? (f === 'VOIDED' ? '#991b1b' : f === 'COMPLETED' ? '#166534' : '#fff')
                : 'var(--ink2)',
              border: statusFilter === f ? 'none' : '1px solid var(--border)',
            }}>
              {f === 'ALL' ? `All (${myTransactions.length})`
                : f === 'COMPLETED' ? `✅ Completed (${completedAll.length})`
                : `🚫 Voided (${voidedAll.length})`}
            </button>
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--ink3)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <div style={{ fontWeight: 600 }}>No transactions found</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {myTransactions.length === 0
                ? 'You have not processed any transactions yet.'
                : 'Try adjusting your search or filter.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg)', textAlign: 'left' }}>
                  {['TX ID', 'Date & Time', 'Items', 'Discount', 'Total', 'Tendered', 'Change', 'Reprints', 'Status', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', fontWeight: 700, fontSize: 11,
                      color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: 0.5,
                      borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <React.Fragment key={tx.id}>
                    <tr
                      style={{
                        borderBottom: '1px solid var(--border)',
                        opacity: tx.status === 'VOIDED' ? 0.6 : 1,
                        background: expandedTx === tx.id ? 'var(--bg)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* TX ID */}
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--ink3)' }}>
                        {tx.id?.length > 18 ? tx.id.slice(0, 18) + '…' : tx.id}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: 'var(--ink2)', fontSize: 12 }}>
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}
                      </td>

                      {/* Items count */}
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span style={{
                          background: '#eff6ff', color: '#1d4ed8',
                          borderRadius: 99, padding: '2px 8px',
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {tx.items?.reduce((s, i) => s + i.qty, 0) ?? 0}
                        </span>
                      </td>

                      {/* Discount */}
                      <td style={{ padding: '10px 14px', fontSize: 12, color: tx.discountAmount > 0 ? '#22c55e' : 'var(--ink3)' }}>
                        {tx.discountAmount > 0
                          ? `${DISCOUNT_LABEL(tx.discountType)} -${peso(tx.discountAmount)}`
                          : '—'}
                      </td>

                      {/* Total */}
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--ink1)' }}>
                        {peso(tx.total)}
                      </td>

                      {/* Tendered */}
                      <td style={{ padding: '10px 14px', color: 'var(--ink2)' }}>
                        {peso(tx.tendered)}
                      </td>

                      {/* Change */}
                      <td style={{ padding: '10px 14px', color: '#22c55e', fontWeight: 600 }}>
                        {peso(tx.change)}
                      </td>

                      {/* Reprints */}
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {(tx.reprints || 0) > 0
                          ? <span style={{
                              background: '#ede9fe', color: '#5b21b6',
                              borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                            }}>🖨️ {tx.reprints}</span>
                          : <span style={{ color: 'var(--ink4)', fontSize: 11 }}>—</span>}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '10px 14px' }}>
                        <StatusBadge status={tx.status} />
                        {tx.status === 'VOIDED' && tx.voidApprover && (
                          <div style={{ fontSize: 9, color: 'var(--ink3)', marginTop: 2 }}>
                            by {tx.voidApprover}
                          </div>
                        )}
                      </td>

                      {/* Expand toggle */}
                      <td style={{ padding: '10px 14px' }}>
                        <button
                          onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                          style={{
                            background: 'none', border: '1px solid var(--border)',
                            borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                            fontSize: 11, color: 'var(--ink3)',
                          }}
                        >
                          {expandedTx === tx.id ? '▲ Hide' : '▼ Items'}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded row — item breakdown */}
                    {expandedTx === tx.id && (
                      <tr>
                        <td colSpan={10} style={{ background: 'var(--bg)', padding: '0' }}>
                          <div style={{ padding: '14px 18px 18px' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              Items in this transaction
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                              <thead>
                                <tr>
                                  {['Product', 'Unit Price', 'Qty', 'Subtotal'].map(h => (
                                    <th key={h} style={{
                                      textAlign: 'left', padding: '6px 10px',
                                      background: 'var(--bg2)', color: 'var(--ink3)',
                                      fontWeight: 700, fontSize: 10, textTransform: 'uppercase',
                                    }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {tx.items?.map(item => (
                                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '7px 10px', fontWeight: 600 }}>{item.name}</td>
                                    <td style={{ padding: '7px 10px', color: 'var(--ink2)' }}>{peso(item.price)}</td>
                                    <td style={{ padding: '7px 10px', color: 'var(--ink2)' }}>×{item.qty}</td>
                                    <td style={{ padding: '7px 10px', fontWeight: 700 }}>{peso(item.price * item.qty)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            {/* Void info if applicable */}
                            {tx.status === 'VOIDED' && (
                              <div style={{
                                marginTop: 12, padding: '10px 12px', borderRadius: 8,
                                background: '#fff0f0', border: '1px solid #fca5a5', fontSize: 12,
                              }}>
                                <strong style={{ color: '#991b1b' }}>🚫 Voided</strong>
                                <span style={{ color: '#991b1b', marginLeft: 8 }}>
                                  Reason: {tx.voidReason || 'N/A'} · Approver: {tx.voidApprover || 'N/A'}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierDashboard;