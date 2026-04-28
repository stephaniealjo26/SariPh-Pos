import { createContext, useState, useContext, useEffect } from "react";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [order, setOrder] = useState(() => {
    try {
      const saved = localStorage.getItem("sariph_pending_order");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (order) {
      localStorage.setItem("sariph_pending_order", JSON.stringify(order));
    } else {
      localStorage.removeItem("sariph_pending_order");
    }
  }, [order]);

  useEffect(() => {
    const syncAcrossTabs = (e) => {
      if (e.key === "sariph_pending_order") {
        setOrder(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener("storage", syncAcrossTabs);
    return () => window.removeEventListener("storage", syncAcrossTabs);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const startOrder = (username = "Guest") => {
    setOrder({
      status: 'pending',
      user: username,
      items: [],
      createdAt: new Date().toISOString()
    });
  };

  const addItem = (product, qty = 1) => {
    setOrder(prev => {
      if (!prev || prev.status !== 'pending') return prev;
      const existing = prev.items.find(i => i.id === product.id);
      const items = existing
        ? prev.items.map(i => i.id === product.id
            ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
            : i)
        : [...prev.items, { ...product, qty }];
      return { ...prev, items };
    });
  };

  const updateQty = (id, newQty, stock) => {
    setOrder(prev => {
      if (!prev || newQty < 1) return prev;
      const items = prev.items.map(i =>
        i.id === id ? { ...i, qty: Math.min(newQty, stock) } : i
      );
      return { ...prev, items };
    });
  };

  const removeItem = (id) => {
    setOrder(prev => {
      if (!prev) return null;
      const items = prev.items.filter(i => i.id !== id);
      return { ...prev, items };
    });
  };

  const sendToCashier = () => {
    setOrder(prev => {
      if (!prev || prev.items.length === 0) return prev;
      return { ...prev, status: 'sent', sentAt: new Date().toISOString() };
    });
  };

  const cancelOrder = () => setOrder(null);

  // ✅ These were missing from the Provider value — now included:
  const finalizeCheckout = () => setOrder(null);

  const rejectOrder = () => {
    setOrder(prev => prev ? { ...prev, status: 'pending' } : null);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isUserShopping      = order?.status === 'pending';
  const isWaitingForCashier = order?.status === 'sent';
  const orderSubtotal       = order?.items?.reduce((s, i) => s + i.price * i.qty, 0) ?? 0;
  const orderItemCount      = order?.items?.reduce((s, i) => s + i.qty, 0) ?? 0;

  return (
    <OrderContext.Provider value={{
      order,
      isUserShopping,
      isWaitingForCashier,
      orderItemCount,
      orderSubtotal,
      startOrder,
      addItem,
      removeItem,
      updateQty,
      sendToCashier,
      cancelOrder,
      finalizeCheckout,   // ✅ added
      rejectOrder,        // ✅ added
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);