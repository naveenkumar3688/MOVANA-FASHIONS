'use client';

import { useCartStore } from '../store/cartStore'; 
import { X, MessageCircle } from 'lucide-react'; // Added MessageCircle icon

export default function CartDrawer() {
  const { items, isOpen, toggleCart } = useCartStore();

  // Safety first!
  const safeItems = items || [];

  const totalPrice = safeItems.reduce((total, item) => {
    return total + (Number(item.price) || 0) * (item.quantity || 1);
  }, 0);

  // --- THE WHATSAPP LOGIC STARTS HERE ---
  const handleCheckout = () => {
    // 1. YOUR PHONE NUMBER (Format: CountryCode + Number, e.g., 919876543210)
    // REPLACE THIS WITH YOUR REAL NUMBER!
    const phoneNumber = "918072081691"; 

    // 2. Create the message list
    const itemList = safeItems.map((item) => 
      `• ${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`
    ).join('%0A'); // %0A is a "New Line" code for URLs

    // 3. Create the final text
    const message = `Hello MOVANA FASHIONS! 🛍️%0A%0AI would like to place an order:%0A${itemList}%0A%0A*Total Amount: ₹${totalPrice}*`;

    // 4. Open WhatsApp
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
  };
  // --- END OF LOGIC ---

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={toggleCart} />
      <div className="absolute right-0 top-0 h-full w-80 sm:w-96 bg-white shadow-2xl flex flex-col p-6 text-black">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        
        {/* Items List */}
        <div className="flex-1 overflow-y-auto py-4">
          {safeItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>Your cart is empty.</p>
              <button onClick={toggleCart} className="text-sm underline mt-2 text-black">
                Continue Shopping
              </button>
            </div>
          ) : (
            safeItems.map((item) => (
              <div key={item.id} className="flex justify-between mb-4 border-b pb-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold">₹{item.price * item.quantity}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {safeItems.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Total:</span>
              <span>₹{totalPrice}</span>
            </div>
            
            {/* The WhatsApp Checkout Button */}
            <button 
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} />
              ORDER ON WHATSAPP
            </button>
            <p className="text-xs text-center text-gray-400 mt-2">
              Order directly via WhatsApp for fast delivery.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}