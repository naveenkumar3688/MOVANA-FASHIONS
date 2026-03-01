'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
// 👈 NEW: Import useRouter for redirection
import { useRouter } from 'next/navigation'; 
import { Loader2, XCircle, Search } from 'lucide-react'; 

export default function HomePage() {
  const router = useRouter(); // 👈 Initialize the Router
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeFilter, setActiveFilter] = useState('All'); 
  const [searchQuery, setSearchQuery] = useState('');

  const [currentSlide, setCurrentSlide] = useState(0);
  
  const banners = [
    "/offer-woman.png", 
    "/SECOND-BANNER.jpg", 
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop"  
  ];

  const movanaModels = [
   { name: "Titanic", desc: "The Classic Comfort Cut", video: "/titanic.mp4", image: "/titanic.jpg" },
   { name: "Zip", desc: "Smart & Practical", video: "/zip.mp4", image: "/zip.jpg" },
   { name: "Frock", desc: "Flared Premium Comfort", video: "/frock.mp4", image: "/frock.jpg" },
   { name: "Elastic", desc: "Smocked Perfect Fit", video: "/elastic.mp4", image: "/elastic.jpg" }
  ];

  // 🧠 SMART SEARCH REDIRECT LOGIC
  const handleSmartSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const term = searchQuery.toLowerCase();
      
      // 🕵️‍♂️ Logic: If search contains specific keywords, redirect!
      if (term.includes('men') || term.includes('man') || term.includes('boy') || term.includes('male')) {
        router.push('/menswear'); // 🚀 Teleport to Menswear Page
      } 
      else if (term.includes('women') || term.includes('girl') || term.includes('lady') || term.includes('female')) {
        router.push('/womenswear'); // 🚀 Teleport to Womenswear Page
      }
      // If it's just "Red" or "Titanic", do nothing (the filter below handles it!)
    }
  };

  const filteredProducts = allProducts.filter(product => {
    const matchesModel = activeFilter === 'All' || 
      product.name.toLowerCase().includes(activeFilter.toLowerCase()) || 
      (product.description && product.description.toLowerCase().includes(activeFilter.toLowerCase()));

    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesModel && matchesSearch;
  });

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

      {/* ✨ SHOP BY MODEL ✨ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-3 text-black">Shop By Model</h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Discover your perfect fit</p>
          <div className="w-16 h-1 bg-black mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {movanaModels.map((model, index) => (
            <Link 
              href="#catalogue" 
              key={index} 
              onClick={() => setActiveFilter(model.name)}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-sm cursor-pointer block bg-black"
            >
              {model.video ? (
                <video src={model.video} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
              ) : (
                <img src={model.image} alt={model.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
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

      {/* 👗 CATALOGUE SECTION */}
      <section id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black uppercase tracking-widest mb-4 text-black">Latest Arrivals</h2>
          
          {/* 🔎 SMART SEARCH BAR */}
          <div className="max-w-md mx-auto relative mb-6">
            <input
              type="text"
              placeholder="Type 'Mens' and hit Enter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              // 🚨 LISTEN FOR ENTER KEY HERE
              onKeyDown={handleSmartSearch}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black transition-shadow shadow-sm"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          </div>

          {activeFilter !== 'All' && (
            <div className="flex items-center justify-center gap-4 animate-fadeIn">
              <span className="text-sm font-bold uppercase tracking-widest text-gray-500">
                Showing: <span className="text-black">{activeFilter} Models</span>
              </span>
              <button onClick={() => setActiveFilter('All')} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all">
                <XCircle className="w-4 h-4" /> Clear Filter
              </button>
            </div>
          )}

          <div className="w-24 h-1 bg-black mx-auto mt-6"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Collection...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-medium text-lg">
               No products found for <strong>{searchQuery}</strong>.
            </p>
            <button onClick={() => { setActiveFilter('All'); setSearchQuery(''); }} className="text-black underline mt-4 text-sm font-bold uppercase tracking-widest">
                 Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="group">
                <div className="bg-gray-100 rounded-3xl overflow-hidden aspect-[3/4] mb-4 relative shadow-sm border border-gray-200">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest">No Image</div>
                  )}
                  <div className="absolute top-3 left-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">Offer Applied</div>
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