import { createContext, useState, useContext, useEffect } from "react";

export const ProductContext = createContext();

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Coca-Cola 500ml",      barcode: "4800888117560", price: 35,  stock: 100, active: true, category: "Beverages" },
  { id: 2, name: "Lucky Me Pancit",       barcode: "4800016150016", price: 14,  stock: 200, active: true, category: "Noodles" },
  { id: 3, name: "Rebisco Crackers",      barcode: "4800016120019", price: 22,  stock: 80,  active: true, category: "Snacks" },
  { id: 4, name: "Bear Brand Milk 300g",  barcode: "4800062410012", price: 58,  stock: 60,  active: true, category: "Dairy" },
  { id: 5, name: "Safeguard Soap 135g",   barcode: "4902430153003", price: 45,  stock: 120, active: true, category: "Personal Care" },
  { id: 6, name: "Ariel Powder 66g",      barcode: "4902430501507", price: 12,  stock: 150, active: true, category: "Household" },
  { id: 7, name: "Sky Flakes 250g",       barcode: "4800016880016", price: 38,  stock: 90,  active: true, category: "Snacks" },
  { id: 8, name: "Sprite 500ml",          barcode: "4800888130569", price: 33,  stock: 95,  active: true, category: "Beverages" },
  { id: 9, name: "Eden Cheese 165g",      barcode: "4800895000015", price: 72,  stock: 45,  active: true, category: "Dairy" },
  { id: 10, name: "Milo 22g Sachet",      barcode: "4800361113017", price: 8,   stock: 300, active: true, category: "Beverages" },
];

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("sariph_products");
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    } catch { return DEFAULT_PRODUCTS; }
  });

  useEffect(() => {
    localStorage.setItem("sariph_products", JSON.stringify(products));
  }, [products]);

  // ADD
  const addProduct = (data) => {
    const trimmed = data.barcode.trim();
    if (products.find(p => p.barcode === trimmed))
      return { success: false, message: `Barcode "${trimmed}" already exists.` };
    if (!data.name.trim())
      return { success: false, message: "Product name is required." };
    if (isNaN(data.price) || Number(data.price) <= 0)
      return { success: false, message: "Price must be greater than 0." };
    if (isNaN(data.stock) || Number(data.stock) < 0)
      return { success: false, message: "Stock cannot be negative." };

    setProducts(prev => [...prev, {
      id: Date.now(),
      name: data.name.trim(),
      barcode: trimmed,
      price: parseFloat(data.price),
      stock: parseInt(data.stock),
      category: data.category?.trim() || "General",
      active: true,
    }]);
    return { success: true };
  };

  // EDIT
  const editProduct = (id, data) => {
    const trimmed = data.barcode.trim();
    if (products.find(p => p.barcode === trimmed && p.id !== id))
      return { success: false, message: `Barcode "${trimmed}" already exists.` };
    if (!data.name.trim())
      return { success: false, message: "Product name is required." };
    if (isNaN(data.price) || Number(data.price) <= 0)
      return { success: false, message: "Price must be greater than 0." };
    if (isNaN(data.stock) || Number(data.stock) < 0)
      return { success: false, message: "Stock cannot be negative." };

    setProducts(prev => prev.map(p => p.id === id ? {
      ...p,
      name: data.name.trim(),
      barcode: trimmed,
      price: parseFloat(data.price),
      stock: parseInt(data.stock),
      category: data.category?.trim() || p.category,
    } : p));
    return { success: true };
  };

  // DEACTIVATE / REACTIVATE
  const toggleProduct = (id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  // REDUCE STOCK after sale
  const deductStock = (cartItems) => {
    setProducts(prev => prev.map(p => {
      const item = cartItems.find(c => c.id === p.id);
      return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
    }));
  };

  // RESTORE STOCK on void/cancel
  const restoreStock = (cartItems) => {
    setProducts(prev => prev.map(p => {
      const item = cartItems.find(c => c.id === p.id);
      return item ? { ...p, stock: p.stock + item.qty } : p;
    }));
  };

  const activeProducts = products.filter(p => p.active);

  return (
    <ProductContext.Provider value={{
      products, activeProducts,
      addProduct, editProduct, toggleProduct,
      deductStock, restoreStock,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);