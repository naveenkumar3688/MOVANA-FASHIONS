import { create } from 'zustand';

// 1. Define the shape of a single item
type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

// 2. Define the shape of the WHOLE store
type CartState = {
  items: CartItem[];      // We name this 'items' to match your Drawer!
  isOpen: boolean;
  toggleCart: () => void; // We explicitly list this so TS knows it exists
  setIsOpen: (open: boolean) => void;
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
};

// 3. Create the store
export const useCartStore = create<CartState>((set) => ({
  items: [],              // Must be 'items' (not 'cart')
  isOpen: false,
  
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (open) => set({ isOpen: open }),

  addToCart: (product) => set((state) => {
    // Check if item already exists
    const existing = state.items.find((item) => item.id === product.id);
    if (existing) {
      return {
        items: state.items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
        isOpen: true,
      };
    }
    // Add new item
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
}));