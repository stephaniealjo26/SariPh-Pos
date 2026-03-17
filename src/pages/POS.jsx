import React, { useState } from 'react';
import '../index.css';

const products = [
  { id: 1,  name: 'Notebook',        price: 25,  stock: 50,  category: 'School' },
  { id: 2,  name: 'Ballpen',         price: 12,  stock: 100, category: 'School' },
  { id: 3,  name: 'Cooking Oil',     price: 55,  stock: 15,  category: 'Grocery' },
  { id: 4,  name: 'Sari-Sari Bread', price: 15,  stock: 30,  category: 'Grocery' },
  { id: 5,  name: 'Instant Noodles', price: 14,  stock: 80,  category: 'Grocery' },
  { id: 6,  name: 'Canned Sardines', price: 22,  stock: 45,  category: 'Grocery' },
  { id: 7,  name: 'Shampoo Sachet',  price: 8,   stock: 200, category: 'Personal' },
  { id: 8,  name: 'Soap Bar',        price: 18,  stock: 60,  category: 'Personal' },
  { id: 9,  name: 'Coffee Sachet',   price: 7,   stock: 150, category: 'Beverage' },
  { id: 10, name: 'Juice Drink',     price: 12,  stock: 90,  category: 'Beverage' },
  { id: 11, name: 'Rice (per kilo)', price: 52,  stock: 100, category: 'Grocery' },
  { id: 12, name: 'Egg (per piece)', price: 9,   stock: 200, category: 'Grocery' },
  { id: 13, name: 'Pencil',          price: 8,   stock: 120, category: 'School' },
  { id: 14, name: 'Vinegar (small)', price: 15,  stock: 40,  category: 'Grocery' },
  { id: 15, name: 'Mineral Water',   price: 20,  stock: 75,  category: 'Beverage' },
  { id: 16, name: 'Toothpaste',      price: 35,  stock: 30,  category: 'Personal' },
];

const categories = ['All', 'Grocery', 'Beverage', 'School', 'Personal'];

const categoryIcons = {
  School:   '📚',
  Grocery:  '🛒',
  Personal: '🧴',
  Beverage: '☕',
};

const POS = () => {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountLabel, setDiscountLabel] = useState('No discount');
  const [showReceipt, setShowReceipt] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = products.filter(p =>
    (activeCategory === 'All' || p.category === activeCategory) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (p) => setCart(prev => {
    const existing = prev.find(i => i.id === p.id);
    if (existing) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
    return [...prev, { ...p, qty: 1, cartId: Date.now() }];
  });

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const voidItem = (id) => {
    const reason = prompt('Enter reason for voiding (required for audit):');
    if (reason) removeFromCart(id);
  };

  const changeQty = (id, delta) => {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    );
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;

  const finalizeSale = () => {
    alert('Sale recorded. Printing receipt…');
    setCart([]);
    setDiscount(0);
    setDiscountLabel('No discount');
    setShowReceipt(false);
  };

  return (
    <div className="pos-root">

      {/* LEFT — Inventory */}
      <div className="pos-inventory">

        {/* Search */}
        <div className="pos-search-wrap">
          <svg className="pos-search-icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="15" height="15">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"/>
          </svg>
          <input
            className="pos-search-input"
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className="cat-tabs">
          {categories.map(c => (
            <button
              key={c}
              className={`cat-tab ${activeCategory === c ? 'active' : ''}`}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="prod-grid">
          {filtered.map(p => (
            <button key={p.id} className="prod-card" onClick={() => addToCart(p)}>
              <div className="prod-card-icon">{categoryIcons[p.category]}</div>
              <span className="prod-name">{p.name}</span>
              <span className="prod-price">₱{p.price.toFixed(2)}</span>
              <span className="prod-stock">{p.stock} in stock</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="prod-empty">No products found</div>
          )}
        </div>
      </div>

      {/* RIGHT — Cart */}
      <div className="pos-cart">
        <div className="cart-header">
          <span className="sec-label" style={{ marginBottom: 0 }}>Current order</span>
          {cart.length > 0 && (
            <span className="cart-count">{cart.reduce((s,i) => s + i.qty, 0)} items</span>
          )}
        </div>

        <div className="cart-items-wrap">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              No items added yet
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="ci-info">
                  <div className="ci-name">{item.name}</div>
                  <div className="ci-price">₱{item.price.toFixed(2)} each</div>
                </div>
                <div className="ci-controls">
                  <button className="qty-btn" onClick={() => changeQty(item.id, -1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => changeQty(item.id, 1)}>+</button>
                </div>
                <div className="ci-total">₱{(item.price * item.qty).toFixed(2)}</div>
                <button className="ci-void" onClick={() => voidItem(item.id)}>✕</button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="summary-row">
            <span>Subtotal</span>
            <span className="mono">₱{subtotal.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="summary-row green">
              <span>{discountLabel}</span>
              <span className="mono">−₱{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <select
            className="sp-select"
            onChange={e => {
              setDiscount(parseFloat(e.target.value));
              setDiscountLabel(e.target.options[e.target.selectedIndex].dataset.lbl);
            }}
          >
            <option value="0"    data-lbl="No discount">No discount</option>
            <option value="0.20" data-lbl="Senior Citizen (20%)">Senior Citizen (20%)</option>
            <option value="0.20" data-lbl="PWD (20%)">PWD (20%)</option>
            <option value="0.20" data-lbl="Athlete (20%)">Athlete (20%)</option>
            <option value="0.10" data-lbl="Solo Parent (10%)">Solo Parent (10%)</option>
          </select>

          <div className="total-strip">
            <div className="ts-label">Total</div>
            <span className="ts-amount">₱{total.toFixed(2)}</span>
          </div>

          <button
            className="btn-checkout"
            onClick={() => { if (cart.length === 0) { alert('Cart is empty!'); return; } setShowReceipt(true); }}
          >
            Proceed to checkout
          </button>
        </div>
      </div>

      {/* RECEIPT MODAL */}
      {showReceipt && (
        <div className="receipt-backdrop">
          <div className="receipt-modal">
            <div className="receipt-top">
              <div className="receipt-brand">SARIPH RECEIPT</div>
              <div className="receipt-date">{new Date().toLocaleString()}</div>
            </div>
            <div className="receipt-body">
              {cart.map((item, idx) => (
                <div key={idx} className="r-item">
                  <span>{item.name} × {item.qty}</span>
                  <span className="mono">₱{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <hr className="r-div" />
              <div className="r-sub"><span>Subtotal</span><span className="mono">₱{subtotal.toFixed(2)}</span></div>
              {discountAmount > 0 && (
                <div className="r-disc"><span>{discountLabel}</span><span className="mono">−₱{discountAmount.toFixed(2)}</span></div>
              )}
              <div className="r-total"><span>Total</span><span className="mono">₱{total.toFixed(2)}</span></div>
            </div>
            <div className="receipt-actions">
              <button className="btn-print" onClick={finalizeSale}>Print & close</button>
              <button className="btn-cancel" onClick={() => setShowReceipt(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;