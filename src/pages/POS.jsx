import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { addAuditLog, LOG_ACTIONS } from '../utils/AuditLog.jsx';

const SUPERVISOR_PIN = '1234';

const POS = () => {
  const { currentUser } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("None");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [showPostVoidModal, setShowPostVoidModal] = useState(false);
  const [postVoidTarget, setPostVoidTarget] = useState(null);
  const [supervisorPin, setSupervisorPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [completedTransactions, setCompletedTransactions] = useState(
    JSON.parse(localStorage.getItem('completedTransactions')) || []
  );

  const products = [
    { id: 1, name: 'Notebook', price: 25 },
    { id: 2, name: 'Ballpen', price: 12 },
    { id: 3, name: 'Cooking Oil', price: 55 },
    { id: 4, name: 'Sari-Sari Bread', price: 15 }
  ];

  const addToCart = (p) => setCart([...cart, { ...p, cartId: Date.now() }]);

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;


  const voidItem = (cartId) => {
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

  const handleCompleteSale = () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setShowReceipt(true);
  };

  
  const finalizeTransaction = () => {
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
    setDiscount(0);
    setDiscountType("None");
    setShowReceipt(false);
  };

  return (
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
            ))}
          </div>

          <p>Subtotal: ₱{subtotal.toFixed(2)}</p>
          <select
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setDiscount(val);
              setDiscountType(e.target.options[e.target.selectedIndex].text);
            }}
            style={{ margin: '10px 0' }}
          >
            <option value="0">No Discount</option>
            <option value="0.20">Senior Citizen (20%)</option>
            <option value="0.20">PWD (20%)</option>
            <option value="0.20">Athlete (20%)</option>
            <option value="0.10">Solo Parent (10%)</option>
          </select>

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
      </div>

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
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.name}</span>
                  <span>₱{item.price.toFixed(2)}</span>
                </div>
              ))}
              <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #000' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
    </div>
  );
};

export default POS;