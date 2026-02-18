'use client';

import { useCartStore } from '@/store/cartStore';
import { X } from 'lucide-react'; // This is the 'X' icon to close the cart

export default function CartDrawer() {
  const { items, isOpen, toggleCart } = useCartStore();

  // This automatically calculates your total price!
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <>
      {/* 1. The dark transparent background overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={toggleCart} // Closes cart if you click the background
        />
      )}

      {/* 2. The sliding white drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold text-black">Your Cart</h2>
            <button onClick={toggleCart} className="text-gray-500 hover:text-black transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* The List of Products */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">Your cart is empty.</p>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-black">{item.name}</h3>
                      <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-black">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* The Total Price & Checkout Button */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-600">Total:</span>
              <span className="text-2xl font-bold text-black">₹{totalPrice}</span>
            </div>
            <button className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition">
              Proceed to Checkout
            </button>
          </div>

        </div>
      </div>
    </>
  );
}