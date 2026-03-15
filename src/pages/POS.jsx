import React, { useState } from 'react';

const POS = () => {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("None");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  const products = [
    { id: 1, name: 'Notebook', price: 25 },
    { id: 2, name: 'Ballpen', price: 12 },
    { id: 3, name: 'Cooking Oil', price: 55 },
    { id: 4, name: 'Sari-Sari Bread', price: 15 }
  ];

  const addToCart = (p) => setCart([...cart, { ...p, cartId: Date.now() }]);

  const voidItem = (cartId) => {
    const reason = prompt("Enter reason for voiding (Required for Audit):");
    if (reason) setCart(cart.filter(item => item.cartId !== cartId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;

  const handleCompleteSale = () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setShowReceipt(true);
  };

  const finalizeTransaction = () => {
    setLastTransaction({ 
      items: cart, 
      total, 
      discountType, 
      discountAmount, 
      date: new Date().toLocaleString() 
    });
    alert("Sale Recorded. Printing Receipt...");
    setCart([]);
    setDiscount(0);
    setDiscountType("None");
    setShowReceipt(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '20px', filter: showReceipt ? 'blur(4px)' : 'none' }}>
        
        {/* LEFT: INVENTORY */}
        <div className="card" style={{ flex: 2 }}>
          <h3>Inventory Selection</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
            {products.map(p => (
              <button key={p.id} className="btn" onClick={() => addToCart(p)}>
                {p.name} <br/> ₱{p.price.toFixed(2)}
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
                <span>₱{item.price.toFixed(2)} <button onClick={() => voidItem(item.cartId)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>[X]</button></span>
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
          <button className="btn btn-dark" style={{ width: '100%', marginTop: '10px' }} onClick={handleCompleteSale}>
            CHECKOUT
          </button>
        </div>
      </div>

      {/* RECEIPT MODAL OVERLAY */}
      {showReceipt && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '300px', background: '#fff', padding: '30px', textAlign: 'center', boxShadow: '0 0 20px rgba(0,0,0,0.3)' }}>
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
                <span>Subtotal:</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'red' }}>
                <span>{discountType}:</span>
                <span>-₱{discountAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginTop: '10px' }}>
                <span>TOTAL:</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
            </div>

            <button className="btn btn-dark" style={{ width: '100%' }} onClick={finalizeTransaction}>PRINT & CLOSE</button>
            <button className="btn" style={{ width: '100%', marginTop: '5px', border: 'none' }} onClick={() => setShowReceipt(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;