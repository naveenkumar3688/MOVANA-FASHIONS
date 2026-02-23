'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, LogOut, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // 🚪 LOGOUT FUNCTION
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false); // Close the menu
    router.push('/login'); // Send them back to the login page
  };

  return (
    <>
      {/* 🌟 MAIN TOP NAVIGATION BAR */}
      <nav className="flex justify-between items-center p-4 sm:px-8 bg-white border-b border-gray-100 sticky top-0 z-40">
        
        {/* Your Brand Logo */}
        <Link href="/" className="text-2xl font-extrabold tracking-widest uppercase text-black">
          MOVANA
        </Link>
        
        <div className="flex items-center gap-6">
          {/* Cart Icon (Keep your cart logic if you have a dynamic number here!) */}
          <Link href="/cart" className="relative text-black hover:text-gray-600 transition">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              1
            </span>
          </Link>
          
          {/* 🍔 HAMBURGER BUTTON */}
          <button onClick={() => setIsOpen(true)} className="text-black hover:text-gray-600 transition">
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </nav>

      {/* 🌑 DARK BACKGROUND OVERLAY (Clicking it closes the menu) */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsOpen(false)} 
      />
      
      {/* ➡️ RIGHT SIDE SLIDING DRAWER */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <span className="text-xl font-extrabold tracking-widest uppercase text-black">Menu</span>
          <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition">
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* 👗 CATEGORY LINKS IN MENU */}
        <div className="flex flex-col flex-1 py-4 overflow-y-auto">
          <Link href="/womenswear" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
            <span className="font-bold uppercase text-sm tracking-widest text-gray-700 group-hover:text-black">Womenswear</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black transition" />
          </Link>
          <Link href="/menswear" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
            <span className="font-bold uppercase text-sm tracking-widest text-gray-700 group-hover:text-black">Menswear</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black transition" />
          </Link>
          <Link href="/kidswear" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
            <span className="font-bold uppercase text-sm tracking-widest text-gray-700 group-hover:text-black">Kidswear</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black transition" />
          </Link>
          <Link href="/home-accessories" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
            <span className="font-bold uppercase text-sm tracking-widest text-gray-700 group-hover:text-black">Home Accessories</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black transition" />
          </Link>
        </div>

        {/* 🚪 HIDDEN LOGOUT BUTTON AT THE BOTTOM */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all shadow-md hover:shadow-xl"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>
    </>
  );
}