import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { addAuditLog, LOG_ACTIONS } from "../utils/AuditLogs.jsx";
import '../index.css';

const DISCOUNT_OPTIONS = [
  { label: 'No Discount', value: 0, key: 'None' },
  { label: 'Senior Citizen (20%)', value: 0.20, key: 'Senior Citizen' },
  { label: 'PWD (20%)', value: 0.20, key: 'PWD' },
  { label: 'Athlete (20%)', value: 0.20, key: 'Athlete' },
  { label: 'Solo Parent (10%)', value: 0.10, key: 'Solo Parent' },
];

const FALLBACK_PRODUCTS = [
  { id: 1, name: 'Notebook', price: 25, stock: 50, status: 'Active' },
  { id: 2, name: 'Ballpen', price: 12, stock: 100, status: 'Active' },
  { id: 3, name: 'Cooking Oil', price: 55, stock: 15, status: 'Active' },
  { id: 4, name: 'Sari-Sari Bread', price: 15, stock: 30, status: 'Active' },
  { id: 5, name: 'Instant Noodles', price: 14, stock: 80, status: 'Active' },
  { id: 6, name: 'Canned Sardines', price: 22, stock: 45, status: 'Active' },
];

// ─── Receipt Sub-Component ───
const Receipt = ({ transaction, onClose, onConfirm, isReprint = false }) => {
  if (!transaction) return null;
  return (
    <div className="receipt-backdrop">
      <div className="receipt-modal">
        <div className="receipt-top">
          {isReprint && (
            <div style={{ color: 'gold', textAlign: 'center', fontSize: '11px', marginBottom: '4px', letterSpacing: '2px' }}>
              ★ REPRINT ★
            </div>
          )}
          <div className="receipt-brand">SARIPH.POS</div>
          <div className="receipt-date">
            TXN #{transaction.id} · {transaction.date}
          </div>
        </div>
        <div className="receipt-body">
          {transaction.items.map((item, idx) => (
            <div key={idx} className="r-item">
              <span>{item.name} ×{item.qty}</span>
              <span>₱{(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <hr className="r-div" />
          <div className="r-sub">
            <span>Subtotal</span>
            <span>₱{transaction.subtotal.toFixed(2)}</span>
          </div>
          {transaction.discountAmount > 0 && (
            <div className="r-disc">
              <span>Discount ({transaction.discountKey})</span>
              <span>-₱{transaction.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="r-total">
            <span>TOTAL</span>
            <span>₱{transaction.total.toFixed(2)}</span>
          </div>
        </div>
        <div className="receipt-actions">
          {onConfirm ? (
            <>
              <button className="btn-print" onClick={onConfirm}>Confirm & Complete Sale</button>
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
            </>
          ) : (
            <button className="btn-print" onClick={onClose}>Close</button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main POS Component ───
const POS = () => {
  const { currentUser } = useContext(AuthContext);

  // Read products from localStorage (synced with Dashboard)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('pos_products');
    return saved ? JSON.parse(saved) : FALLBACK_PRODUCTS;
  });

  const [cart, setCart] = useState([]);
  const [discountOption, setDiscountOption] = useState(DISCOUNT_OPTIONS[0]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showLastReceipt, setShowLastReceipt] = useState(false);

  const txnCounter = useRef(1000 + Math.floor(Math.random() * 9000));

  // Sync products if Dashboard updates them
  useEffect(() => {
    const syncProducts = () => {
      const saved = localStorage.getItem('pos_products');
      if (saved) setProducts(JSON.parse(saved));
    };
    window.addEventListener('storage', syncProducts);
    return () => window.removeEventListener('storage', syncProducts);
  }, []);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = subtotal * discountOption.value;
  const total = subtotal - discountAmount;

  const activeProducts = products.filter(p => p.status === 'Active');

  const addToCart = (p) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id);
      if (existing) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1, cartId: Date.now() }];
    });
  };

  const changeQty = (cartId, delta) => {
    setCart(prev =>
      prev
        .map(i => i.cartId === cartId ? { ...i, qty: i.qty + delta } : i)
        .filter(i => i.qty > 0)
    );
  };

  const voidItem = (cartId) => {
    const item = cart.find(i => i.cartId === cartId);
    if (!item) return;
    const reason = prompt(`Void "${item.name}"?\nEnter reason:`);
    if (!reason) return;

    setCart(prev => prev.filter(i => i.cartId !== cartId));
    addAuditLog({
      action: LOG_ACTIONS.VOID_ITEM,
      performedBy: currentUser?.username || 'System',
      details: `Voided: ${item.name} — ${reason}`,
    });
  };

  // Step 1: Show preview receipt
  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowReceipt(true);
  };

  // Step 2: Confirm & persist
  const finalizeSale = () => {
    const txnId = txnCounter.current++;
    const newTxn = {
      id: txnId,
      items: [...cart],
      subtotal,
      total,
      discountKey: discountOption.key,
      discountAmount,
      date: new Date().toLocaleString(),
    };

    // ✅ Persist to localStorage so Dashboard can read it
    const existing = JSON.parse(localStorage.getItem('completedTransactions') || '[]');
    localStorage.setItem('completedTransactions', JSON.stringify([...existing, newTxn]));
    window.dispatchEvent(new Event('storage'));

    addAuditLog({
      action: LOG_ACTIONS.SALE,
      performedBy: currentUser?.username || 'System',
      details: `Sale #${txnId} — ₱${total.toFixed(2)}`,
    });

    setLastTransaction(newTxn);
    setCart([]);
    setDiscountOption(DISCOUNT_OPTIONS[0]);
    setShowReceipt(false);
  };

  // Build preview transaction object
  const previewTransaction = {
    id: txnCounter.current,
    items: cart,
    subtotal,
    total,
    discountKey: discountOption.key,
    discountAmount,
    date: new Date().toLocaleString(),
  };

  return (
    <div className="pos-root">
      {/* ── Product Panel ── */}
      <div className="pos-inventory">
        <span className="sec-label">Inventory — {activeProducts.length} items</span>
        <div className="prod-grid">
          {activeProducts.map(p => (
            <button
              key={p.id}
              className="prod-card"
              onClick={() => addToCart(p)}
            >
              <span className="prod-name">{p.name}</span>
              <span className="prod-price">₱{Number(p.price).toFixed(2)}</span>
              <span className="prod-stock">{p.stock} in stock</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Cart Panel ── */}
      <div className="pos-cart">
        <div className="cart-header">
          <span className="sec-label" style={{ margin: 0 }}>Current Sale</span>
        </div>

        <div className="cart-items-wrap">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <p>No items yet</p>
              <p style={{ fontSize: '11px', marginTop: '4px' }}>Click a product to add</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={item.cartId} className="cart-item">
                <div className="ci-num">{idx + 1}</div>
                <div className="ci-info">
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-price">
                    ₱{item.price.toFixed(2)} × {item.qty} = ₱{(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    className="t-btn"
                    style={{ padding: '3px 8px', fontSize: '14px' }}
                    onClick={() => changeQty(item.cartId, -1)}
                  >−</button>
                  <button
                    className="t-btn"
                    style={{ padding: '3px 8px', fontSize: '14px' }}
                    onClick={() => changeQty(item.cartId, 1)}
                  >+</button>
                  <button className="ci-void" onClick={() => voidItem(item.cartId)}>Void</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="summary-row">
            <span>Subtotal</span>
            <span className="mono">₱{subtotal.toFixed(2)}</span>
          </div>

          <select
            className="sp-select"
            value={DISCOUNT_OPTIONS.indexOf(discountOption)}
            onChange={e => setDiscountOption(DISCOUNT_OPTIONS[Number(e.target.value)])}
          >
            {DISCOUNT_OPTIONS.map((opt, idx) => (
              <option key={opt.key} value={idx}>{opt.label}</option>
            ))}
          </select>

          {discountOption.value > 0 && (
            <div className="summary-row green">
              <span>Discount</span>
              <span className="mono">-₱{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="total-strip">
            <span className="ts-label">Total</span>
            <span className="ts-amount">₱{total.toFixed(2)}</span>
          </div>

          <button
            className="btn-checkout"
            onClick={handleCheckout}
            disabled={cart.length === 0}
            style={{ opacity: cart.length === 0 ? 0.5 : 1, cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            Checkout
          </button>

          {lastTransaction && (
            <button
              className="btn-cancel"
              style={{ marginTop: '8px' }}
              onClick={() => setShowLastReceipt(true)}
            >
              Reprint Last Receipt
            </button>
          )}
        </div>
      </div>

      {/* ── Checkout Preview Receipt ── */}
      {showReceipt && (
        <Receipt
          transaction={previewTransaction}
          onClose={() => setShowReceipt(false)}
          onConfirm={finalizeSale}
        />
      )}

      {/* ── Reprint Last Receipt ── */}
      {showLastReceipt && lastTransaction && (
        <Receipt
          transaction={lastTransaction}
          onClose={() => setShowLastReceipt(false)}
          isReprint
        />
      )}
    </div>
  );
};

export default POS;