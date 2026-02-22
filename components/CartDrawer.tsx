'use client';

import { useState } from 'react';
import { X, Trash2, ShoppingCart, ArrowLeft, CreditCard, MapPin, Loader2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { supabase } from '../lib/supabase'; 
import { useRouter } from 'next/navigation'; 

export default function CartDrawer() {
  const { isOpen, setIsOpen, items, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');
  
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState(''); 
  const [isLocating, setIsLocating] = useState(false); 
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support location features.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          
          if (data && data.display_name) {
            setAddress(data.display_name); 
          } else {
            alert("Could not fetch the exact address. Please type it manually.");
          }
        } catch (error) {
          console.error("Location Error:", error);
          alert("Error finding your street. Please type your address manually.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("Please allow location permissions in your browser to use this feature.");
        setIsLocating(false);
      }
    );
  };

  const handleRazorpayPayment = async () => {
    if (!customerName || !address) {
      alert("Please enter your name and complete address for delivery!");
      return;
    }

    setLoading(true);
    try {
      // 1. THE LOGIN WALL
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Please log in to your account to place an order!");
        setIsOpen(false); 
        router.push('/login'); 
        setLoading(false);
        return; 
      }

      // 2. LOAD RAZORPAY SCRIPT
      const loadScript = () => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isScriptLoaded = await loadScript();
      if (!isScriptLoaded) {
        alert("Failed to load Razorpay script. An adblocker or Brave Shields might be blocking it!");
        setLoading(false);
        return;
      }

      // 3. CREATE THE ORDER ON VERCEL
      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount }),
      });
      
      // 🚨 TRUTH SERUM: If the Vercel backend fails, this tells us exactly why!
      if (!res.ok) {
        const errorText = await res.text();
        alert(`Vercel Backend Error (${res.status}): ${errorText}`);
        setLoading(false);
        return;
      }

      const data = await res.json();

      // 4. OPEN RAZORPAY POPUP
      const options = {
        key: data.keyId,
        amount: totalAmount * 100,
        currency: "INR",
        name: "MOVANA FASHIONS",
        description: "Premium Clothing Order",
        order_id: data.orderId,
        
        handler: async function (response: any) {
          // 5. SAVE TO SUPABASE ORDERS TABLE
          const { error } = await supabase.from('orders').insert({
            customer_name: customerName,
            customer_email: session.user.email,
            address: address,
            amount: totalAmount,
            items: items, 
            payment_id: response.razorpay_payment_id,
            status: 'Processing'
          });

          if (error) {
            console.error("Supabase Save Error:", error);
            alert("Payment worked, but we had trouble saving the order. ID: " + response.razorpay_payment_id);
          } else {
            alert("Payment Successful! Order Placed! 🎉 ID: " + response.razorpay_payment_id);
            clearCart();
            setIsOpen(false);
            setCheckoutStep('cart');
            setAddress('');
            setCustomerName('');
          }
        },
        prefill: { 
          name: customerName,
          email: session.user.email 
        },
        theme: { color: "#000000" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error("Detailed Payment Error:", err);
      // 🚨 TRUTH SERUM: Shows the exact network/browser block message!
      alert("Network/Browser Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
      
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col">
        
        <div className="p-5 border-b flex items-center justify-between bg-gray-50">
          {checkoutStep === 'details' ? (
            <button onClick={() => setCheckoutStep('cart')} className="flex items-center gap-2 font-bold"><ArrowLeft className="w-5 h-5" /> Back</button>
          ) : (
            <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Cart</h2>
          )}
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {checkoutStep === 'cart' ? (
            items.length === 0 ? <p className="text-center py-10 font-medium text-gray-500">Your cart is empty.</p> : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b pb-4">
                    <img src={item.image_url} alt={item.name} className="w-20 h-24 object-cover rounded shadow-sm" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="font-bold text-gray-700">₹{item.price}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex border rounded-lg overflow-hidden shadow-sm">
                          <button className="px-3 py-1 bg-gray-50 hover:bg-gray-100 transition" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                          <span className="px-3 py-1 font-medium bg-white">{item.quantity}</span>
                          <button className="px-3 py-1 bg-gray-50 hover:bg-gray-100 transition" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-2 hover:bg-red-50 rounded-full transition">
                          <Trash2 className="text-red-500 w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-black transition" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Complete Delivery Address</label>
                <div className="relative">
                  <textarea 
                    placeholder="Enter your full door number, street, city, and state..." 
                    className="w-full border-2 border-gray-200 p-3 rounded-lg outline-none focus:border-black transition min-h-[120px] resize-none pr-12" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                  />
                  <button 
                    type="button"
                    onClick={handleGetLocation} 
                    disabled={isLocating}
                    title="Use my current location"
                    className="absolute right-3 top-3 p-2 bg-black text-white hover:bg-gray-800 rounded-full transition shadow-md disabled:bg-gray-400"
                  >
                    {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between mb-4 font-bold text-xl text-gray-900">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
            {checkoutStep === 'cart' ? (
              <button onClick={() => setCheckoutStep('details')} className="w-full bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition shadow-lg">
                Proceed to Delivery
              </button>
            ) : (
              <button onClick={handleRazorpayPayment} disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-lg disabled:bg-gray-400">
                <CreditCard className="w-6 h-6" /> {loading ? "Securely Processing..." : "Pay Now with Razorpay"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}