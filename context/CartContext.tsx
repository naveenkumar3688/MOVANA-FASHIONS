'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Create the intercom
const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<any[]>([]);

  // 1. Load the cart when the website first opens
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // 2. Anytime the cart changes, save it securely
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // 3. The universal "Add to Cart" function
  const addToCart = (product: any) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        // If it's already in the cart, just increase the quantity
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // If it's new, add it with a quantity of 1
      return [...prev, { ...product, quantity: 1 }];
    });
    alert(`${product.name} added to your cart! 🛍️`);
  };

  // 4. The universal "Remove" function
  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Secret hook to use the cart anywhere!
export const useCart = () => useContext(CartContext);