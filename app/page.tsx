'use client'; 

import { useEffect, useState } from 'react';
import Link from 'next/link'; // Added the Link tool!
import { supabase } from '../lib/supabase'; // Make sure this path matches your setup
import AddToCartButton from '../components/AddtoCartButton';

export default function Home() {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

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

  // 3. Filter the products
  const filteredProducts = activeCategory === 'All' 
    ? allProducts 
    : allProducts.filter(p => p.category === activeCategory);

  // 4. Smooth Scroll Function for the Hero Button
  const scrollToProducts = () => {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-white text-black">
      
      {/* Hero Section */}
      <section className="bg-black text-white py-20 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold font-serif mb-4">MOVANA FASHIONS</h1>
        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
          Comfort meets Elegance. Discover our premium collection of Nighties & Essentials.
        </p>
        <button 
          onClick={scrollToProducts}
          className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition"
        >
          Shop Collection
        </button>
      </section>

      {/* Products Section (Notice the id="products-section" for scrolling) */}
      <section id="products-section" className="max-w-7xl mx-auto p-6 md:p-12">
        <h2 className="text-3xl font-bold font-serif text-center mb-8">Latest Arrivals</h2>
        
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-500 text-xl">Loading premium collection...</p>
          </div>
        ) : (
          <>
            {/* Category Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2 rounded-full font-bold transition-all ${
                    activeCategory === category 
                      ? 'bg-black text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <p className="text-center text-gray-500 py-10 text-lg">No products found in this category.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col bg-white">
                    
                    {/* Top part: Image (Clickable Link to Product Page) */}
                    <Link href={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100 cursor-pointer">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">No Image</div>
                      )}
                      <span className="absolute top-3 left-3 bg-white/90 text-black text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                        {product.category || 'New'}
                      </span>
                    </Link>

                    {/* Bottom part: Details & Button */}
                    <div className="p-4 flex flex-col flex-1">
                      {/* Title (Clickable) */}
                      <Link href={`/product/${product.id}`} className="hover:text-gray-600 transition">
                        <h3 className="text-lg font-bold font-serif truncate">{product.name}</h3>
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2 min-h-[40px]">
                          {product.description || 'Premium quality fabric.'}
                        </p>
                      </Link>
                      
                      {/* Price & Add to Cart (Separate from Link!) */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
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
    </main>
  );
}