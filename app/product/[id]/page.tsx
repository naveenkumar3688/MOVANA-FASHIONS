'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase'; // Goes up 3 folders to find lib
import AddToCartButton from '../../../components/AddtoCartButton';
import { Loader2, ShieldCheck, Truck } from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('L');

  const sizes = ['M', 'L', 'XL', 'XXL'];

  // 1. Fetch the exact product using the ID from the URL
  useEffect(() => {
    async function fetchProduct() {
      if (!params?.id) return;
      const { data } = await supabase.from('products').select('*').eq('id', params.id).single();
      setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [params?.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-black w-12 h-12" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-2xl font-bold">Product not found 😢</div>;

  // PRO-TIP: We append the size to the product ID and Name!
  // This means your cart will correctly separate a "Size M" nighty from a "Size L" nighty.
  const productWithSize = {
    ...product,
    id: `${product.id}-${selectedSize}`,
    name: `${product.name} - Size ${selectedSize}`
  };

  return (
    <div className="min-h-screen bg-white text-black py-12 px-4 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Left Side: Massive Image */}
        <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-[3/4] shadow-sm">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="flex flex-col justify-center">
          <span className="text-gray-500 tracking-widest text-sm uppercase mb-2">{product.category || 'Nighties'}</span>
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">{product.name}</h1>
          <p className="text-3xl font-semibold mb-6">₹{product.price}</p>
          
          <p className="text-gray-600 mb-8 leading-relaxed text-lg">
            {product.description || 'Experience premium comfort with MOVANA FASHIONS. Designed for a perfect fit and ultimate relaxation.'}
          </p>

          {/* Interactive Size Selector */}
          <div className="mb-10">
            <h3 className="font-bold mb-4 uppercase tracking-wider text-sm">Select Size</h3>
            <div className="flex gap-4">
              {sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-14 h-14 rounded-full font-bold border-2 transition-all flex items-center justify-center ${
                    selectedSize === size 
                      ? 'border-black bg-black text-white scale-110 shadow-md' 
                      : 'border-gray-300 text-gray-600 hover:border-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <div className="w-full md:w-2/3 mb-10">
            <AddToCartButton product={productWithSize} />
          </div>

          {/* Premium Trust Badges */}
          <div className="border-t border-gray-100 pt-6 space-y-4 text-gray-600">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-green-600" />
              <span className="font-medium">Fast WhatsApp Delivery across India</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <span className="font-medium">Premium Quality Guaranteed</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}