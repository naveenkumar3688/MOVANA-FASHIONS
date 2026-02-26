'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
import { supabase } from '../../../lib/supabase';
import AddToCartButton from '../../../components/AddtoCartButton';
import { Loader2, ShieldCheck, Truck, Zap } from 'lucide-react';
import { useCart } from '../../../context/CartContext'; // 👈 USING THE NEW MASTER CART ENGINE

export default function ProductPage() {
  const params = useParams();
  const router = useRouter(); 
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('L');
  
  // 👈 WE DROPPED THE OLD STORE AND GRABBED THE GLOBAL INTERCOM
  const { addToCart } = useCart(); 

  const sizes = ['M', 'L', 'XL', 'XXL'];

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

  const productWithSize = {
    ...product,
    id: `${product.id}-${selectedSize}`, // Keeps sizes separated in the cart!
    name: `${product.name} (Size: ${selectedSize})`
  };

  // 🚀 BRAND NEW SMART BUY BUTTON
  const handleBuyNow = async () => {
    // 1. Check if they are logged in!
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      alert("Please log in to your account to place an order!");
      router.push('/login'); // Sends them straight to the login page!
      return; 
    }

    // 2. If logged in, add to the global cart and instantly jump to the Cart Page!
    addToCart(productWithSize);
    router.push('/cart'); // 👈 JUMPS TO OUR MASTER CART PAGE
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-black py-12 px-4 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Left Side: Image */}
        <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-[3/4] shadow-sm">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="flex flex-col justify-center">
          <span className="text-gray-500 tracking-widest text-sm uppercase mb-2">{product.category}</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 uppercase">{product.name}</h1>
          <p className="text-3xl font-semibold mb-6">₹{product.price}</p>
          
          <div className="mb-10">
            <h3 className="font-bold mb-4 uppercase tracking-wider text-sm">Select Size</h3>
            <div className="flex gap-4">
              {sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-14 h-14 rounded-full font-bold border-2 transition-all flex items-center justify-center ${
                    selectedSize === size ? 'border-black bg-black text-white scale-110 shadow-md' : 'border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 w-full md:w-3/4 mb-10">
            <button 
              onClick={handleBuyNow}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" /> Buy It Now
            </button>
            <div className="w-full border border-black rounded-xl overflow-hidden">
               <AddToCartButton product={productWithSize} />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4 text-gray-600">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-green-600" />
              <span className="font-medium text-sm tracking-wide">Fast Delivery Across India</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <span className="font-medium text-sm tracking-wide">100% Secure Razorpay Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}