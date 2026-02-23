'use client'; 

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import AddToCartButton from '../components/AddtoCartButton';
import { Search, ArrowRight, ShieldCheck, Truck, Star } from 'lucide-react';

export default function Home() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(''); // 🚀 NEW: Search Bar State!

  // 1. Fetch products when the page loads
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setAllProducts(data || []);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // 2. Automatically generate filter categories
  const categories = ['All', ...Array.from(new Set(allProducts.map(p => p.category || 'Other')))];

  // 3. Filter products by Category AND Search Bar
  const filteredProducts = allProducts.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // 4. Smooth Scroll Function
  const scrollToProducts = () => {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans text-black">
      
      {/* 🚨 THE MEGA OFFER BANNER 🚨 */}
      <div className="bg-red-600 text-white text-center py-2.5 font-bold text-xs sm:text-sm tracking-[0.2em] uppercase animate-pulse">
        🔥 Mega Offer: 4 Nighty @ ₹999 + Free Delivery! 🔥
      </div>

      {/* 🌟 PREMIUM HERO SECTION */}
      <div className="relative bg-black text-white py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        
        <div className="relative max-w-7xl mx-auto text-center flex flex-col items-center z-10">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 uppercase">
            Comfort Meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">Luxury</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-2xl mb-10 tracking-wide">
            Discover our premium collection of nighties, essential innerwear, and ultra-soft home accessories.
          </p>
          
          {/* 🔍 LIVE SEARCH BAR */}
          <div className="relative w-full max-w-2xl mx-auto mb-10">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                scrollToProducts(); // Auto-scrolls down when they start typing!
              }}
              placeholder="Search for nighties, towels, innerwear..."
              className="w-full py-5 pl-14 pr-6 text-gray-900 bg-white/95 backdrop-blur-sm border-2 border-transparent rounded-full focus:outline-none focus:border-white focus:bg-white transition-all shadow-2xl text-lg"
            />
            <Search className="w-6 h-6 text-gray-500 absolute left-5 top-1/2 transform -translate-y-1/2" />
          </div>

          <button 
            onClick={scrollToProducts}
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 hover:scale-105 transition-all shadow-lg"
          >
            Shop The Collection <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 👗 THE CATEGORY GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-12 text-center sm:text-left">
          <div className="w-full">
            <h2 className="text-4xl font-extrabold text-black tracking-tight uppercase">Shop by Category</h2>
            <p className="text-gray-500 mt-2 tracking-wide">Explore our signature collections</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link href="/womenswear" className="group relative h-[400px] bg-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
            <img src="https://images.unsplash.com/photo-1515347619253-12fb1817dd48?q=80&w=800&auto=format&fit=crop" alt="Womenswear" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-8 left-8 z-20">
              <h3 className="text-3xl font-bold text-white mb-2 uppercase tracking-wide">Women</h3>
              <p className="text-gray-300 text-sm tracking-widest uppercase">Nighties & Innerwear</p>
            </div>
          </Link>

          <Link href="/menswear" className="group relative h-[400px] bg-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
            <img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop" alt="Menswear" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-8 left-8 z-20">
              <h3 className="text-3xl font-bold text-white mb-2 uppercase tracking-wide">Men</h3>
              <p className="text-gray-300 text-sm tracking-widest uppercase">Essentials & Innerwear</p>
            </div>
          </Link>

          <Link href="/kidswear" className="group relative h-[400px] bg-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
            <img src="https://images.unsplash.com/photo-1519241047957-be31d7379a5d?q=80&w=800&auto=format&fit=crop" alt="Kidswear" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-8 left-8 z-20">
              <h3 className="text-3xl font-bold text-white mb-2 uppercase tracking-wide">Kids</h3>
              <p className="text-gray-300 text-sm tracking-widest uppercase">Comfort & Daily Wear</p>
            </div>
          </Link>

          <Link href="/home-accessories" className="group relative h-[400px] bg-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
            <img src="https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=800&auto=format&fit=crop" alt="Home Accessories" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-8 left-8 z-20">
              <h3 className="text-3xl font-bold text-white mb-2 uppercase tracking-wide">Home</h3>
              <p className="text-gray-300 text-sm tracking-widest uppercase">Towels & Essentials</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 🛒 LIVE SUPABASE PRODUCTS SECTION */}
      <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-200">
        <h2 className="text-4xl font-extrabold text-black text-center mb-10 uppercase tracking-tight">Latest Arrivals</h2>
        
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg uppercase tracking-widest">Loading Premium Collection...</p>
          </div>
        ) : (
          <>
            {/* Category Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button
                key="All"
                onClick={() => setActiveCategory('All')}
                className={`px-6 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-all ${
                  activeCategory === 'All' ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.filter(c => c !== 'All').map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-all ${
                    activeCategory === category ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-10 text-lg">No products found matching your search.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col bg-white">
                    
                    <Link href={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-50 cursor-pointer">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="h-full w-full object-cover group-hover:scale-110 transition duration-700"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                      <span className="absolute top-4 left-4 bg-white/90 text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-full shadow-sm backdrop-blur-sm">
                        {product.category || 'New'}
                      </span>
                    </Link>

                    <div className="p-6 flex flex-col flex-1">
                      <Link href={`/product/${product.id}`} className="hover:text-gray-500 transition-colors">
                        <h3 className="text-lg font-extrabold text-black uppercase tracking-tight truncate">{product.name}</h3>
                        <p className="text-gray-500 text-sm mt-2 line-clamp-2 min-h-[40px]">
                          {product.description || 'Premium quality fabric.'}
                        </p>
                      </Link>
                      
                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                        <span className="text-xl font-bold">₹{product.price}</span>
                        <div className="w-32">
                          <AddToCartButton product={product} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* ✨ BRAND TRUST BADGES */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center group">
              <div className="bg-gray-50 p-5 rounded-full mb-4 group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all duration-300">
                <Truck className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold uppercase tracking-wide text-black">Fast Delivery</h4>
              <p className="text-gray-500 text-sm mt-2">Delivered safely to your doorstep.</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="bg-gray-50 p-5 rounded-full mb-4 group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all duration-300">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold uppercase tracking-wide text-black">Secure Payments</h4>
              <p className="text-gray-500 text-sm mt-2">100% secure via Razorpay.</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="bg-gray-50 p-5 rounded-full mb-4 group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all duration-300">
                <Star className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold uppercase tracking-wide text-black">Premium Quality</h4>
              <p className="text-gray-500 text-sm mt-2">Finest materials for maximum comfort.</p>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}