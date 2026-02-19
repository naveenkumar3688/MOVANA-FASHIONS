'use client';

import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function CartDrawer() {
  const { isOpen, setIsOpen, items, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleRazorpayPayment = async () => {
    if (!customerName || !pincode) {
      alert("Please enter details for delivery!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount }),
      });
      
      const data = await res.json();

      const options = {
        key: data.keyId,
        amount: totalAmount * 100,
        currency: "INR",
        name: "MOVANA FASHIONS",
        description: "Order Payment",
        order_id: data.orderId,
        handler: function (response: any) {
          alert("Payment Successful! ID: " + response.razorpay_payment_id);
          clearCart();
          setIsOpen(false);
          setCheckoutStep('cart');
        },
        prefill: { name: customerName },
        theme: { color: "#000000" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment failed to initialize.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col">
        
        <div className="p-5 border-b flex items-center justify-between bg-gray-50">
          {checkoutStep === 'details' ? (
            <button onClick={() => setCheckoutStep('cart')} className="flex items-center gap-2 font-bold"><ArrowLeft /> Back</button>
          ) : (
            <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart /> Cart</h2>
          )}
          <button onClick={() => setIsOpen(false)}><X /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {checkoutStep === 'cart' ? (
            items.length === 0 ? <p className="text-center py-10">Cart is empty</p> : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 mb-6 border-b pb-4">
                  <img src={item.image_url} className="w-20 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="font-bold">₹{item.price}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex border rounded">
                        <button className="px-2" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span className="px-2">{item.quantity}</span>
                        <button className="px-2" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)}><Trash2 className="text-red-500 w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="space-y-4">
              <input placeholder="Full Name" className="w-full border p-3 rounded" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              <input placeholder="Pincode" className="w-full border p-3 rounded" value={pincode} onChange={e => setPincode(e.target.value)} />
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t">
            <div className="flex justify-between mb-4 font-bold text-xl"><span>Total</span><span>₹{totalAmount}</span></div>
            {checkoutStep === 'cart' ? (
              <button onClick={() => setCheckoutStep('details')} className="w-full bg-black text-white py-4 rounded-full font-bold">Proceed to Checkout</button>
            ) : (
              <button onClick={handleRazorpayPayment} disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2">
                <CreditCard /> {loading ? "Processing..." : "Pay Now"}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}