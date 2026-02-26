'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { Loader2, Truck, ArrowRight, Star, ShieldCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-[#fafafa] font-sans">
      
      {/* 🔥 THE NEW MEGA OFFER HERO SECTION */}
      <section className="relative bg-gradient-to-br from-rose-50 via-white to-pink-50 overflow-hidden border-b border-pink-100">
        
        {/* Decorative Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between py-12 md:py-20 gap-10">
            
            {/* 💃 LEFT SIDE: The Happy Woman Image */}
            <div className="w-full md:w-1/2 flex justify-center relative">
              <div className="relative w-full max-w-md aspect-square md:aspect-auto md:h-[550px]">
                {/* Ensure your image is named 'offer-woman.png' and placed in your 'public' folder! */}
                <img 
                  src="/offer-woman.png" 
                  alt="Happy Woman pointing at offer" 
                  className="w-full h-full object-contain drop-shadow-2xl z-10 relative"
                  onError={(e) => {
                    // This is just a temporary placeholder until you upload your own image!
                    e.currentTarget.src = "https://images.unsplash.com/photo-1583391733958-d6e06b72a690?q=80&w=800&auto=format&fit=crop"; 
                  }}
                />
              </div>
            </div>

            {/* 💰 RIGHT SIDE: The Offer Math & Buttons */}
            <div className="w-full md:w-1/2 text-center md:text-left">
              <span className="inline-block py-1.5 px-4 rounded-full bg-red-100 text-red-600 text-xs font-black uppercase tracking-widest mb-6 border border-red-200 shadow-sm animate-bounce">
                Mega Clearance Sale
              </span>
              
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tight leading-tight mb-2">
                Premium Nighties
              </h1>
              <h2 className="text-xl md:text-2xl font-bold text-gray-500 mb-8 uppercase tracking-wide">
                Buy 4 and Save Big!
              </h2>
              
              {/* The Strikethrough Pricing */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8 bg-white/80 p-6 rounded-3xl border border-white backdrop-blur-md shadow-xl inline-flex w-full md:w-auto">
                <span className="text-4xl md:text-5xl font-black text-gray-400 line-through decoration-red-500 decoration-[4px]">
                  ₹1200
                </span>
                <span className="text-6xl md:text-8xl font-black text-red-600 drop-shadow-md">
                  ₹999
                </span>
              </div>

              {/* Free Shipping Badge */}
              <div className="flex flex-col gap-4 mb-10 w-full md:w-auto">
                <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 w-full md:max-w-md">
                  <div className="bg-green-100 p-2 rounded-full shrink-0">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-bold text-sm md:text-base text-gray-800 uppercase tracking-wide text-left">
                    Free Shipping All Over India
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <Link 
                  href="#catalogue" 
                  className="inline-flex justify-center items-center gap-2 bg-black text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-gray-800 hover:scale-105 transition-all shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] w-full md:w-auto"
                >
                  Claim Offer Now <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 👗 CATALOGUE SECTION */}
      <section id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black uppercase tracking-widest mb-4">Latest Arrivals</h2>
          <div className="w-24 h-1 bg-black mx-auto"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Collection...</p>
          </div>
        ) : allProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-medium">No products available at the moment.</p>
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