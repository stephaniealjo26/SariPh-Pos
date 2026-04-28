import { createContext, useState, useContext, useEffect } from "react";

export const ProductContext = createContext();

const DEFAULT_IMAGE =
  "https://via.placeholder.com/150?text=No+Image";

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Coca-Cola",
    barcode: "0001",
    price: 20,
    stock: 10,
    category: "Beverages",
    active: true,
    image: "/products/coca-cola.png"
  },
  {
    id: 2,
    name: "Lucky Me Pancit",
    barcode: "0002",
    price: 15,
    stock: 20,
    category: "Noodles",
    active: true,
    image: "/products/pancit canton.webp"
  },
  {
    id: 3,
    name: "Rebisco Crackers",
    barcode: "0003",
    price: 12,
    stock: 25,
    category: "Snacks",
    active: true,
    image: "/products/rebisco-crackers.jpg"
  },
  {
    id: 4,
    name: "Bear Brand Milk 300g",
    barcode: "0004",
    price: 55,
    stock: 12,
    category: "Dairy",
    active: true,
    image: "/products/bear brand.jpg"
  },
  {
    id: 5,
    name: "Safeguard Soap 135g",
    barcode: "0005",
    price: 35,
    stock: 18,
    category: "Personal Care",
    active: true,
    image: "/products/Safeguard Soap.png"
  },
  {
    id: 6,
    name: "Ariel Powder 66g",
    barcode: "0006",
    price: 18,
    stock: 30,
    category: "Household",
    active: true,
    image: "/products/Ariel Powder.png"
  },
  {
    id: 7,
    name: "Sky Flakes 250g",
    barcode: "0007",
    price: 28,
    stock: 22,
    category: "Snacks",
    active: true,
    image: "/products/Sky Flakes.png"
  },
  {
    id: 8,
    name: "Sprite 500ml",
    barcode: "0008",
    price: 20,
    stock: 40,
    category: "Beverages",
    active: true,
    image: "/products/Sprite.png"
  },
  {
    id: 9,
    name: "Eden Cheese 165g",
    barcode: "0009",
    price: 45,
    stock: 15,
    category: "Dairy",
    active: true,
    image: "/products/Eden Cheese.jpg"
  },
  {
    id: 10,
    name: "Milo 22g Sachet",
    barcode: "0010",
    price: 10,
    stock: 50,
    category: "Beverages",
    active: true,
    image: "/products/Milo sachet.jpg"
  }
];

export const ProductProvider = ({ children }) => {

  const getSafeProducts = () => {
    const safeDefaults = DEFAULT_PRODUCTS.map(p => ({
      ...p,
      image: p.image || DEFAULT_IMAGE,
    }));

    try {
      const saved = localStorage.getItem("sariph_products");

      if (!saved) return safeDefaults;

      const parsed = JSON.parse(saved);

      const cleaned = parsed.map(p => ({
        ...p,
        image: p.image || DEFAULT_IMAGE,
      }));

      return cleaned.length ? cleaned : safeDefaults;

    } catch {
      return safeDefaults;
    }
  };

  const [products, setProducts] = useState(getSafeProducts);

  useEffect(() => {
    const cleaned = products.map(p => ({
      ...p,
      image: p.image || DEFAULT_IMAGE,
    }));

    localStorage.setItem("sariph_products", JSON.stringify(cleaned));
  }, [products]);

  // ADD PRODUCT
  const addProduct = (data) => {
    const trimmed = data.barcode.trim();

    if (products.find(p => p.barcode === trimmed))
      return { success: false, message: "Barcode already exists." };

    setProducts(prev => [
      ...prev,
      {
        id: Date.now(),
        name: data.name.trim(),
        barcode: trimmed,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        category: data.category || "General",
        active: true,
        image: data.image || DEFAULT_IMAGE,
      }
    ]);

    return { success: true };
  };

  // EDIT PRODUCT
  const editProduct = (id, data) => {
    const trimmed = data.barcode.trim();

    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              name: data.name.trim(),
              barcode: trimmed,
              price: parseFloat(data.price),
              stock: parseInt(data.stock),
              category: data.category || p.category,
              image: data.image || p.image || DEFAULT_IMAGE,
            }
          : p
      )
    );

    return { success: true };
  };

  const toggleProduct = (id) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, active: !p.active } : p
      )
    );
  };

  // DEDUCT STOCK ON CHECKOUT
  const deductStock = (items) => {
    setProducts(prev =>
      prev.map(p => {
        const cartItem = items.find(i => i.id === p.id);
        return cartItem
          ? { ...p, stock: Math.max(0, p.stock - cartItem.qty) }
          : p;
      })
    );
  };

  const activeProducts = products.filter(p => p.active);

  return (
    <ProductContext.Provider value={{
      products,
      activeProducts,
      addProduct,
      editProduct,
      toggleProduct,
      deductStock,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);