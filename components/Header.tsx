'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Added ChevronDown for the dropdown arrow!
import { ShoppingBag, Menu, X, User, LogOut, Package, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

export default function Header() {
  const { cartItems = [] } = useCart() || {};
  const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false); // State for our new dropdown
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  // This helps close the dropdown if the customer clicks anywhere else on the screen
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Professional UX trick: Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAccountMenuOpen(false); // Close dropdown on logout
    setIsMobileMenuOpen(false); // Close mobile menu on logout
    alert("You have been logged out.");
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-black text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center xl:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-gray-300 transition"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center xl:justify-start flex-1 xl:flex-none">
            <Link href="/" className="text-3xl font-black uppercase tracking-[0.2em] text-white">
              MOVANA
            </Link>
          </div>

          <div className="flex items-center gap-8">
            
            {/* 🖥️ DESKTOP NAVIGATION */}
            <nav className="hidden xl:flex gap-6 uppercase tracking-widest text-xs font-bold text-gray-300 items-center">
              
              {/* THE MAIN CATEGORIES */}
              <Link href="/womenswear" className="hover:text-white transition">Womenswear</Link>
              <Link href="/menswear" className="hover:text-white transition">Menswear</Link>
              <Link href="/kidswear" className="hover:text-white transition">Kidswear</Link>
              <Link href="/home-accessories" className="hover:text-white transition">Home Accessories</Link>
              
              <div className="h-4 w-[1px] bg-gray-600 mx-2"></div> {/* Separator Line */}

              {/* ACCOUNT INFO DROPDOWN */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="hover:text-white transition flex items-center gap-1 text-gray-300"
                  >
                    <User className="w-4 h-4"/> Account Info <ChevronDown className={`w-3 h-3 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* The Dropdown Box */}
                  {isAccountMenuOpen && (
                    <div className="absolute right-0 mt-6 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col z-50 transform origin-top animate-in fade-in slide-in-from-top-2">
                      <Link 
                        href="/orders" 
                        onClick={() => setIsAccountMenuOpen(false)} 
                        className="px-5 py-4 text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 transition"
                      >
                        <Package className="w-4 h-4 text-gray-400"/> My Orders
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        className="px-5 py-4 text-red-600 text-xs font-bold uppercase tracking-widest hover:bg-red-50 flex items-center gap-3 text-left transition"
                      >
                        <LogOut className="w-4 h-4"/> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="hover:text-white transition flex items-center gap-1">
                  <User className="w-4 h-4"/> Login
                </Link>
              )}
            </nav>

            {/* Shopping Cart */}
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

      {/* 📱 MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-[#111] border-t border-gray-800 shadow-2xl absolute w-full left-0 z-50">
          <div className="px-4 py-8 flex flex-col gap-6 text-center">
            
            {/* The Main Categories */}
            <Link href="/womenswear" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold uppercase tracking-widest text-sm hover:text-gray-300">Womenswear</Link>
            <Link href="/menswear" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold uppercase tracking-widest text-sm hover:text-gray-300">Menswear</Link>
            <Link href="/kidswear" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold uppercase tracking-widest text-sm hover:text-gray-300">Kidswear</Link>
            <Link href="/home-accessories" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold uppercase tracking-widest text-sm hover:text-gray-300">Home Accessories</Link>
            
            <div className="w-16 h-[1px] bg-gray-800 mx-auto my-2"></div>
            
            {/* Mobile Account Section */}
            {user ? (
              <div className="flex flex-col gap-4 bg-[#1a1a1a] p-6 rounded-2xl mx-4">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-2">Account Info</p>
                <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 font-bold uppercase tracking-widest text-sm hover:text-white flex items-center justify-center gap-2">
                  <Package className="w-4 h-4"/> My Orders
                </Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="text-red-500 font-bold uppercase tracking-widest text-sm hover:text-red-400 flex items-center justify-center gap-2 mt-2">
                  <LogOut className="w-4 h-4"/> Logout
                </button>
              </div>
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