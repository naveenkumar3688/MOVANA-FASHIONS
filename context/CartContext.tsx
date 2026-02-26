'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize state immediately, possibly with data from localStorage if available server-side (less common, but safe)
  // or just empty array to avoid hydration mismatch, then load in useEffect.
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Load the cart ONLY on the client side after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse cart from local storage", e);
          localStorage.removeItem('cart');
        }
      }
      setIsInitialized(true);
    }
  }, []);

  // 2. Anytime the cart changes, save it securely (only after initialization)
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  // 3. Universal Add function
  const addToCart = (product: any) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Simple alert for now. Can be replaced with toast later.
    if (typeof window !== 'undefined') {
       alert(`${product.name} added to your cart! 🛍️`);
    }
  };

  // 4. 🔥 NEW: Update Quantity function (+/- buttons)
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id); // If user goes below 1, remove the item
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // 5. Universal Remove function
  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);