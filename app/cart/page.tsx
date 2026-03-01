'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, CreditCard, ArrowRight, Loader2, MapPin, Minus, Plus, Truck, Package } from 'lucide-react';
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

  // 🛍️ MEGA OFFER LOGIC (4 Nighties for 999)
  const isNighty = (item: any) => {
    const nameMatch = item?.name?.toLowerCase().includes('night');
    const catMatch = item?.category?.toLowerCase().includes('night') || item?.category?.toLowerCase().includes('women');
    return nameMatch || catMatch;
  };

  const nightyItems = cartItems.filter(isNighty);
  let individualNightyPrices: number[] = [];
  
  nightyItems.forEach((item: any) => {
    for (let i = 0; i < item.quantity; i++) {
      individualNightyPrices.push(item.price);
    }
  });

  individualNightyPrices.sort((a, b) => b - a);

  const setsOfFour = Math.floor(individualNightyPrices.length / 4);
  const megaOfferActive = setsOfFour > 0;

  let finalNightyCost = (setsOfFour * 999);
  for (let i = setsOfFour * 4; i < individualNightyPrices.length; i++) {
    finalNightyCost += individualNightyPrices[i];
  }

  const rawNightyTotal = individualNightyPrices.reduce((sum, price) => sum + price, 0);
  const megaOfferDiscount = megaOfferActive ? (rawNightyTotal - finalNightyCost) : 0;
  
  // Basic Totals
  const totalItems = cartItems.reduce((sum: any, item: any) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum: any, item: any) => sum + (item.price * item.quantity), 0);

  // ⚖️ NEW WEIGHT CALCULATION
  // Defaults to 0.5kg per item if 'weight' is missing in DB
  const totalWeight = cartItems.reduce((sum: number, item: any) => sum + ((item.weight || 0.5) * item.quantity), 0);

  // 🚚 NEW COURIER LOGIC
  const isTamilNadu = pincode.startsWith('6') && pincode.length === 6;
  const isOtherState = pincode.length === 6 && !pincode.startsWith('6');

  const getShippingOptions = () => {
    if (!pincode || pincode.length !== 6) return [];

    const options = [];

    // --- INDIA POST PRICES (Same for everyone) ---
    let indiaPostPrice = 0;
    if (totalWeight < 1) indiaPostPrice = 60;
    else if (totalWeight >= 1 && totalWeight < 2) indiaPostPrice = 100;
    else indiaPostPrice = 200; // > 2kg

    // Always add India Post
    options.push({
      id: 'India Post',
      label: 'India Post',
      price: indiaPostPrice,
      desc: 'All India Service'
    });

    // --- ST COURIER PRICES (TN Only) ---
    if (isTamilNadu) {
      let stPrice = 0;
      if (totalWeight < 1) stPrice = 50;
      else if (totalWeight >= 1 && totalWeight < 2) stPrice = 100;
      else stPrice = 200; // > 2kg

      options.push({
        id: 'ST Courier',
        label: 'ST Courier',
        price: stPrice,
        desc: 'Fast TN Delivery'
      });
    }

    return options;
  };

  const shippingOptions = getShippingOptions();
  
  // Determine Shipping Cost
  let shippingCost = 0;
  const selectedOption = shippingOptions.find(opt => opt.id === selectedCourier);
  if (selectedOption) {
    shippingCost = selectedOption.price;
  }

  // 🎁 Free Shipping if Mega Offer is Active?
  // If you want to CHARGE shipping even on Mega Offer, comment out this if-block:
  if (megaOfferActive) {
    shippingCost = 0;
  }

  const finalTotal = Math.max(0, subtotal - megaOfferDiscount + shippingCost);

  // 📍 LOCATION DETECTION
  const detectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await res.json();
            
            if (data.postcode) setPincode(data.postcode);
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

  // 💳 PAYMENT
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Please log in to your account to complete your purchase!");
      router.push('/login'); 
      return;
    }

    const customerEmail = session.user.email; 

    if (!address) { alert("Please enter your full delivery address."); return; }
    if (pincode.length !== 6) { alert("Please enter a valid 6-digit Pincode."); return; }
    // Ensure courier is selected (unless it's a free mega offer where courier might be auto-assigned)
    if (!selectedCourier && !megaOfferActive) { alert("Please select a delivery partner."); return; }

    setIsProcessing(true);
    const res = await initializeRazorpay();

    if (!res) {
      alert('Razorpay failed to load.');
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal }),
      });

      if (!response.ok) throw new Error('Payment initialization failed');

      const data = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        name: 'MOVANA FASHIONS',
        currency: 'INR',
        amount: finalTotal * 100,
        order_id: data.orderId,
        description: 'Premium Essentials',
        theme: { color: '#000000' },
        handler: async function (paymentResponse: any) {
          
          const courierToSave = megaOfferActive && !selectedCourier ? 'Free Offer Delivery' : selectedCourier;

          const { error } = await supabase.from('orders').insert([{
            customer_name: 'Customer', 
            customer_email: customerEmail, 
            address: `${address}, Pincode: ${pincode}, Courier: ${courierToSave}`,
            amount: finalTotal,
            items: cartItems, 
            payment_id: paymentResponse.razorpay_payment_id,
            status: 'Paid & Processing'
          }]);

          if (!error) {
            localStorage.setItem('lastOrder', JSON.stringify({
              paymentId: paymentResponse.razorpay_payment_id,
              address: address,
              pincode: pincode,
              courier: courierToSave,
              items: cartItems,
              total: finalTotal
            }));
            clearCart(); 
            window.location.href = `/success?payment_id=${paymentResponse.razorpay_payment_id}`; 
          }
        },
        prefill: {
          name: 'Customer',
          email: customerEmail, 
          contact: '', 
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      
      paymentObject.on('payment.failed', function () {
        alert('Payment failed or cancelled.');
        setIsProcessing(false);
      });
    } catch (error: any) {
      console.error("Checkout Error:", error);
      alert(`Checkout Error: ${error.message}`);
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
                        {/* Show Item Weight */}
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Package className="w-3 h-3"/> {(item.weight || 0.5)} kg</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-600 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-gray-100 transition"><Minus className="w-3 h-3" /></button>
                        <span className="px-4 text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-100 transition"><Plus className="w-3 h-3" /></button>
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
                <div className="flex justify-between">
                  <span>Total Weight</span>
                  <span>{totalWeight.toFixed(2)} kg</span>
                </div>

                {megaOfferActive && (
                  <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100">
                    <span>🔥 {setsOfFour * 4} for ₹{setsOfFour * 999} Offer!</span>
                    <span>- ₹{megaOfferDiscount}</span>
                  </div>
                )}
              </div>

              <div className="mb-6 border-t border-b py-6 space-y-4">
                
                {/* 📍 ADDRESS INPUT */}
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

                {/* 🚚 DYNAMIC COURIER OPTIONS */}
                {(pincode.length === 6) && (
                  <div className="space-y-2 mt-4 animate-fadeIn">
                     <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${isTamilNadu ? 'text-green-600' : 'text-blue-600'}`}>
                      {isTamilNadu ? 'Tamil Nadu Delivery' : 'National Delivery'}
                    </p>
                    
                    {shippingOptions.length > 0 ? (
                      shippingOptions.map((option) => (
                        <CourierOption 
                          key={option.id}
                          label={option.label} 
                          desc={option.desc}
                          value={option.id} 
                          price={option.price} 
                          selected={selectedCourier} 
                          onSelect={setSelectedCourier} 
                          isFree={megaOfferActive} 
                        />
                      ))
                    ) : (
                       <p className="text-xs text-red-500">Service not available for this Pincode.</p>
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
                disabled={isProcessing}
                className="w-full flex justify-center items-center gap-2 bg-black text-white py-4 rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard className="w-5 h-5 mr-1" /> Pay Now with Razorpay</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CourierOption({ label, desc, value, price, selected, onSelect, isFree }: any) {
  return (
    <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition ${selected === value ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}`}>
      <div className="flex items-center gap-3">
        <input type="radio" name="courier" value={value} checked={selected === value} onChange={(e) => onSelect(e.target.value)} className="w-4 h-4 text-black focus:ring-black accent-black" />
        <div>
           <span className="text-xs font-bold uppercase tracking-wide block">{label}</span>
           <span className="text-[10px] text-gray-500 font-medium">{desc}</span>
        </div>
      </div>
      <span className="text-xs font-bold">
        {isFree ? <><span className="line-through text-gray-400 mr-2">₹{price}</span><span className="text-green-600">FREE</span></> : `₹${price}`}
      </span>
    </label>
  );
}