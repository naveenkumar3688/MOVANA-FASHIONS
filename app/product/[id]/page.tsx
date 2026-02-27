'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { useCart } from '../../../context/CartContext';
// Added Home icon!
import { ShoppingBag, Zap, Truck, ShieldCheck, Loader2, Home } from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart() || { addItem: () => {} };

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(''); // Starts empty!
  
  const [mainImage, setMainImage] = useState<string>('');
  const [allImages, setAllImages] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProduct() {
      if (!params.id) return;
      
      const { data, error } = await supabase.from('products').select('*').eq('id', params.id).single();

      if (error) {
        console.error("Error fetching product:", error);
        router.push('/');
      } else if (data) {
        setProduct(data);
        
        // Setup Images
        const images = data.gallery_images && data.gallery_images.length > 0 ? data.gallery_images : [data.image_url].filter(Boolean);
        setAllImages(images);
        if (images.length > 0) setMainImage(images[0]);
        
        // Smart Size Selection: Automatically pick the first size if sizes exist!
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      }
      setLoading(false);
    }
    fetchProduct();
  }, [params.id, router]);

  // ⏱️ AUTO-SLIDE MAGIC
  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setMainImage((prev) => {
        const nextIndex = (allImages.indexOf(prev) + 1) % allImages.length;
        return allImages[nextIndex];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [allImages]);

  // 🛒 FIXED ADD TO CART
  const handleAddToCart = () => {
    // Check if the product needs a size, but none is selected
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size first!");
      return;
    }

    // Only append the size to the name IF the product actually has sizes!
    const cartName = product.sizes && product.sizes.length > 0 
      ? `${product.name} (Size: ${selectedSize})` 
      : product.name;

    addItem({
      id: product.id,
      name: cartName,
      price: product.price,
      image_url: mainImage,
      category: product.category,
      quantity: 1
    });
    alert('✨ Added to Cart!');
  };

  // ⚡ FIXED BUY NOW (Adds to cart and instantly redirects to cart page)
  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-white mb-4" /></div>;
  }
  if (!product) return null;

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 🏠 HOME BUTTON */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition text-xs font-bold uppercase tracking-widest mb-8">
          <Home className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* 📸 GALLERY SECTION */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="w-full aspect-[3/4] bg-white rounded-2xl overflow-hidden shadow-2xl relative">
              {allImages.map((img) => (
                <img key={img} src={img} alt={product.name} className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out ${mainImage === img ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} />
              ))}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide">
                {allImages.map((img, index) => (
                  <button key={index} onClick={() => setMainImage(img)} className={`w-20 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all z-20 ${mainImage === img ? 'border-white opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 🛍️ PRODUCT DETAILS */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{product.category}</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4 leading-none">{product.name}</h1>
            <p className="text-3xl font-bold mb-8">₹{product.price}</p>

            {/* 📏 SMART SIZE SELECTOR (Only shows if product has sizes!) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest mb-4">Select Size</p>
                <div className="flex gap-4 flex-wrap">
                  {product.sizes.map((size: string) => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] px-4 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all ${
                        selectedSize === size ? 'border-white bg-white text-black' : 'border-gray-600 text-white hover:border-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ⚡ ACTION BUTTONS */}
            <div className="flex flex-col gap-4 mb-10 mt-2">
              {/* Buy Now Button has an onClick now! */}
              <button onClick={handleBuyNow} className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition flex justify-center items-center gap-2">
                <Zap className="w-4 h-4" /> Buy It Now
              </button>
              
              <button onClick={handleAddToCart} className="w-full border-2 border-white text-white py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition flex justify-center items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>
            </div>

            {/* TRUST BADGES */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-300"><Truck className="w-5 h-5 text-green-500" /> Fast Delivery Across India</div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-300"><ShieldCheck className="w-5 h-5 text-blue-500" /> 100% Secure Razorpay Checkout</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}