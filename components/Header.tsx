'use client';

import Link from 'next/link';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Header() {
  const { items, setIsOpen } = useCartStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  // NEW: State to track if someone is logged in
  const [user, setUser] = useState<any>(null);

  // NEW: Check Supabase to see if a customer is currently logged in
  useEffect(() => {
    // 1. Get the current session when the page loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Listen for any logins or logouts in real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // NEW: Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert("You have been logged out successfully!");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="font-serif font-bold text-2xl tracking-widest text-black">
          MOVANA
        </Link>
        
        {/* ICONS ON THE RIGHT */}
        <div className="flex items-center gap-6">
          
          {/* USER & LOGOUT SECTION */}
          {user ? (
            // IF LOGGED IN: Show Log Out button and a Green User Icon
            <div className="flex items-center gap-4">
              <button onClick={handleLogout} className="flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-700 transition">
                <LogOut className="w-4 h-4" /> Log Out
              </button>
              <Link href="/profile" className="flex items-center justify-center transition hover:scale-110">
                <User className="w-6 h-6 text-green-600" />
              </Link>
            </div>
          ) : (
            // IF NOT LOGGED IN: Show normal black Login Icon
            <Link href="/login" className="flex items-center justify-center transition hover:scale-110">
              <User className="w-6 h-6 text-black" />
            </Link>
          )}

          {/* THE SHOPPING CART ICON */}
          <button onClick={() => setIsOpen(true)} className="relative flex items-center justify-center transition hover:scale-110">
            <ShoppingCart className="w-6 h-6 text-black" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                {itemCount}
              </span>
            )}
          </button>
          
        </div>
      </div>
    </header>
  );
}