'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShieldCheck, ArrowRight, Truck, Loader2, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { cartItems = [], removeItem = () => {}, clearCart = () => {} } = useCart() || {}; 
  
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState(''); 
  const [selectedCourier, setSelectedCourier] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocating, setIsLocating] = useState(false); // 📍 State for the GPS button
  const [isMounted, setIsMounted] = useState(false); 
  const router = useRouter();

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

  // SMARTER NIGHTY DETECTOR
  const isNighty = (item: any) => {
    const nameMatch = item?.name?.toLowerCase().includes('night');
    const catMatch = item?.category?.toLowerCase().includes('night') || item?.category?.toLowerCase().includes('women');
    return nameMatch || catMatch;
  };

  const nightyCount = cartItems.filter(isNighty).reduce((sum: any, item: any) => sum + item.quantity, 0);
  const megaOfferActive = nightyCount >= 4;
  
  const standardPriceForFour = cartItems.find(isNighty)?.price || 499;
  const megaOfferDiscount = megaOfferActive ? ((standardPriceForFour * 4) - 999) : 0;

  // 📦 SHIPPING LOGIC (Base Prices)
  const stCourierPrice = isOver1Kg ? 100 : 50;
  const indiaPostTnPrice = 60;
  const delhiveryPrice = 130;
  const indiaPostNatPrice = 100;

  // Calculate actual applied shipping cost
  let shippingCost = 0;
  if (selectedCourier === 'ST Courier') shippingCost = stCourierPrice;
  else if (selectedCourier === 'India Post TN') shippingCost = indiaPostTnPrice;
  else if (selectedCourier === 'India Post National') shippingCost = indiaPostNatPrice;
  else if (selectedCourier === 'Delhivery') shippingCost = delhiveryPrice;

  // Force shipping to 0 if Mega Offer is active!
  if (megaOfferActive) {
    shippingCost = 0;
  }

  const finalTotal = Math.max(0, subtotal - megaOfferDiscount + shippingCost);

  // 📍 GPS AUTO-DETECT FUNCTION
  const detectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Free public reverse-geocoding API
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await res.json();
            
            if (data.postcode) setPincode(data.postcode);
            setAddress(`${data.locality || data.city || ''}, ${data.principalSubdivision || data.adminArea || ''}, India`);
            setSelectedCourier(''); // Reset courier so they pick one based on new location
          } catch (err) {
            alert("Could not perfectly detect location. Please type it in.");
          }
          setIsLocating(false);
        },
        () => {
          alert("Location permission denied! Please type your address manually.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Your browser does not support GPS location.");
      setIsLocating(false);
    }
  };

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
    if (!address || pincode.length !== 6 || !selectedCourier) {
      alert("Please enter your full address, pincode, and select a courier option.");
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
      // 🛠️ BUG 1 FIX: Using absolute URL to prevent Vercel routing errors
      const API_URL = `${window.location.origin}/api/create-order`;
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal }),
      });

      const data = await response.json();

      if (!data.orderId) {
        console.error("Backend Error:", data);
        alert('Server connection error. Please make sure your Razorpay keys are loaded in Vercel!');
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
        handler: async function (paymentResponse: any) {
          const { error } = await supabase.from('orders').insert([{
            customer_name: 'Guest Customer', 
            customer_email: 'hello@movana.in',
            address: `${address}, Pincode: ${pincode}, Courier: ${selectedCourier}`,
            amount: finalTotal,
            items: cartItems, 
            payment_id: paymentResponse.razorpay_payment_id,
            status: 'Paid & Processing'
          }]);

          if (error) {
            console.error("Supabase Error:", error);
            alert("Payment successful, but we had trouble saving the order. Please contact support.");
          } else {
            clearCart(); 
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
        alert('Payment failed or cancelled. Please try again.');
        setIsProcessing(false);
      });
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Something went wrong securely connecting to checkout. Trying again later.");
    } finally {
      setIsProcessing(false);
    }
  };

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

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 h-fit">
              <h2 className="text-lg font-bold uppercase tracking-widest mb-6 border-b pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{subtotal}</span>
                </div>

                {megaOfferActive && (
                  <div className="flex justify-between text-green-600 font-bold bg-green-50 p-3 rounded-xl border border-green-100">
                    <span>🔥 4 for ₹999 Offer Applied!</span>
                    <span>- ₹{megaOfferDiscount}</span>
                  </div>
                )}
              </div>

              <div className="mb-6 border-t border-b py-6">
                
                {/* 📍 BUG 3 FIX: AUTO-DETECT LOCATION BUTTON */}
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Delivery Address</label>
                  <button 
                    onClick={detectLocation}
                    className="text-[10px] bg-black text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-widest hover:bg-gray-800 flex items-center gap-1 transition-all"
                  >
                    {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                    Auto-Detect
                  </button>
                </div>

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
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition mb-6 text-center tracking-widest font-bold text-lg" 
                />

                {/* 🚚 BUG 2 FIX: COURIER OPTIONS ALWAYS SHOW (WITH FREE STRIKETHROUGH) */}
                {isTamilNadu && (
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-widest text-green-600 font-bold mb-2">Tamil Nadu Delivery Detected</p>
                    <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="courier" value="ST Courier" checked={selectedCourier === 'ST Courier'} onChange={(e) => setSelectedCourier(e.target.value)} className="w-4 h-4 text-black focus:ring-black" />
                        <span className="text-sm font-bold uppercase tracking-wide">ST Courier {isOver1Kg && !megaOfferActive && '(Over 1kg)'}</span>
                      </div>
                      <span className="text-sm font-bold">
                        {megaOfferActive ? <><span className="line-through text-gray-400 mr-2">₹{stCourierPrice}</span><span className="text-green-600">FREE</span></> : `₹${stCourierPrice}`}
                      </span>
                    </label>
                    <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="courier" value="India Post TN" checked={selectedCourier === 'India Post TN'} onChange={(e) => setSelectedCourier(e.target.value)} className="w-4 h-4 text-black focus:ring-black" />
                        <span className="text-sm font-bold uppercase tracking-wide">India Post</span>
                      </div>
                      <span className="text-sm font-bold">
                        {megaOfferActive ? <><span className="line-through text-gray-400 mr-2">₹{indiaPostTnPrice}</span><span className="text-green-600">FREE</span></> : `₹${indiaPostTnPrice}`}
                      </span>
                    </label>
                  </div>
                )}

                {isOtherState && (
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold mb-2">National Delivery Detected</p>
                    <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="courier" value="Delhivery" checked={selectedCourier === 'Delhivery'} onChange={(e) => setSelectedCourier(e.target.value)} className="w-4 h-4 text-black focus:ring-black" />
                        <span className="text-sm font-bold uppercase tracking-wide">Delhivery (Fast)</span>
                      </div>
                      <span className="text-sm font-bold">
                        {megaOfferActive ? <><span className="line-through text-gray-400 mr-2">₹{delhiveryPrice}</span><span className="text-green-600">FREE</span></> : `₹${delhiveryPrice}`}
                      </span>
                    </label>
                    <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="courier" value="India Post National" checked={selectedCourier === 'India Post National'} onChange={(e) => setSelectedCourier(e.target.value)} className="w-4 h-4 text-black focus:ring-black" />
                        <span className="text-sm font-bold uppercase tracking-wide">India Post (Standard)</span>
                      </div>
                      <span className="text-sm font-bold">
                        {megaOfferActive ? <><span className="line-through text-gray-400 mr-2">₹{indiaPostNatPrice}</span><span className="text-green-600">FREE</span></> : `₹${indiaPostNatPrice}`}
                      </span>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold uppercase tracking-widest">Total</span>
                <span className="text-3xl font-black text-black">₹{finalTotal}</span>
              </div>

              <button 
                onClick={handlePayment}
                disabled={!selectedCourier || pincode.length !== 6 || isProcessing || !address}
                className="w-full flex justify-center items-center gap-2 bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <><ShieldCheck className="w-5 h-5" /> Pay Securely</>
                )}
              </button>
              
              {(!selectedCourier || pincode.length !== 6 || !address) && (
                <p className="text-center text-[10px] text-red-500 uppercase tracking-widest mt-3 font-bold">
                  *Please detect/enter your address and select a delivery partner.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}