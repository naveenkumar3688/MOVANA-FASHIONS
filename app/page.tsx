'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🎠 BANNER CAROUSEL STATE
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Add as many banner images as you want here!
  const banners = [
    "/offer-woman.png", // Your main banner
    "https://images.unsplash.com/photo-1583391733958-d6e06b72a690?q=80&w=1600&auto=format&fit=crop", // Example slide 2
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop"  // Example slide 3
  ];

  // Auto-Slide Logic for Banners (Slides every 4 seconds)
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(slideTimer);
  }, [banners.length]);

  // Fetch Products
  useEffect(() => {
    async function fetchProducts(retryCount = 0) {
      const { data, error } = await supabase.from('products').select('*');
      
      if ((error || !data || data.length === 0) && retryCount < 2) {
        setTimeout(() => fetchProducts(retryCount + 1), 1500); 
        return;
      }
      if (!error) setAllProducts(data || []);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      
      {/* 🔥 THE NEW INTERACTIVE SLIDING CAROUSEL */}
      <section className="w-full bg-[#fafafa] relative overflow-hidden group">
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((img, index) => (
            <Link key={index} href="#catalogue" className="w-full shrink-0 block cursor-pointer">
              <img 
                src={img} 
                alt={`MOVANA Offer ${index + 1}`} 
                className="w-full h-auto object-cover md:object-contain bg-rose-50/50"
              />
            </Link>
          ))}
        </div>

        {/* 🟢 Navigation Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {banners.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)} 
              className={`w-3 h-3 rounded-full transition-all duration-300 shadow-md ${idx === currentSlide ? 'bg-black scale-125 w-6' : 'bg-gray-400 hover:bg-gray-600'}`} 
            />
          ))}
        </div>
      </section>

      {/* 👗 CATALOGUE SECTION */}
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