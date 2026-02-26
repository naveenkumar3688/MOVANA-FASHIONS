'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { cartItems = [] } = useCart() || {};
  const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  
  // 🍔 ADDED STATE TO OPEN/CLOSE THE MENU
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LEFT: Mobile Menu Button (NOW WIRED UP!) */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-gray-300 transition"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            
            {/* Desktop Links */}
            <nav className="hidden md:flex gap-6 uppercase tracking-widest text-xs font-bold text-gray-300">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <Link href="/admin" className="hover:text-white transition flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Admin</Link>
            </nav>

            {/* Cart Link */}
            <Link href="/cart" className="relative text-white hover:text-gray-300 transition hover:scale-110 transform duration-200">
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

          </div>
        </div>
      </div>

      {/* 🍔 THE ACTUAL DROPDOWN MENU FOR MOBILE */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#111] border-t border-gray-800 shadow-2xl absolute w-full left-0">
          <div className="px-4 py-6 flex flex-col gap-6 text-center">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold uppercase tracking-widest text-sm hover:text-gray-300">Home</Link>
            <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold uppercase tracking-widest text-sm hover:text-gray-300">Shopping Cart</Link>
            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 font-bold uppercase tracking-widest text-xs hover:text-gray-300 flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4"/> Admin Login</Link>
          </div>
        </div>
      )}
    </header>
  );
}