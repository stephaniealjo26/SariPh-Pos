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

  // --- BRANDING COLORS ---
  const colors = {
    primary: '#7c4dff', // The vibrant purple from your login button
    background: '#1a122e', // The dark purple/black background
    surface: '#ffffff',
    border: '#e0e0e0',
    textMain: '#2d2d2d',
    textMuted: '#757575'
  };

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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 24, padding: 32, background: colors.background, color: '#fff' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>✓</div>
        <h2>Order sent to cashier!</h2>
        <p>Please proceed to the counter.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8f9fd', fontFamily: 'Inter, sans-serif' }}>
      
      {/* MAIN SHOPPING AREA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        
        {/* TOP SEARCH BAR */}
        <input 
          className="db-input" 
          placeholder="🔍 Search products..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            fontSize: '16px',
            marginBottom: '20px',
            outline: 'none',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}
        />

        {/* CATEGORY FILTER - Updated to Primary Purple */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '24px' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setCategory(cat)} 
              style={{ 
                padding: '8px 18px', 
                borderRadius: 99, 
                border: 'none', 
                background: category === cat ? colors.primary : '#fff', 
                color: category === cat ? '#fff' : colors.textMain, 
                cursor: 'pointer', 
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                transition: '0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCTS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
          {filtered.map(product => {
            const inCart = cartItem(product.id);
            return (
              <div key={product.id} style={{ 
                background: colors.surface, 
                borderRadius: 16, 
                padding: 16, 
                boxShadow: inCart ? `0 0 0 2px ${colors.primary}` : '0 4px 15px rgba(0,0,0,0.05)',
                transition: '0.3s transform',
                position: 'relative'
              }}>
                <div style={{ width: '100%', height: 130, background: '#f5f5f5', borderRadius: 12, overflow: 'hidden', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src={product.image || FALLBACK_IMAGE}
                        alt={product.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                        style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                    />
                </div>

                <div style={{ fontWeight: 700, fontSize: 15, color: colors.textMain }}>{product.name}</div>
                <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 8 }}>{product.category}</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontWeight: 800, color: colors.primary, fontSize: 18 }}>{peso(product.price)}</span>
                  <span style={{ fontSize: 11, color: colors.textMuted }}>Stock: {product.stock}</span>
                </div>

                {inCart ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0ebff', padding: '6px', borderRadius: '8px' }}>
                    <button onClick={() => updateQty(product.id, inCart.qty - 1, product.stock)} style={qtyBtn}>−</button>
                    <span style={{ fontWeight: 700, color: colors.primary }}>{inCart.qty}</span>
                    <button onClick={() => updateQty(product.id, inCart.qty + 1, product.stock)} style={qtyBtn} disabled={inCart.qty >= product.stock}>+</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAddItem(product)} 
                    disabled={product.stock === 0} 
                    style={{ 
                      ...addBtn, 
                      background: colors.primary,
                      opacity: product.stock === 0 ? 0.5 : 1, 
                      cursor: product.stock === 0 ? 'not-allowed' : 'pointer' 
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

      {/* RIGHT SIDEBAR - CART (Styled to match the Login sidebar) */}
      <div style={{ 
        width: 360, 
        background: colors.background, 
        color: '#fff',
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '20px', fontWeight: 700 }}>
          🛒 My Basket <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.7 }}>({orderItemCount} items)</span>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {!order?.items?.length ? (
            <div style={{ textAlign: 'center', marginTop: '40px', opacity: 0.5 }}>
                <p>Your basket is empty</p>
            </div>
          ) : (
            order.items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{item.qty} × {peso(item.price)}</div>
                </div>
                <button onClick={() => removeItem(item.id)} style={{ border: 'none', background: 'rgba(255,0,0,0.1)', color: '#ff6b6b', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer' }}>✕</button>
              </div>
            ))
          )}
        </div>

        {orderItemCount > 0 && (
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: '16px', opacity: 0.8 }}>Total Amount</span>
              <strong style={{ fontSize: '22px', color: colors.primary }}>{peso(orderSubtotal)}</strong>
            </div>
            
            <button onClick={sendToCashier} style={{ ...sendBtn, background: colors.primary }}>
              ✓ Send to Cashier
            </button>
            
            <button onClick={cancelOrder} style={{ ...clearBtn, color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
              Clear Basket
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- UPDATED STYLES ---
const qtyBtn = { 
  width: 32, 
  height: 32, 
  borderRadius: 8, 
  border: 'none', 
  background: '#fff', 
  color: '#7c4dff',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const addBtn = { 
  width: '100%', 
  padding: '12px', 
  borderRadius: 10, 
  border: 'none', 
  color: '#fff', 
  fontWeight: 700,
  fontSize: '14px',
  transition: '0.2s'
};

const sendBtn = { 
  width: '100%', 
  padding: '16px', 
  borderRadius: 12, 
  border: 'none', 
  color: '#fff', 
  fontWeight: 700, 
  fontSize: '16px',
  cursor: 'pointer',
  marginBottom: 10,
  boxShadow: '0 4px 15px rgba(124, 77, 255, 0.3)'
};

const clearBtn = { 
  width: '100%', 
  padding: '12px', 
  borderRadius: 12, 
  background: 'transparent', 
  border: '1px solid', 
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '14px'
};

export default UserShop;