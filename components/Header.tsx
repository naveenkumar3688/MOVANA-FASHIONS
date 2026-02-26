'use client';

import Link from 'next/link';
import { ShoppingBag, Search, Menu } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header() {
  // Grab the global cart items to show the badge number!
  const { cartItems = [] } = useCart() || {};
  
  // Calculate total quantity of items in the cart
  const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LEFT: Mobile Menu (Optional later) */}
          <div className="flex items-center md:hidden">
            <button className="text-white hover:text-gray-300 transition">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* CENTER: Brand Logo */}
          <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
            <Link href="/" className="text-3xl font-black uppercase tracking-[0.2em] text-white">
              MOVANA
            </Link>
          </div>

          {/* RIGHT: Navigation & Cart */}
          <div className="flex items-center gap-6">
            
            {/* 🚀 THE NEW CART LINK TO OUR MASTER PAGE */}
            <Link href="/cart" className="relative text-white hover:text-gray-300 transition hover:scale-110 transform duration-200">
              <ShoppingBag className="w-6 h-6" />
              
              {/* LIVE CART BADGE */}
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

          </div>
        </div>
      </div>
    </header>
  );
}