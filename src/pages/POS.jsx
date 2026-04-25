import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useTransactions, DISCOUNT_TYPES } from '../context/TransactionContext';
import { useOrder } from '../context/OrderContext';

// ── helpers ──────────────────────────────────────────────────────────────────
const peso = (n) => `₱${Number(n).toFixed(2)}`;
const genTxId = () => `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const now = () => new Date().toISOString();

const miniBtn = (bg = '#3b82f6') => ({
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '6px 14px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
});

// ── Row component ─────────────────────────────────────────────────────────────
const Row = ({ label, value, bold, large, color }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 0',
    borderBottom: '1px solid var(--border)',
  }}>
    <span style={{ fontSize: large ? 15 : 13, color: 'var(--ink2)' }}>{label}</span>
    <span style={{
      fontSize: large ? 18 : 13,
      fontWeight: bold ? 800 : 400,
      color: color ?? 'var(--ink1)',
    }}>{value}</span>
  </div>
);

// ── Receipt component ─────────────────────────────────────────────────────────
const Receipt = ({ tx, onNew }) => (
  <div className="dash-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{
      background: 'white', borderRadius: 12, padding: 32,
      border: '1px solid var(--border)', width: 360, maxWidth: '100%',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 36 }}>🧾</div>
        <h2 style={{ margin: '8px 0 4px', fontWeight: 800 }}>SARIPH.POS</h2>
        <p style={{ color: 'var(--ink3)', fontSize: 12, margin: 0 }}>Official Receipt</p>
      </div>

      <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 12 }}>
        <div>TX ID: <span style={{ fontFamily: 'monospace' }}>{tx.id}</span></div>
        <div>Cashier: {tx.cashier}</div>
        <div>Date: {new Date(tx.createdAt).toLocaleString()}</div>
      </div>

      <div style={{
        borderTop: '1px dashed var(--border)',
        borderBottom: '1px dashed var(--border)',
        padding: '10px 0', margin: '10px 0',
      }}>
        {tx.items.map(item => (
          <div key={item.id} style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 13, padding: '3px 0',
          }}>
            <span>{item.name} <span style={{ color: 'var(--ink3)' }}>×{item.qty}</span></span>
            <span>{peso(item.price * item.qty)}</span>
          </div>
        ))}
      </div>

      <Row label="Subtotal" value={peso(tx.subtotal)} />
      {tx.discountType !== 'NONE' && (
        <Row label={`Discount (${tx.discountType})`} value={`-${peso(tx.subtotal - tx.total)}`} color="#22c55e" />
      )}
      <Row label="TOTAL" value={peso(tx.total)} bold large />
      <Row label="Tendered" value={peso(tx.tendered)} />
      <Row label="Change" value={peso(tx.change)} color="#22c55e" bold />

      <button
        onClick={onNew}
        style={{ ...miniBtn('#2563eb'), width: '100%', marginTop: 20, padding: 12, fontSize: 14 }}
      >
        ✅ New Transaction
      </button>
    </div>
  </div>
);

// ── Main POS Component ────────────────────────────────────────────────────────
const POS = () => {
  const { currentUser } = useAuth();
  const { deductStock } = useProducts();
  const { saveTransaction } = useTransactions();
  const { order, isWaitingForCashier, finalizeCheckout, rejectOrder } = useOrder();

  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState('NONE');
  const [txId] = useState(genTxId);
  const [view, setView] = useState('pos');
  const [lastTx, setLastTx] = useState(null);
  const [amountTendered, setAmountTendered] = useState('');

  // Sync cart when order arrives
  useEffect(() => {
    if (isWaitingForCashier && order) {
      setCart(order.items);
    } else {
      setCart([]);
    }
  }, [isWaitingForCashier, order]);

  // ── Totals ──────────────────────────────────────────────────────────────────
  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discRate   = DISCOUNT_TYPES[discount]?.rate ?? 0;
  const discAmount = subtotal * discRate;
  const total      = subtotal - discAmount;
  const tendered   = parseFloat(amountTendered) || 0;
  const change     = tendered - total;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCompleteSale = () => {
    if (cart.length === 0 || tendered < total) return;

    const tx = {
      id: txId,
      cashier: currentUser.username,
      createdAt: now(),
      items: cart,
      subtotal,
      discountType: discount,
      discountAmount: discAmount,
      total,
      tendered,
      change,
      status: 'COMPLETED',
    };

    deductStock(cart);
    saveTransaction(tx);
    setLastTx(tx);
    finalizeCheckout();
    setView('receipt');
  };

  const handleCancelOrder = () => {
    rejectOrder();
    setCart([]);
  };

  // ── Idle screen (no order yet) ────────────────────────────────────────────────
  if (!isWaitingForCashier && view === 'pos') {
    return (
      <div className="dash-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{
          textAlign: 'center', background: 'white', padding: 40,
          borderRadius: 12, border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h2 style={{ fontWeight: 700, color: 'var(--ink1)' }}>Waiting for Customer</h2>
          <p style={{ color: 'var(--ink3)', fontSize: 14 }}>
            The cashier terminal is idle. Items will appear here <br />
            once the user clicks "Send to Cashier".
          </p>
          {['Administrator', 'Manager'].includes(currentUser.role) && (
            <button style={{ ...miniBtn('#dc2626'), marginTop: 20 }} onClick={() => setView('postvoid')}>
              🚫 Access Post-Void Tools
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Receipt screen ────────────────────────────────────────────────────────────
  if (view === 'receipt' && lastTx) {
    return (
      <Receipt
        tx={lastTx}
        onNew={() => { setView('pos'); setAmountTendered(''); }}
      />
    );
  }

  // ── Active POS screen ─────────────────────────────────────────────────────────
  return (
    <div className="dash-body" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '10px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontWeight: 700 }}>
          📋 Reviewing Order: <span style={{ color: 'var(--accent)' }}>{order?.user}</span>
        </div>
        <button style={miniBtn('#dc2626')} onClick={handleCancelOrder}>Reject / Return to User</button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT — Item list */}
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>ITEMS SENT BY USER</h3>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{peso(item.price)}</td>
                  <td>{item.qty}</td>
                  <td style={{ textAlign: 'right' }}>{peso(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RIGHT — Checkout panel */}
        <div style={{
          width: 360, borderLeft: '1px solid var(--border)',
          background: 'var(--surface)', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: 20, flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>CHECKOUT</h3>
            <Row label="Subtotal" value={peso(subtotal)} />

            <select
              className="sp-select"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
              style={{ width: '100%', margin: '10px 0' }}
            >
              {Object.entries(DISCOUNT_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            {discAmount > 0 && (
              <Row label={`Discount (${discount})`} value={`-${peso(discAmount)}`} color="#22c55e" />
            )}
            <Row label="TOTAL" value={peso(total)} bold large />

            <div style={{ marginTop: 20 }}>
              <label className="db-label">AMOUNT TENDERED</label>
              <input
                className="db-input"
                type="number"
                value={amountTendered}
                onChange={e => setAmountTendered(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
              {tendered >= total && tendered > 0 && (
                <Row label="Change" value={peso(change)} color="#22c55e" bold />
              )}
            </div>
          </div>

          <div style={{ padding: 20, borderTop: '1px solid var(--border)' }}>
            <button
              className="db-btn-primary"
              style={{ width: '100%', padding: 15 }}
              disabled={cart.length === 0 || tendered < total}
              onClick={handleCompleteSale}
            >
              Complete Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;