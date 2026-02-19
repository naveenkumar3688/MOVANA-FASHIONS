'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function Header() {
  const { items, setIsOpen } = useCartStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif font-bold text-2xl tracking-widest text-black">
          MOVANA
        </Link>
        <button onClick={() => setIsOpen(true)} className="relative p-2 flex items-center justify-center transition hover:scale-110">
          <ShoppingCart className="w-6 h-6 text-black" />
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}