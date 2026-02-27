'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const banners = [
    "/offer-woman.png", 
    "https://images.unsplash.com/photo-1583391733958-d6e06b72a690?q=80&w=1600&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop"  
  ];

  // 👗 MOVANA MODELS - NOW USING YOUR LOCAL FILES!
  const movanaModels = [
   {
      name: "Titanic",
      desc: "The Classic Comfort Cut",
      video: "/titanic.mp4",
      image: "/titanic.jpg" // 👈 Assuming you put a picture here!
    },
    {
      name: "Zip",
      desc: "Smart & Practical",
      video: "/zip.mp4", // 👈 Local file!
      image: "/zip.jpg" 
    },
    {
      name: "Frock",
      desc: "Flared Premium Comfort",
      video: "/frock.mp4", // 👈 Local file!
      image: "/frock.jpg" 
    },
    {
      name: "Elastic",
      desc: "Smocked Perfect Fit",
      video: null, // No video yet, so it uses the image below
      image: "/elastic.jpg" // 👈 Make sure this is in your public folder!
    }
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(slideTimer);
  }, [banners.length]);

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
      
      {/* 🎠 CAROUSEL HERO */}
      <section className="w-full bg-[#fafafa] relative overflow-hidden group">
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((img, index) => (
            <Link key={index} href="#catalogue" className="w-full shrink-0 block cursor-pointer">
              <img src={img} alt={`MOVANA Offer ${index + 1}`} className="w-full h-auto object-cover md:object-contain bg-rose-50/50" />
            </Link>
          ))}
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {banners.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-3 h-3 rounded-full transition-all duration-300 shadow-md ${idx === currentSlide ? 'bg-black scale-125 w-6' : 'bg-gray-400 hover:bg-gray-600'}`} />
          ))}
        </div>
      </section>

      {/* ✨ SHOP BY MODEL: NOW WITH MOVING VIDEOS ✨ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-3 text-black">Shop By Model</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Discover your perfect fit</p>
          <div className="w-16 h-1 bg-black mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {movanaModels.map((model, index) => (
            <Link href="#catalogue" key={index} className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-sm cursor-pointer block bg-black">
              
              {/* 🧠 Smart Logic: Show Video if it exists, otherwise show the static Image! */}
              {model.video ? (
                <video 
                  src={model.video} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />
              ) : (
                <img 
                  src={model.image} 
                  alt={model.name} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-widest mb-1">{model.name}</h3>
                <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{model.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 👗 LATEST ARRIVALS CATALOGUE */}
      <section id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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