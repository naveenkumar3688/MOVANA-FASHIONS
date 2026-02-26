'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShieldCheck, ArrowRight, Truck, Loader2, MapPin, Minus, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { cartItems = [], removeItem = () => {}, updateQuantity = () => {}, clearCart = () => {} } = useCart() || {}; 
  
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState(''); 
  const [selectedCourier, setSelectedCourier] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocating, setIsLocating] = useState(false); 
  const [isMounted, setIsMounted] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🧠 SMARTER NIGHTY DETECTOR
  const isNighty = (item: any) => {
    const nameMatch = item?.name?.toLowerCase().includes('night');
    const catMatch = item?.category?.toLowerCase().includes('night') || item?.category?.toLowerCase().includes('women');
    return nameMatch || catMatch;
  };

  // 🧮 FIXED "SETS OF 4" MATH LOGIC
  const totalItems = cartItems.reduce((sum: any, item: any) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum: any, item: any) => sum + (item.price * item.quantity), 0);
  const totalWeightKg = totalItems * 0.25; 
  const isOver1Kg = totalWeightKg > 1;

  const isTamilNadu = pincode.startsWith('6') && pincode.length === 6;
  const isOtherState = pincode.length === 6 && !pincode.startsWith('6');

  // 1. Flatten all nighties into an array of individual prices
  const nightyItems = cartItems.filter(isNighty);
  let individualNightyPrices: number[] = [];
  
  nightyItems.forEach((item: any) => {
    for (let i = 0; i < item.quantity; i++) {
      individualNightyPrices.push(item.price);
    }
  });

  // 2. Sort them from most expensive to least expensive 
  individualNightyPrices.sort((a, b) => b - a);

  // 3. Calculate how many "sets of 4" we have
  const setsOfFour = Math.floor(individualNightyPrices.length / 4);
  const megaOfferActive = setsOfFour > 0;

  // 4. Calculate the total cost of nighties WITH the offer
  let finalNightyCost = (setsOfFour * 999);

  // 5. Add the normal price of any leftover nighties
  for (let i = setsOfFour * 4; i < individualNightyPrices.length; i++) {
    finalNightyCost += individualNightyPrices[i];
  }

  // 6. Calculate the exact discount amount
  const rawNightyTotal = individualNightyPrices.reduce((sum, price) => sum + price, 0);
  const megaOfferDiscount = megaOfferActive ? (rawNightyTotal - finalNightyCost) : 0;

  // 📦 SHIPPING LOGIC
  const stCourierPrice = isOver1Kg ? 100 : 50;
  const indiaPostTnPrice = 60;
  const delhiveryPrice = 130;
  const indiaPostNatPrice = 100;

  let shippingCost = 0;
  if (selectedCourier === 'ST Courier') shippingCost = stCourierPrice;
  else if (selectedCourier === 'India Post TN') shippingCost = indiaPostTnPrice;
  else if (selectedCourier === 'India Post National') shippingCost = indiaPostNatPrice;
  else if (selectedCourier === 'Delhivery') shippingCost = delhiveryPrice;

  // FREE Shipping if they bought at least one Set of 4!
  if (megaOfferActive) {
    shippingCost = 0;
  }

  // Ensure final total is never negative
  const finalTotal = Math.max(0, subtotal - megaOfferDiscount + shippingCost);

  // 📍 FIXED GPS AUTO-DETECT
  const detectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await res.json();
            
            if (data.postcode) {
                 setPincode(data.postcode);
            } else {
                 alert("GPS found your city, but couldn't detect the exact Pincode. Please enter it manually.");
            }

            setAddress(`${data.locality || ''} ${data.city || ''}, ${data.principalSubdivision || data.adminArea || ''}, India`);
            setSelectedCourier(''); 
          } catch (err) {
            alert("Could not connect to location service. Please type address manually.");
          }
          setIsLocating(false);
        },
        () => {
          alert("Location permission denied! Please type your address manually.");
          setIsLocating(false);
        },
        { timeout: 10000 }
      );
    } else {
      alert("Your browser does not support GPS location.");
      setIsLocating(false);
    }
  };

  // 🚀 RAZORPAY CHECKOUT
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
      alert("Please complete delivery details first.");
      return;
    }

    setIsProcessing(true);
    const res = await initializeRazorpay();

    if (!res) {
      alert('Razorpay failed to load. Offline?');
      setIsProcessing(false);
      return;
    }

    try {
      const API_URL = `${window.location.origin}/api/create-order`;
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal }),
      });

      const data = await response.json();

      if (!data.orderId) {
        console.error("Backend Error:", data);
        alert('Payment Gateway Error. Please check Vercel Environment Variables.');
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
          }
          
          clearCart(); 
          alert('✨ Payment Successful! Order Placed.');
          router.push('/'); 
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
      console.error("Checkout Error:", error);
      alert("Connection error during checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black mb-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      <div className="bg-black text-white py-10 px-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-widest mb-1">Shopping Cart</h1>
        <p className="text-gray-400 tracking-widest uppercase text-[10px]">Secure Checkout</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold uppercase tracking-tight mb-4">Your Cart is Empty</h2>
            <Link href="/" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-gray-800 transition">
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-20 h-28 bg-gray-50 rounded-lg overflow-hidden shrink-0 relative">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm uppercase tracking-tight text-black truncate max-w-[150px] sm:max-w-none">{item.name}</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{item.category}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-600 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* 🔥 QUANTITY CONTROLS */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-4 text-xs font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-extrabold text-lg text-black">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 h-fit">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b pb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6 text-xs font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>₹{subtotal}</span>
                </div>

                {megaOfferActive && (
                  <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100">
                    <span>🔥 {setsOfFour * 4} for ₹{setsOfFour * 999} Offer!</span>
                    <span>- ₹{megaOfferDiscount}</span>
                  </div>
                )}
              </div>

              <div className="mb-6 border-t border-b py-6 space-y-4">
                
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Delivery Address</label>
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
                  placeholder="House No, Street, City..." 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition text-sm resize-none" 
                />

                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="Pincode (6-digits)" 
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, '')); 
                    setSelectedCourier(''); 
                  }}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition text-center tracking-widest font-bold text-lg" 
                />

                {/* COURIER OPTIONS */}
                {(isTamilNadu || isOtherState) && (
                  <div className="space-y-2 mt-4">
                     <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${isTamilNadu ? 'text-green-600' : 'text-blue-600'}`}>
                      {isTamilNadu ? 'Tamil Nadu Delivery' : 'National Delivery'}
                    </p>
                    
                    {isTamilNadu && (
                      <>
                        <CourierOption label={`ST Courier ${isOver1Kg && !megaOfferActive ? '(>1kg)' : ''}`} price={stCourierPrice} selected={selectedCourier} onSelect={setSelectedCourier} isFree={megaOfferActive} />
                        <CourierOption label="India Post" price={indiaPostTnPrice} selected={selectedCourier} onSelect={setSelectedCourier} isFree={megaOfferActive} />
                      </>
                    )}
                     {isOtherState && (
                      <>
                        <CourierOption label="Delhivery (Fast)" price={delhiveryPrice} selected={selectedCourier} onSelect={setSelectedCourier} isFree={megaOfferActive} />
                        <CourierOption label="India Post (Std)" price={indiaPostNatPrice} selected={selectedCourier} onSelect={setSelectedCourier} isFree={megaOfferActive} />
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold uppercase tracking-widest">Total</span>
                <span className="text-2xl font-black text-black">₹{finalTotal}</span>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for courier options
function CourierOption({ label, price, selected, onSelect, isFree }: any) {
  const value = label.split(' ')[0] + (label.includes('Post') ? ' Post' : '');
  return (
    <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition ${selected === value ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
      <div className="flex items-center gap-3">
        <input type="radio" name="courier" value={value} checked={selected === value} onChange={(e) => onSelect(e.target.value)} className="w-4 h-4 text-black focus:ring-black accent-black" />
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-xs font-bold">
        {isFree ? <><span className="line-through text-gray-400 mr-2">₹{price}</span><span className="text-green-600">FREE</span></> : `₹${price}`}
      </span>
    </label>
  );
}