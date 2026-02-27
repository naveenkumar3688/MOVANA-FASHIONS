'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
// ✅ Double-check: Is your file named 'AddtoCartButton' or 'AddToCartButton'?
// If this line turns red, change the 't' to 'T'!
import AddToCartButton from '../../components/AddtoCartButton'; 
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function MenswearPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenswear() {
      console.log("Fetching Menswear..."); // 🕵️‍♂️ Check your browser console!
      
      // 🚨 Fix for empty page: This will fetch EVERYTHING if no 'Men' category exists yet
      // so you can at least see the page works!
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('category', '%men%'); 
      
      if (error) console.error("Supabase Error:", error);
      
      if (data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchMenswear();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      <div className="bg-black text-white py-16 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-widest mb-4">Menswear</h1>
        <p className="text-gray-400 tracking-wide uppercase text-sm">Premium Nighties & Innerwear</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-8 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* 🚨 DEBUG MESSAGE: If you see this, the page WORKS! */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8">
            <p className="font-bold">Debug Mode:</p>
            <p>If you can read this, the Menswear page is FINALLY working! (Now check Supabase for data)</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-black" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">
            No products found with category 'Menswear'. <br/>
            (Go to Supabase and add a row with category: <strong>Menswear</strong>)
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col bg-white">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition duration-700" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-extrabold text-black uppercase tracking-tight truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                    <span className="text-xl font-bold">₹{product.price}</span>
                    <div className="w-32"><AddToCartButton product={product} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}