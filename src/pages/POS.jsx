import React, { useState, useRef } from 'react';
import './POS.css';
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { addAuditLog, LOG_ACTIONS } from '../utils/AuditLog.jsx';

const SUPERVISOR_PIN = '1234';

let globalAuditLogs = [];
export const getAuditLogs = () => globalAuditLogs;
const pushAuditLog = (entry) => {
  globalAuditLogs = [{ id: Date.now(), time: new Date().toLocaleTimeString(), ...entry }, ...globalAuditLogs];
};

let completedTransactions = [];
export const getCompletedTransactions = () => completedTransactions;

const DISCOUNT_OPTIONS = [
  { label: 'No Discount', value: 0, key: 'None' },
  { label: 'Senior Citizen (20%)', value: 0.20, key: 'Senior Citizen' },
  { label: 'PWD (20%)', value: 0.20, key: 'PWD' },
  { label: 'Athlete (20%)', value: 0.20, key: 'Athlete' },
  { label: 'Solo Parent (10%)', value: 0.10, key: 'Solo Parent' },
];

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Notebook', price: 25, stock: 50, status: 'Active' },
  { id: 2, name: 'Ballpen', price: 12, stock: 100, status: 'Active' },
  { id: 3, name: 'Cooking Oil', price: 55, stock: 15, status: 'Active' },
  { id: 4, name: 'Sari-Sari Bread', price: 15, stock: 30, status: 'Active' },
  { id: 5, name: 'Instant Noodles', price: 10, stock: 200, status: 'Active' },
  { id: 6, name: 'Canned Sardines', price: 22, stock: 80, status: 'Active' },
];


const Receipt = ({ transaction, onClose, isReprint = false }) => {
  if (!transaction) return null;
  return (
    <div className="pos-overlay">
      <div className="pos-receipt-modal">
        <div className="pos-receipt-header">
          {isReprint && <div className="pos-reprint-badge">★ REPRINT ★</div>}
          <div className="pos-store-name">SARIPH.POS</div>
          <div className="pos-receipt-meta">
            <span>TXN #{transaction.id}</span>
            <span>{transaction.date}</span>
          </div>
          {transaction.cashier && (
            <div className="pos-receipt-cashier">Cashier: {transaction.cashier}</div>
          )}
          <div className="pos-receipt-divider">{'- '.repeat(22)}</div>
        </div>

        <div className="pos-receipt-body">
          {transaction.items.map((item, idx) => (
            <div key={idx} className="pos-receipt-line">
              <span style={{ flex: 1 }}>{item.name}</span>
              <span className="pos-receipt-price">₱{item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="pos-receipt-divider">{'- '.repeat(22)}</div>

        <div className="pos-receipt-totals">
          <div className="pos-receipt-line">
            <span>Subtotal</span>
            <span>₱{transaction.subtotal.toFixed(2)}</span>
          </div>
          {transaction.discountKey !== 'None' && (
            <div className="pos-receipt-line discount">
              <span>{transaction.discountKey} ({(transaction.discountRate * 100).toFixed(0)}%)</span>
              <span>-₱{transaction.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="pos-receipt-grand-total">
            <span>TOTAL</span>
            <span>₱{transaction.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="pos-receipt-divider">{'= '.repeat(22)}</div>

        {transaction.postVoided && (
          <div className="pos-voided-stamp">POST-VOIDED</div>
        )}

        <div className="pos-receipt-footer">
          <div>Thank you for shopping!</div>
          <small>THE DREAM TEAM © 2026</small>
        </div>

        <button className="pos-receipt-close-btn" onClick={onClose}>CLOSE</button>
      </div>
    </div>
  );
};


const PostVoidModal = ({ transactions, onApprove, onClose }) => {
  const [selectedTxn, setSelectedTxn] = useState('');
  const [reason, setReason] = useState('');
  const [supervisorPin, setSupervisorPin] = useState('');
  const SUPERVISOR_PIN = '9999';

  const handleApprove = () => {
    if (!selectedTxn) return alert('Select a transaction to void.');
    if (!reason.trim()) return alert('Reason is required.');
    if (supervisorPin !== SUPERVISOR_PIN) return alert('Invalid Supervisor PIN.');
    onApprove(parseInt(selectedTxn), reason);
  };

  const eligible = transactions.filter(t => !t.postVoided);

  return (
    <div className="pos-overlay">
      <div className="pos-modal">
        <h2 className="pos-modal-title">🔒 Post-Void Sale</h2>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
          Supervisor approval required. This will reverse inventory and sales records.
        </p>

        <label className="pos-label">Select Transaction</label>
        <select className="pos-select" value={selectedTxn} onChange={e => setSelectedTxn(e.target.value)}>
          <option value="">-- Select --</option>
          {eligible.map(t => (
            <option key={t.id} value={t.id}>TXN #{t.id} — ₱{t.total.toFixed(2)} ({t.date})</option>
          ))}
        </select>

        <label className="pos-label">Reason for Post-Void</label>
        <textarea
          className="pos-input"
          style={{ minHeight: '70px', resize: 'vertical' }}
          placeholder="e.g. Customer returned item, wrong product scanned..."
          value={reason}
          onChange={e => setReason(e.target.value)}
        />

        <label className="pos-label">Supervisor PIN</label>
        <input
          type="password"
          className="pos-input"
          placeholder="Enter PIN"
          maxLength={4}
          value={supervisorPin}
          onChange={e => setSupervisorPin(e.target.value)}
        />

        <div className="pos-btn-row" style={{ marginTop: '16px' }}>
          <button className="pos-btn-danger" onClick={handleApprove}>Approve Post-Void</button>
          <button className="pos-btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main POS Components
const POS = () => {
  const [products] = useState(INITIAL_PRODUCTS);
  const { currentUser } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [discountOption, setDiscountOption] = useState(DISCOUNT_OPTIONS[0]);
  const [discountApplied, setDiscountApplied] = useState(false);

  const [showReceipt, setShowReceipt] = useState(false);
  const [showPostVoid, setShowPostVoid] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [isReprint, setIsReprint] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showPostVoidModal, setShowPostVoidModal] = useState(false);
  const [postVoidTarget, setPostVoidTarget] = useState(null);
  const [supervisorPin, setSupervisorPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [completedTransactions, setCompletedTransactions] = useState(
    JSON.parse(localStorage.getItem('completedTransactions')) || []
  );

  const [transactions, setTransactions] = useState([]);
  const [canceledSales, setCanceledSales] = useState([]);

  const txnCounter = useRef(1000);

  // ── Cart Logic ──
  const addToCart = (product) => {
    if (product.status !== 'Active') return;
    setCart(prev => [...prev, { ...product, cartId: Date.now() + Math.random() }]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;


  const voidItem = (cartId) => {
    const item = cart.find(i => i.cartId === cartId);
    if (!item) return;
    const reason = prompt(`Void "${item.name}"?\nEnter reason (required for audit):`);
    if (!reason || !reason.trim()) return alert('Reason is required to void an item.');
    setCart(prev => prev.filter(i => i.cartId !== cartId));
    pushAuditLog({
      user: 'Cashier',
      action: `Void Item: ${item.name}`,
      reason: reason.trim(),
      type: 'void_item',
    });
  };

  // ── Discount Logic ──
  const handleDiscountChange = (e) => {
    const chosen = DISCOUNT_OPTIONS[parseInt(e.target.value)];
    if (discountApplied && discountOption.key !== 'None') {
      alert('A discount has already been applied to this transaction. Only one discount is allowed per sale.');
      e.target.value = DISCOUNT_OPTIONS.findIndex(d => d.key === discountOption.key);
      return;
    }
    setDiscountOption(chosen);
    setDiscountApplied(chosen.key !== 'None');
  };

  // ── Totals ──
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = subtotal * discountOption.value;
  const total = subtotal - discountAmount;
    const reason = prompt("Enter reason for voiding (Required for Audit):");
    if (reason) {
      const item = cart.find(i => i.cartId === cartId);
      setCart(cart.filter(i => i.cartId !== cartId));
      addAuditLog({
        action: LOG_ACTIONS.VOID_ITEM,
        performedBy: currentUser?.username || 'Unknown',
        details: { itemName: item?.name, price: item?.price, reason }
      });
    }
  };


  const handleCancelTransaction = () => {
    if (cart.length === 0) return alert("Cart is already empty!");
    const confirm = window.confirm("Cancel entire transaction? This will be logged.");
    if (!confirm) return;

    addAuditLog({
      action: LOG_ACTIONS.CANCEL_TRANSACTION,
      performedBy: currentUser?.username || 'Unknown',
      details: { itemCount: cart.length, cartSnapshot: cart }
    });

    setCart([]);
    setDiscount(0);
    setDiscountType("None");
  };


  const initiatePostVoid = (transaction) => {
    setPostVoidTarget(transaction);
    setSupervisorPin('');
    setPinError('');
    setShowPostVoidModal(true);
  };


  const confirmPostVoid = () => {
    if (supervisorPin !== SUPERVISOR_PIN) {
      setPinError('Incorrect PIN. Post-void denied.');
      return;
    }

    const updated = completedTransactions.filter(t => t.id !== postVoidTarget.id);
    setCompletedTransactions(updated);
    localStorage.setItem('completedTransactions', JSON.stringify(updated));

    addAuditLog({
      action: LOG_ACTIONS.POST_VOID,
      performedBy: currentUser?.username || 'Unknown',
      details: {
        transactionId: postVoidTarget.id,
        total: postVoidTarget.total,
        approvedBy: 'Supervisor (PIN verified)'
      }
    });

    setShowPostVoidModal(false);
    setPostVoidTarget(null);
    alert('Post-void approved and transaction reversed.');
  };


  const handleReprintReceipt = (transaction) => {
    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
    receiptWindow.document.write(`
      <html>
        <head><title>Receipt Reprint</title></head>
        <body style="font-family:monospace; padding:20px;">
          <h2 style="text-align:center;">SARIPH.POS</h2>
          <p style="text-align:center;">*** REPRINT ***</p>
          <hr/>
          <p>Transaction ID: ${transaction.id}</p>
          <p>Date: ${new Date(transaction.date).toLocaleString()}</p>
          <hr/>
          ${transaction.items.map(i =>
            `<p>${i.name} — ₱${i.price.toFixed(2)}</p>`
          ).join('')}
          <hr/>
          <div style="display:flex; justify-content:space-between;">
            <span>Subtotal:</span><span>₱${transaction.subtotal.toFixed(2)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; color:red;">
            <span>${transaction.discountType}:</span><span>-₱${transaction.discountAmount.toFixed(2)}</span>
          </div>
          <p><strong>TOTAL: ₱${transaction.total.toFixed(2)}</strong></p>
          <p style="text-align:center; margin-top:20px;">Thank you!</p>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();

    addAuditLog({
      action: LOG_ACTIONS.REPRINT_RECEIPT,
      performedBy: currentUser?.username || 'Unknown',
      details: { transactionId: transaction.id, total: transaction.total }
    });
  };

  // ── Checkout ──
  const handleCheckout = () => {
    if (cart.length === 0) return alert('Cart is empty!');
    setShowReceipt(true);
  };

  
  const finalizeTransaction = () => {
    txnCounter.current += 1;
    const txn = {
      id: txnCounter.current,
      items: [...cart],
      subtotal,
      discountKey: discountOption.key,
      discountRate: discountOption.value,
      discountAmount,
      total,
      date: new Date().toLocaleString(),
      cashier: 'Cashier',
      postVoided: false,
    };

    setTransactions(prev => [...prev, txn]);
    completedTransactions = [...completedTransactions, txn];

    pushAuditLog({
      user: 'Cashier',
      action: `Completed Sale TXN #${txn.id}`,
      reason: `Total: ₱${txn.total.toFixed(2)} | Items: ${txn.items.length}`,
      type: 'sale',
    });

    const newTransaction = {
      id: Date.now(),
      items: cart,
      subtotal,
      total,
      discountType,
      discountAmount,
      date: new Date().toISOString()
    };

    const updated = [...completedTransactions, newTransaction];
    setCompletedTransactions(updated);
    localStorage.setItem('completedTransactions', JSON.stringify(updated));
    setLastTransaction(newTransaction);

    alert("Sale Recorded. Printing Receipt...");
    setCart([]);
    setDiscountOption(DISCOUNT_OPTIONS[0]);
    setDiscountApplied(false);
    setShowReceipt(false);
  };

  // ── Sale cancelation ──
  const handleCancelSale = () => {
    if (cart.length === 0) return alert('No active sale to cancel.');
    const confirm = window.confirm('Cancel the entire current sale? This cannot be undone.');
    if (!confirm) return;
    const reason = prompt('Enter reason for cancellation (required for audit):');
    if (!reason || !reason.trim()) return alert('Reason is required.');

    setCanceledSales(prev => [...prev, {
      id: Date.now(), items: [...cart], subtotal, total,
      reason: reason.trim(), date: new Date().toLocaleString(),
    }]);
    pushAuditLog({
      user: 'Cashier',
      action: `Canceled Sale (${cart.length} item${cart.length > 1 ? 's' : ''})`,
      reason: reason.trim(),
      type: 'cancel_sale',
    });

    setCart([]);
    setDiscountOption(DISCOUNT_OPTIONS[0]);
    setDiscountApplied(false);
    alert('Sale canceled and logged for audit.');
  };

  // ── Reprint ──
  const handleReprint = () => {
    if (transactions.length === 0) return alert('No completed transactions to reprint.');
    const last = transactions[transactions.length - 1];
    pushAuditLog({
      user: 'Cashier',
      action: `Reprint Receipt TXN #${last.id}`,
      reason: 'Customer requested replacement copy',
      type: 'reprint',
    });
    setViewingReceipt(last);
    setIsReprint(true);
  };

  // ── POST VOID ──
  const handlePostVoidApprove = (txnId, reason) => {
    setTransactions(prev =>
      prev.map(t => t.id === txnId ? { ...t, postVoided: true } : t)
    );
    completedTransactions = completedTransactions.map(t =>
      t.id === txnId ? { ...t, postVoided: true } : t
    );
    pushAuditLog({
      user: 'Supervisor',
      action: `Post-Void Approved TXN #${txnId}`,
      reason,
      type: 'post_void',
    });
    alert(`Transaction #${txnId} has been post-voided. Records reversed.`);
    setShowPostVoid(false);
  };

  const activeProducts = products.filter(p => p.status === 'Active');
  const lastTxn = transactions[transactions.length - 1];

  return (
    <div className="pos-wrapper">

      {/* ── LEFT: Product Grid ── */}
      <div className="pos-product-panel">
        <div className="pos-panel-header">
          <span className="pos-panel-title">🛒 Products</span>
        </div>

        <div className="pos-product-grid">
          {activeProducts.map(p => (
            <button key={p.id} className="pos-product-btn" onClick={() => addToCart(p)}>
              <span className="pos-product-name">{p.name}</span>
              <span className="pos-product-price">₱{p.price.toFixed(2)}</span>
            </button>
          ))}
        </div>

        <div className="pos-action-row">
          <button className="pos-btn-secondary" onClick={handleReprint}>🖨 Reprint Last</button>
          <button
            className="pos-btn-secondary"
            style={{ color: '#e74c3c', borderColor: '#e74c3c' }}
            onClick={() => setShowPostVoid(true)}
          >
            🔒 Post-Void
          </button>
        </div>
      </div>

      {/* ── RIGHT: Cart & Checkout ── */}
      <div className="pos-cart-panel">
        <div className="pos-panel-header">
          <span className="pos-panel-title">📋 Current Sale</span>
          <span className="pos-cart-count">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="pos-cart-list">
          {cart.length === 0 ? (
            <div className="pos-empty-cart">No items added yet</div>
          ) : (
            cart.map(item => (
              <div key={item.cartId} className="pos-cart-item">
                <div className="pos-cart-item-info">
                  <span className="pos-cart-item-name">{item.name}</span>
                  <span className="pos-cart-item-price">₱{item.price.toFixed(2)}</span>
                </div>
                <button className="pos-void-btn" onClick={() => voidItem(item.cartId)} title="Void Item">✕</button>
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '20px', filter: showReceipt || showPostVoidModal ? 'blur(4px)' : 'none' }}>

        {/* LEFT: INVENTORY */}
        <div className="card" style={{ flex: 2 }}>
          <h3>Inventory Selection</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
            {products.map(p => (
              <button key={p.id} className="btn" onClick={() => addToCart(p)}>
                {p.name} <br /> ₱{p.price.toFixed(2)}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: CART & TOTALS */}
        <div className="card" style={{ flex: 1 }}>
          <h3>Current Sale</h3>
          <div style={{ minHeight: '200px', borderBottom: '1px solid #000', marginBottom: '10px' }}>
            {cart.map(item => (
              <div key={item.cartId} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                <span>{item.name}</span>
                <span>
                  ₱{item.price.toFixed(2)}{' '}
                  <button
                    onClick={() => voidItem(item.cartId)}
                    style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    [X]
                  </button>
                </span>
              </div>
            ))
          )}
        </div>

        <div className="pos-discount-section">
          <label className="pos-label">Discount Type</label>
          <select
            className="pos-select"
            onChange={handleDiscountChange}
            value={DISCOUNT_OPTIONS.findIndex(d => d.key === discountOption.key)}
          <p>Subtotal: ₱{subtotal.toFixed(2)}</p>
          <select
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setDiscount(val);
              setDiscountType(e.target.options[e.target.selectedIndex].text);
            }}
            style={{ margin: '10px 0' }}
          >
            {DISCOUNT_OPTIONS.map((opt, idx) => (
              <option key={opt.key} value={idx}>{opt.label}</option>
            ))}
          </select>
          {discountApplied && (
            <div className="pos-discount-badge">✔ {discountOption.key} discount applied</div>
          )}
        </div>

        <div className="pos-totals-section">
          <div className="pos-total-row">
            <span>Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>
          {discountOption.value > 0 && (
            <div className="pos-total-row discount">
              <span>{discountOption.key} ({(discountOption.value * 100).toFixed(0)}% off)</span>
              <span>-₱{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="pos-grand-total">
            <span>TOTAL</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
          <h2 style={{ background: '#000', color: '#fff', padding: '10px', textAlign: 'center' }}>
            ₱{total.toFixed(2)}
          </h2>

          <button
            className="btn btn-dark"
            style={{ width: '100%', marginTop: '10px' }}
            onClick={handleCompleteSale}
          >
            CHECKOUT
          </button>

          {/* ✅ NEW: Cancel Transaction button */}
          <button
            onClick={handleCancelTransaction}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '10px',
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            CANCEL TRANSACTION
          </button>
        </div>

        <div className="pos-btn-row">
          <button className="pos-btn-checkout" onClick={handleCheckout}>✓ CHECKOUT</button>
          <button className="pos-btn-cancel" onClick={handleCancelSale}>✕ CANCEL</button>
        </div>

        {lastTxn && (
          <div className="pos-last-txn-banner">
            Last: TXN #{lastTxn.id} — ₱{lastTxn.total.toFixed(2)}
            {lastTxn.postVoided && <span className="voided">[VOIDED]</span>}
          </div>
        )}
      </div>

      {/* ── checkout confirmation ── */}
      {showReceipt && (
        <div className="pos-overlay">
          <div className="pos-modal" style={{ maxWidth: '340px' }}>
            <h2 className="pos-modal-title">Confirm Sale</h2>
            <div style={{ marginBottom: '16px', fontSize: '14px' }}>
      {/* ✅ NEW: Recent Transactions (for Post-Void & Reprint) */}
      {completedTransactions.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Recent Transactions</h3>
          {[...completedTransactions].reverse().slice(0, 5).map(t => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid #eee'
              }}
            >
              <span style={{ fontSize: '13px' }}>
                #{t.id} — ₱{t.total.toFixed(2)} — {new Date(t.date).toLocaleString()}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleReprintReceipt(t)}
                  style={{
                    padding: '5px 10px',
                    background: '#0d6efd',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  🖨 Reprint
                </button>
                <button
                  onClick={() => initiatePostVoid(t)}
                  style={{
                    padding: '5px 10px',
                    background: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  🚫 Post-Void
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RECEIPT MODAL OVERLAY (unchanged) */}
      {showReceipt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 100
        }}>
          <div className="card" style={{
            width: '300px', background: '#fff',
            padding: '30px', textAlign: 'center',
            boxShadow: '0 0 20px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ borderBottom: '2px dashed #000', paddingBottom: '5px' }}>SARIPH RECEIPT</h2>
            <p style={{ fontSize: '12px' }}>{new Date().toLocaleDateString()}</p>

            <div style={{ textAlign: 'left', margin: '20px 0', fontSize: '14px' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span>{item.name}</span>
                  <span>₱{item.price.toFixed(2)}</span>
                </div>
              ))}
              <hr style={{ margin: '8px 0', border: '1px dashed #ddd' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span>
              </div>
              {discountOption.value > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e74c3c' }}>
                  <span>{discountOption.key}</span><span>-₱{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '18px', marginTop: '6px' }}>
                <span>TOTAL</span><span>₱{total.toFixed(2)}</span>
              </div>
            </div>
            <div className="pos-btn-row">
              <button className="pos-btn-checkout" onClick={finalizeTransaction}>🖨 Print & Confirm</button>
              <button className="pos-btn-secondary" onClick={() => setShowReceipt(false)}>Back</button>
                <span>Subtotal:</span><span>₱{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'red' }}>
                <span>{discountType}:</span><span>-₱{discountAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginTop: '10px' }}>
                <span>TOTAL:</span><span>₱{total.toFixed(2)}</span>
              </div>
            </div>

            <button className="btn btn-dark" style={{ width: '100%' }} onClick={finalizeTransaction}>
              PRINT & CLOSE
            </button>
            <button
              className="btn"
              style={{ width: '100%', marginTop: '5px', border: 'none' }}
              onClick={() => setShowReceipt(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ✅ NEW: POST-VOID SUPERVISOR MODAL */}
      {showPostVoidModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#fff', padding: '2rem', borderRadius: '10px',
            width: '90%', maxWidth: '380px', textAlign: 'center',
            border: '3px solid #000', boxShadow: '8px 8px 0 #000'
          }}>
            <h2 style={{ marginBottom: '0.5rem' }}>🔐 Supervisor Approval</h2>
            <p style={{ marginBottom: '1rem', color: '#555' }}>
              Post-void requires supervisor PIN.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              Transaction: <strong>#{postVoidTarget?.id}</strong> — ₱{postVoidTarget?.total?.toFixed(2)}
            </p>
            <input
              type="password"
              placeholder="Enter Supervisor PIN"
              value={supervisorPin}
              onChange={(e) => setSupervisorPin(e.target.value)}
              style={{
                width: '100%', padding: '10px', fontSize: '1.1rem',
                border: '2px solid #000', marginBottom: '0.5rem'
              }}
            />
            {pinError && (
              <p style={{ color: 'red', marginBottom: '0.5rem' }}>{pinError}</p>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
              <button
                onClick={confirmPostVoid}
                style={{
                  flex: 1, background: '#000', color: '#fff',
                  padding: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer'
                }}
              >
                Confirm Void
              </button>
              <button
                onClick={() => setShowPostVoidModal(false)}
                style={{
                  flex: 1, background: '#ccc', color: '#000',
                  padding: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── receipt (Reprint) ── */}
      {viewingReceipt && (
        <Receipt
          transaction={viewingReceipt}
          isReprint={isReprint}
          onClose={() => { setViewingReceipt(null); setIsReprint(false); }}
        />
      )}

      {/* void modal */}
      {showPostVoid && (
        <PostVoidModal
          transactions={transactions}
          onApprove={handlePostVoidApprove}
          onClose={() => setShowPostVoid(false)}
        />
      )}

    </div>
  );
};

export default POS;