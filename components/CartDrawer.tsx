'use client';

import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function CartDrawer() {
  const { isOpen, setIsOpen, items, removeFromCart, updateQuantity } = useCartStore();
  
  // NEW: State to manage the checkout form
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [pincode, setPincode] = useState('');

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleWhatsAppCheckout = () => {
    if (!customerName || !pincode) {
      alert("Please enter your name and pincode to continue!");
      return;
    }

    // Notice how item.name will automatically include the Size if they picked one!
    const message = items.map(item => `▪ ${item.quantity}x ${item.name} (₹${item.price})`).join('\n');
    const totalText = `\n*Total Amount: ₹${totalAmount}*`;
    const customerInfo = `\n\n*Customer Details:*\n👤 Name: ${customerName}\n📍 Pincode: ${pincode}`;
    const greeting = "Hi MOVANA FASHIONS! 🛍️ I would like to place an order:\n\n";
    
    // 🚨 IMPORTANT: Replace this number with your actual business WhatsApp number!
    const whatsappUrl = `https://wa.me/918072081691?text=${encodeURIComponent(greeting + message + totalText + customerInfo)}`;
    window.open(whatsappUrl, '_blank');
    
    // Reset the form after checkout
    setCheckoutStep('cart');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)} 
      />
      
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header changes based on which step we are on */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          {checkoutStep === 'details' ? (
            <button onClick={() => setCheckoutStep('cart')} className="flex items-center gap-2 text-gray-600 hover:text-black font-bold">
              <ArrowLeft className="w-5 h-5" /> Back to Cart
            </button>
          ) : (
            <h2 className="text-xl font-bold font-serif flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Your Cart
            </h2>
          )}
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: SHOW THE CART ITEMS */}
        {checkoutStep === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <ShoppingCart className="w-16 h-16 text-gray-200" />
                  <p className="text-lg">Your cart is empty!</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-6">
                    <img src={item.image_url || '/placeholder.png'} alt={item.name} className="w-24 h-32 object-cover rounded-lg border shadow-sm" />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        {/* The Name here will show "Royal Blue Nighty - Size L" */}
                        <h3 className="font-bold text-gray-800 leading-tight">{item.name}</h3>
                        <p className="text-black font-extrabold mt-2">₹{item.price}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden shadow-sm">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100"><Minus className="w-4 h-4" /></button>
                          <span className="px-3 text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100"><Plus className="w-4 h-4" /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between mb-6 text-xl font-bold">
                  <span>Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>
                <button 
                  onClick={() => setCheckoutStep('details')} 
                  className="w-full bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition shadow-lg"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </>
        )}

        {/* STEP 2: SHOW THE DETAILS FORM */}
        {checkoutStep === 'details' && (
          <div className="flex-1 flex flex-col p-6 bg-white">
            <h3 className="text-2xl font-bold font-serif mb-6">Delivery Details</h3>
            
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Pincode</label>
                <input 
                  type="text" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 636001"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">We will calculate exact shipping via WhatsApp.</p>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button 
                onClick={handleWhatsAppCheckout} 
                className="w-full bg-green-600 text-white py-4 rounded-full font-bold text-lg hover:bg-green-700 transition shadow-lg flex items-center justify-center gap-2"
              >
                Send Order to WhatsApp
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}