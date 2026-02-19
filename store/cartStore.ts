import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // The magic memory tool!

type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  toggleCart: () => void;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
};

// We wrap the whole store in persist()
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false, // We don't save the drawer being open, just the items
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsOpen: (open) => set({ isOpen: open }),
      
      addToCart: (product) => set((state) => {
        const existing = state.items.find((item) => item.id === product.id);
        if (existing) {
          return {
            items: state.items.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
            isOpen: true,
          };
        }
        return { items: [...state.items, { ...product, quantity: 1 }], isOpen: true };
      }),
      
      removeFromCart: (id) => set((state) => ({ 
        items: state.items.filter((item) => item.id !== id) 
      })),
      
      updateQuantity: (id, qty) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, quantity: Math.max(1, qty) } : item
        )
      })),
      
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'movana-cart-storage', // The secret name stored in the customer's browser
      partialize: (state) => ({ items: state.items }), // ONLY save the items array, not the open/close state
    }
  )
);