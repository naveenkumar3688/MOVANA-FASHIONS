'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-Retry logic so the database never "sleeps" on your customers!
  useEffect(() => {
    async function fetchProducts(retryCount = 0) {
      const { data, error } = await supabase.from('products').select('*');
      
      if ((error || !data || data.length === 0) && retryCount < 2) {
        console.log("Database waking up, retrying...");
        setTimeout(() => fetchProducts(retryCount + 1), 1500); 
        return;
      }

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setAllProducts(data || []);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      
      {/* 🔥 THE NEW FULL-WIDTH MEESHO-STYLE BANNER */}
      <section className="w-full bg-[#fafafa]">
        <Link href="#catalogue" className="block w-full cursor-pointer hover:opacity-95 transition-opacity">
          <img 
            src="/offer-woman.png" 
            alt="Mega Clearance Sale - Premium Nighties" 
            className="w-full h-auto object-cover md:object-contain bg-rose-50/50"
            onError={(e) => {
              // This is just a temporary placeholder until your image loads
              e.currentTarget.src = "https://images.unsplash.com/photo-1583391733958-d6e06b72a690?q=80&w=1600&auto=format&fit=crop"; 
            }}
          />
        </Link>
      </section>

      {/* 👗 CATALOGUE SECTION (Kept exactly as you had it!) */}
      <section id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black uppercase tracking-widest mb-4 text-black">Latest Arrivals</h2>
          <div className="w-24 h-1 bg-black mx-auto"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Collection...</p>
          </div>
        ) : allProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-medium text-lg">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {allProducts.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="group">
                <div className="bg-gray-100 rounded-3xl overflow-hidden aspect-[3/4] mb-4 relative shadow-sm border border-gray-200">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest">No Image</div>
                  )}
                  {/* Premium Badge */}
                  <div className="absolute top-3 left-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                    Offer Applied
                  </div>
                </div>
                <div className="px-2">
                  <h3 className="font-bold text-sm uppercase tracking-tight text-black line-clamp-1">{product.name}</h3>
                  <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest mb-2">{product.category}</p>
                  <p className="font-black text-lg text-black">₹{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}