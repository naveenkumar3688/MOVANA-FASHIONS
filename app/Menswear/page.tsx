'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AddToCartButton from '../../components/AddtoCartButton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MenswearPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenswear() {
      // 🚨 Exact match for Menswear!
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Menswear'); 
      
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchMenswear();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      {/* HEADER */}
      <div className="bg-black text-white py-16 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-widest mb-4">Menswear</h1>
        <p className="text-gray-400 tracking-wide uppercase text-sm">Premium Essentials & Innerwear</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-8 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold uppercase tracking-widest">Loading Collection...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">No products found in Menswear yet.</div>
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
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 min-h-[40px]">{product.description}</p>
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