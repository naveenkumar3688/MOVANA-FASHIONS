'use client';

import Link from 'next/link';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pt-20 pb-20 px-4">
      <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-lg border border-gray-100 text-center">
        
        <div className="flex justify-center mb-6">
          <div className="bg-gray-50 p-6 rounded-full">
            <ShoppingBag className="w-16 h-16 text-gray-300" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-black mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-10 tracking-wide">Looks like you haven't added any premium essentials yet.</p>
        
        <Link href="/" className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gray-800 hover:shadow-xl transition-all w-full sm:w-auto">
          <ArrowLeft className="w-5 h-5" /> Continue Shopping
        </Link>
        
      </div>
    </div>
  );
}