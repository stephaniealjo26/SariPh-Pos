import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useOrder } from '../context/OrderContext';

const peso = (n) => `₱${Number(n).toFixed(2)}`;
const FALLBACK_IMAGE = "https://dummyimage.com/300x300/e0e0e0/000000.png&text=No+Image";

const UserShop = () => {
  const { currentUser } = useAuth();
  const { activeProducts = [] } = useProducts();
  const { order, isWaitingForCashier, orderItemCount, orderSubtotal, startOrder, addItem, removeItem, updateQty, sendToCashier, cancelOrder } = useOrder();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = [...new Set(activeProducts.map(p => p.category))].sort();
    return ['All', ...cats];
  }, [activeProducts]);

  const filtered = useMemo(() => {
    return activeProducts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
      const matchCat = category === 'All' || p.category === category;
      return matchSearch && matchCat;
    });
  }, [activeProducts, search, category]);

  const handleAddItem = (product) => {
    if (!order) startOrder(currentUser?.username || 'Guest');
    setTimeout(() => addItem(product), 0);
  };

  const cartItem = (id) => order?.items?.find(i => i.id === id);

  if (isWaitingForCashier) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 24, padding: 32 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>✓</div>
        <h2>Order sent to cashier!</h2>
        <p style={{ color: 'var(--ink3)' }}>Please proceed to the counter.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        <input className="db-input" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} />

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '16px 0' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '5px 14px', borderRadius: 99, border: 'none', background: category === cat ? 'var(--accent)' : 'var(--surface)', color: category === cat ? '#fff' : 'var(--ink2)', cursor: 'pointer', fontSize: 12 }}>
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
          {filtered.map(product => {
            const inCart = cartItem(product.id);
            return (
              <div key={product.id} style={{ background: 'var(--surface)', borderRadius: 12, padding: 14, border: inCart ? '2px solid var(--accent)' : '1px solid var(--border)' }}>
                {/* IMAGE CONTAINER FIX */}
                <div style={{ width: '100%', height: 110, background: '#f5f5f5', borderRadius: 10, overflow: 'hidden', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src={product.image || FALLBACK_IMAGE}
                        alt={product.name}
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = FALLBACK_IMAGE;
                        }}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                </div>

                <div style={{ fontWeight: 700, fontSize: 13 }}>{product.name}</div>
                <div style={{ fontSize: 10, color: 'var(--ink3)' }}>{product.category}</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
                  <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{peso(product.price)}</span>
                  <span style={{ fontSize: 10, color: 'var(--ink3)' }}>Stock: {product.stock}</span>
                </div>

                {inCart ? (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                    <button onClick={() => updateQty(product.id, inCart.qty - 1, product.stock)} style={qtyBtn}>−</button>
                    <span style={{ fontWeight: 700 }}>{inCart.qty}</span>
                    <button onClick={() => updateQty(product.id, inCart.qty + 1, product.stock)} style={qtyBtn} disabled={inCart.qty >= product.stock}>+</button>
                  </div>
                ) : (
                  <button onClick={() => handleAddItem(product)} disabled={product.stock === 0} style={{ ...addBtn, opacity: product.stock === 0 ? 0.5 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}>
                    {product.stock === 0 ? 'Out of Stock' : '+ Add to basket'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CART SIDEBAR */}
      <div style={{ width: 320, borderLeft: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)', fontWeight: 700 }}>🛒 My Basket ({orderItemCount})</div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
          {!order?.items?.length ? (
            <p style={{ textAlign: 'center', color: 'var(--ink3)' }}>Your basket is empty</p>
          ) : (
            order.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink3)' }}>{item.qty} × {peso(item.price)}</div>
                </div>
                <button onClick={() => removeItem(item.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
              </div>
            ))
          )}
        </div>
        {orderItemCount > 0 && (
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span>Total</span>
              <strong>{peso(orderSubtotal)}</strong>
            </div>
            <button onClick={sendToCashier} style={sendBtn}>✓ Send to Cashier</button>
            <button onClick={cancelOrder} style={clearBtn}>Clear Basket</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ... STYLES (Keep existing styles from original code)
const qtyBtn = { width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', fontWeight: 700 };
const addBtn = { width: '100%', padding: '7px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700 };
const sendBtn = { width: '100%', padding: 12, borderRadius: 10, background: '#22c55e', border: 'none', color: '#fff', fontWeight: 700, marginBottom: 8 };
const clearBtn = { width: '100%', padding: 12, borderRadius: 10, background: 'transparent', border: '1px solid var(--border)', fontWeight: 700 };

export default UserShop;