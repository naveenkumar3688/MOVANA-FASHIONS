'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShieldCheck, ArrowRight, Truck, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  // 🛡️ SAFETY SHIELD 1: Give default empty arrays/functions in case context is still loading
  const { cartItems = [], removeItem = () => {}, clearCart = () => {} } = useCart() || {}; 
  
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState(''); 
  const [selectedCourier, setSelectedCourier] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // 🛡️ SAFETY SHIELD 2: Hydration Fix
  const router = useRouter();

  // Wait until the page fully loads before showing the cart to prevent Next.js crashes
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🧮 THE MATH & MEGA OFFER LOGIC
  const totalItems = cartItems.reduce((sum: any, item: any) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum: any, item: any) => sum + (item.price * item.quantity), 0);
  const totalWeightKg = totalItems * 0.25; 
  const isOver1Kg = totalWeightKg > 1;

  const isTamilNadu = pincode.startsWith('6') && pincode.length === 6;
  const isOtherState = pincode.length === 6 && !pincode.startsWith('6');

  // Check for womenswear/nighties safely
  const nightyCount = cartItems.filter((item: any) => 
    item?.category === 'Womenswear' || item?.name?.toLowerCase().includes('nighty')
  ).reduce((sum: any, item: any) => sum + item.quantity, 0);
  
  const megaOfferActive = nightyCount >= 4;
  
  const standardPriceForFour = cartItems.find((i: any) => 
    i?.category === 'Womenswear' || i?.name?.toLowerCase().includes('nighty')
  )?.price || 499;
  
  const megaOfferDiscount = megaOfferActive ? ((standardPriceForFour * 4) - 999) : 0;

  // 📦 SHIPPING LOGIC
  let shippingCost = 0;
  if (megaOfferActive) {
    shippingCost = 0; 
  } else if (selectedCourier === 'ST Courier') {
    shippingCost = isOver1Kg ? 100 : 50;
  } else if (selectedCourier === 'India Post TN') {
    shippingCost = 60; 
  } else if (selectedCourier === 'India Post National') {
    shippingCost = 100; 
  } else if (selectedCourier === 'Delhivery') {
    shippingCost = 130; 
  }

  // Ensure total never goes negative
  const finalTotal = Math.max(0, subtotal - megaOfferDiscount + shippingCost);

  // 🚀 RAZORPAY & SUPABASE CHECKOUT
  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!address || pincode.length !== 6) {
      alert("Please enter your full address and a valid pincode.");
      return;
    }

    setIsProcessing(true);
    const res = await initializeRazorpay();

    if (!res) {
      alert('Razorpay failed to load. Please check your internet connection.');
      setIsProcessing(false);
      return;
    }

    try {
      // Get Order ID from your backend
      const data = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal }),
      }).then((t) => t.json());

      if (!data.orderId) {
        alert('Server error. Could not connect to payment gateway.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        name: 'MOVANA FASHIONS',
        currency: 'INR',
        amount: finalTotal * 100,
        order_id: data.orderId,
        description: 'Premium Essentials',
        theme: { color: '#000000' },
        handler: async function (response: any) {
          
          // 🎉 PAYMENT SUCCESSFUL! NOW SAVE TO SUPABASE!
          const { error } = await supabase.from('orders').insert([{
            customer_name: 'Guest Customer', 
            customer_email: 'hello@movana.in',
            address: `${address}, Pincode: ${pincode}, Courier: ${selectedCourier || 'Free Offer Delivery'}`,
            amount: finalTotal,
            items: cartItems, 
            payment_id: response.razorpay_payment_id,
            status: 'Paid & Processing'
          }]);

          if (error) {
            console.error("Supabase Error:", error);
            alert("Payment successful, but we had trouble saving the order. Please contact support.");
          } else {
            clearCart(); // Safely clear using context
            alert('✨ Payment Successful! Your premium essentials are on the way.');
            router.push('/'); 
          }
        },
        prefill: {
          name: 'Guest Customer',
          email: 'hello@movana.in',
          contact: '9999999999',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      
      paymentObject.on('payment.failed', function () {
        alert('Payment failed or cancelled.');
        setIsProcessing(false);
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong during checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 🛡️ If the page hasn't mounted yet, show a clean loading spinner instead of crashing!
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
        <p className="text-sm uppercase tracking-widest text-gray-500 font-bold">Loading Cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      
      {/* HEADER */}
      <div className="bg-black text-white py-12 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-widest mb-2">Shopping Cart</h1>
        <p className="text-gray-400 tracking-widest uppercase text-xs">Secure Checkout</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4">Your Cart is Empty</h2>
            <Link href="/" className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition">
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* LEFT COLUMN: ITEMS */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex gap-6 p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
                  <div className="w-24 h-32 bg-gray-50 rounded-xl overflow-hidden shrink-0 relative">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg uppercase tracking-tight text-black">{item.name}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{item.category}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-600 transition">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-extrabold text-xl text-black">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN: SUMMARY & SHIPPING */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 h-fit">
              <h2 className="text-lg font-bold uppercase tracking-widest mb-6 border-b pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{subtotal}</span>
                </div>

                {/* MEGA OFFER ALERT */}
                {megaOfferActive && (
                  <div className="flex justify-between text-green-600 font-bold bg-green-50 p-3 rounded-xl border border-green-100">
                    <span>🔥 4 for ₹999 Offer Applied!</span>
                    <span>- ₹{megaOfferDiscount}</span>
                  </div>
                )}
              </div>

              {/* ADDRESS, PINCODE & SHIPPING ENGINE */}
              <div className="mb-6 border-t border-b py-6">
                
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Full Delivery Address</label>
                <textarea 
                  rows={2}
                  placeholder="House No, Street, Landmark..." 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition mb-4 text-sm" 
                />

                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Delivery Pincode</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode" 
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    setSelectedCourier(''); 
                  }}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition mb-4 text-center tracking-widest font-bold text-lg" 
                />

                {/* TAMIL NADU OPTIONS */}
                {isTamilNadu && !megaOfferActive && (
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-widest text-green-600 font-bold mb-2">Tamil Nadu Delivery Detected</p>
                    <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="courier" value="ST Courier" onChange={(e) => setSelectedCourier(e.target.value)} className="w-4 h-4 text-black focus:ring-black" />
                        <span className="text-sm font-bold uppercase tracking-wide">ST Courier {isOver1Kg && '(Over 1kg)'}</span>
                      </div>
                      <span className="text-sm font-bold">₹{isOver1Kg ? 100 : 50}</span>
                    </label>
                    <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="courier" value="India Post TN" onChange={(e) => setSelectedCourier(e.target.value)} className="w-4 h-4 text-black focus:ring-black" />
                        <span className="text-sm font-bold uppercase tracking-wide">India Post</span>
                      </div>
                      <span className="text-sm font-bold">₹60</span>
                    </label>
                  </div>
                )}

                {/* OTHER STATES OPTIONS */}
                {isOtherState && !megaOfferActive && (
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mb-2">National Delivery Detected</p>
                    <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="courier" value="Delhivery" onChange={(e) => setSelectedCourier(e.target.value)} className="w-4 h-4 text-black focus:ring-black" />
                        <span className="text-sm font-bold uppercase tracking-wide">Delhivery (Fast)</span>
                      </div>
                      <span className="text-sm font-bold">₹130</span>
                    </label>
                    <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="courier" value="India Post National" onChange={(e) => setSelectedCourier(e.target.value)} className="w-4 h-4 text-black focus:ring-black" />
                        <span className="text-sm font-bold uppercase tracking-wide">India Post (Standard)</span>
                      </div>
                      <span className="text-sm font-bold">₹100</span>
                    </label>
                  </div>
                )}

                {/* FREE SHIPPING MESSAGE FOR OFFER */}
                {megaOfferActive && (
                  <div className="bg-green-600 text-white p-4 rounded-xl flex items-center gap-3">
                    <Truck className="w-6 h-6" />
                    <div>
                      <p className="font-bold text-sm uppercase tracking-wide">Free Shipping Unlocked!</p>
                      <p className="text-xs text-green-100">Your Mega Offer includes free delivery anywhere in India.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* FINAL TOTAL */}
              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold uppercase tracking-widest">Total</span>
                <span className="text-3xl font-black text-black">₹{finalTotal}</span>
              </div>

              <button 
                onClick={handlePayment}
                disabled={(!megaOfferActive && (!selectedCourier || pincode.length !== 6)) || isProcessing || !address}
                className="w-full flex justify-center items-center gap-2 bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5" /> Pay Securely</>
                )}
              </button>
              
              {(!megaOfferActive && (!selectedCourier || pincode.length !== 6 || !address)) && (
                <p className="text-center text-[10px] text-red-500 uppercase tracking-widest mt-3 font-bold">
                  *Please enter your full address, valid pincode, and select a courier.
                </p>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}