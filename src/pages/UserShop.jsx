import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useOrder } from '../context/OrderContext';

const peso = (n) => `₱${Number(n).toFixed(2)}`;

const UserShop = () => {
  const { currentUser } = useAuth();
  const { activeProducts = [] } = useProducts();
  const {
    order,
    isWaitingForCashier,
    orderItemCount,
    orderSubtotal,
    startOrder,
    addItem,
    removeItem,
    updateQty,
    sendToCashier,
    cancelOrder,
  } = useOrder();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = [...new Set(activeProducts.map(p => p.category))].sort();
    return ['All', ...cats];
  }, [activeProducts]);

  const filtered = useMemo(() => {
    return activeProducts.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search);
      const matchCat = category === 'All' || p.category === category;
      return matchSearch && matchCat;
    });
  }, [activeProducts, search, category]);

  // ✅ FIX: Check if order exists BEFORE calling startOrder,
  // and do it in one atomic step using setOrder-style logic
  const handleAddItem = (product) => {
    if (!order) {
      startOrder(currentUser?.username || 'Guest');
    }
    // Use setTimeout(0) so startOrder state update settles before addItem reads it
    setTimeout(() => addItem(product), 0);
  };

  const cartItem = (id) => order?.items?.find(i => i.id === id);

  // ── Waiting screen (order sent to cashier) ────────────────────────────────
  if (isWaitingForCashier) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '80vh', gap: 24, padding: 32,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: '#dcfce7',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
        }}>✓</div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>Order sent to cashier!</h2>
          <p style={{ color: 'var(--ink3)', fontSize: 14 }}>
            Please proceed to the counter. The cashier is reviewing your basket.
          </p>
        </div>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 20, width: '100%', maxWidth: 400,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Summary of items</div>
          {order?.items?.map(item => (
            <div key={item.id} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13,
            }}>
              <span>{item.name} <span style={{ color: 'var(--ink3)' }}>×{item.qty}</span></span>
              <span style={{ fontWeight: 600 }}>{peso(item.price * item.qty)}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            paddingTop: 12, fontWeight: 700, fontSize: 15,
          }}>
            <span>Total to Pay</span>
            <span style={{ color: 'var(--accent)' }}>{peso(orderSubtotal)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink3)', fontSize: 12 }}>
          <span className="pulse-dot" />
          Awaiting Cashier Action...
        </div>
        <style>{`
          .pulse-dot {
            display: inline-block; width: 8px; height: 8px;
            border-radius: 50%; background: #22c55e;
            animation: pulse 1.5s ease-in-out infinite;
          }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        `}</style>
      </div>
    );
  }

  // ── Main shop view ────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* LEFT — Product grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <input
          className="db-input"
          placeholder="🔍 Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '16px 0' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '5px 14px', borderRadius: 99, fontSize: 12, border: 'none',
              background: category === cat ? 'var(--accent)' : 'var(--surface)',
              color: category === cat ? '#fff' : 'var(--ink2)',
              cursor: 'pointer',
            }}>{cat}</button>
          ))}
        </div>

        {/* Product cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: 12,
        }}>
          {filtered.length === 0 && (
            <p style={{ color: 'var(--ink3)', gridColumn: '1/-1' }}>No products found.</p>
          )}
          {filtered.map(product => {
            const inCart = cartItem(product.id);
            return (
              <div key={product.id} style={{
                background: 'var(--surface)', borderRadius: 12, padding: 14,
                border: inCart ? '2px solid var(--accent)' : '1px solid var(--border)',
              }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{product.name}</div>
                <div style={{ fontSize: 10, color: 'var(--ink3)', marginBottom: 4 }}>{product.category}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
                  <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{peso(product.price)}</span>
                  <span style={{ fontSize: 10, color: 'var(--ink3)' }}>Stock: {product.stock}</span>
                </div>

                {inCart ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                    <button
                      onClick={() => updateQty(product.id, inCart.qty - 1, product.stock)}
                      style={qtyBtn}
                    >−</button>
                    <span style={{ fontWeight: 700 }}>{inCart.qty}</span>
                    <button
                      onClick={() => updateQty(product.id, inCart.qty + 1, product.stock)}
                      style={qtyBtn}
                      disabled={inCart.qty >= product.stock}
                    >+</button>
                  </div>
                ) : (
                  <button
                    disabled={product.stock === 0}
                    onClick={() => handleAddItem(product)}
                    style={{
                      ...addBtn,
                      opacity: product.stock === 0 ? 0.5 : 1,
                      cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {product.stock === 0 ? 'Out of Stock' : '+ Add to basket'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT — Basket */}
      <div style={{
        width: 320, borderLeft: '1px solid var(--border)',
        background: 'var(--surface)', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
          🛒 My Basket ({orderItemCount})
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
          {!order || order?.items?.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--ink3)', marginTop: 40 }}>
              Your basket is empty
            </p>
          ) : (
            order.items.map(item => (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid var(--bg)',
              }}>
                <div style={{ fontSize: 12 }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ color: 'var(--ink3)' }}>{item.qty} × {peso(item.price)}</div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
                >✕</button>
              </div>
            ))
          )}
        </div>

        {orderItemCount > 0 && (
          <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
              <span style={{ color: 'var(--ink2)' }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 18 }}>{peso(orderSubtotal)}</span>
            </div>
            <button onClick={sendToCashier} style={sendBtn}>✓ Send to Cashier</button>
            <button onClick={cancelOrder} style={clearBtn}>Clear Basket</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const qtyBtn = {
  width: 28, height: 28, borderRadius: 6,
  border: '1px solid var(--border)', cursor: 'pointer',
  background: 'var(--surface)', fontWeight: 700,
};

const addBtn = {
  width: '100%', padding: '7px', borderRadius: 8,
  border: 'none', background: 'var(--accent)',
  color: '#fff', fontWeight: 700,
};

const sendBtn = {
  width: '100%', padding: 12, borderRadius: 10,
  background: '#22c55e', border: 'none',
  color: '#fff', fontWeight: 700, cursor: 'pointer', marginBottom: 8,
};

const clearBtn = {
  width: '100%', padding: 12, borderRadius: 10,
  background: 'transparent', border: '1px solid var(--border)',
  color: 'var(--ink2)', fontWeight: 700, cursor: 'pointer',
};

export default UserShop;