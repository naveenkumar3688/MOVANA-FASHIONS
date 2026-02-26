'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext'; // 👈 Connect to the intercom

export default function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart(); // 👈 Grab the universal function

  return (
    <button
      onClick={() => addToCart(product)}
      className="w-full bg-white text-black border border-gray-200 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest hover:bg-gray-50 transition-all"
    >
      <ShoppingCart className="w-4 h-4" /> Add
    </button>
  );
}