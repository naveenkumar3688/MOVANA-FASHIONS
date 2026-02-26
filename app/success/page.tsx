'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Mail, MessageCircle } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id') || 'MOVANA-SECURE-PAYMENT';
  
  // State to hold our generated WhatsApp link
  const [waLink, setWaLink] = useState('');

  useEffect(() => {
    // 1. Grab the order details the cart just saved!
    const savedOrder = localStorage.getItem('lastOrder');
    
    if (savedOrder) {
      const order = JSON.parse(savedOrder);
      
      // 2. Format a beautiful text message for WhatsApp
      let msg = `*🚨 NEW MOVANA ORDER!* 🚨\n\n`;
      msg += `*Payment ID:* ${order.paymentId}\n`;
      msg += `*Total Paid:* ₹${order.total}\n\n`;
      
      msg += `*📦 DELIVERY DETAILS:*\n`;
      msg += `${order.address}\n`;
      msg += `*Pincode:* ${order.pincode}\n`;
      msg += `*Courier:* ${order.courier}\n\n`;
      
      msg += `*🛍️ PRODUCTS ORDERED:*\n`;
      order.items.forEach((item: any) => {
        msg += `👗 ${item.name} (Qty: ${item.quantity})\n`;
      });
      
      msg += `\nThank you! Please dispatch my order soon!`;

      // 3. Encode the message so it works in a web link
      const encodedMsg = encodeURIComponent(msg);
      
      // 4. Create the final link (⚠️ REPLACE WITH YOUR REAL NUMBER!)
      // Ensure your number includes the country code '91' but no '+' sign
      const yourWhatsAppNumber = "918072081691"; 
      
      setWaLink(`https://wa.me/${yourWhatsAppNumber}?text=${encodedMsg}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
        
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-black uppercase tracking-widest text-black mb-2">Order Confirmed</h1>
        <p className="text-gray-500 text-sm mb-6">Thank you for shopping with MOVANA FASHIONS.</p>
        
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200 text-left space-y-4">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction ID</p>
            <p className="font-mono text-sm font-bold text-black">{paymentId}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
            <p className="text-sm font-bold text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Payment Successful
            </p>
          </div>
        </div>

        {/* 🚀 THE MAGIC WHATSAPP BUTTON */}
        {waLink && (
          <a 
            href={waLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex justify-center items-center gap-2 bg-[#25D366] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#1ebe57] transition shadow-lg mb-4 animate-pulse"
          >
            <MessageCircle className="w-5 h-5" /> Confirm Order via WhatsApp
          </a>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mb-6 bg-blue-50 text-blue-700 p-4 rounded-xl">
          <Mail className="w-4 h-4" />
          <p className="font-medium">An official receipt has been sent to your email.</p>
        </div>

        <Link 
          href="/" 
          className="w-full flex justify-center items-center gap-2 bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition shadow-sm"
        >
          <Package className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading your receipt...</div>}>
      <SuccessContent />
    </Suspense>
  );
}