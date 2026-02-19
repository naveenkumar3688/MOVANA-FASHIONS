'use client';

import { ShoppingCart } from 'lucide-react'; // The Amazon-style basket!
import { useCartStore } from '../store/cartStore';

export default function AddToCartButton({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // This stops the page from jumping when clicked
        addToCart(product);
      }}
      className="w-full bg-black text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-sm"
    >
      <ShoppingCart className="w-4 h-4" />
      Add to Cart
    </button>
  );
}