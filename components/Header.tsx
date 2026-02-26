'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Menu, X, User, LogOut, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

export default function Header() {
  const { cartItems = [] } = useCart() || {};
  const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("You have been logged out.");
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-gray-300 transition"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
            <Link href="/" className="text-3xl font-black uppercase tracking-[0.2em] text-white">
              MOVANA
            </Link>
          </div>

          <div className="flex items-center gap-6">
            
            <nav className="hidden md:flex gap-6 uppercase tracking-widest text-xs font-bold text-gray-300 items-center">
              <Link href="/" className="hover:text-white transition">Home</Link>
              
              {user ? (
                <>
                  {/* 📦 BRAND NEW MY ORDERS BUTTON */}
                  <Link href="/orders" className="hover:text-white transition flex items-center gap-1 text-gray-300">
                    <Package className="w-4 h-4"/> My Orders
                  </Link>

                  <button onClick={handleLogout} className="hover:text-red-400 transition flex items-center gap-1 text-red-500">
                    <LogOut className="w-4 h-4"/> Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="hover:text-white transition flex items-center gap-1">
                  <User className="w-4 h-4"/> Login
                </Link>
              )}
            </nav>

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

      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#111] border-t border-gray-800 shadow-2xl absolute w-full left-0">
          <div className="px-4 py-6 flex flex-col gap-6 text-center">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold uppercase tracking-widest text-sm hover:text-gray-300">Home</Link>
            <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold uppercase tracking-widest text-sm hover:text-gray-300">Shopping Cart</Link>
            
            {user ? (
              <>
                {/* 📦 MOBILE MY ORDERS BUTTON */}
                <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 font-bold uppercase tracking-widest text-sm hover:text-white flex items-center justify-center gap-2">
                  <Package className="w-4 h-4"/> My Orders
                </Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-red-500 font-bold uppercase tracking-widest text-sm hover:text-red-400 flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4"/> Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 font-bold uppercase tracking-widest text-sm hover:text-white flex items-center justify-center gap-2">
                <User className="w-4 h-4"/> Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}