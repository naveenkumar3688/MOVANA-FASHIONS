'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, ArrowRight, Mail } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id') || 'MOVANA-SECURE-PAYMENT';

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
        
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-black uppercase tracking-widest text-black mb-2">Order Confirmed</h1>
        <p className="text-gray-500 text-sm mb-8">Thank you for shopping with MOVANA FASHIONS.</p>
        
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200 text-left space-y-4">
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

        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-8 bg-blue-50 text-blue-700 p-4 rounded-xl">
          <Mail className="w-5 h-5" />
          <p className="font-medium">An official receipt has been sent to your email.</p>
        </div>

        <Link 
          href="/" 
          className="w-full flex justify-center items-center gap-2 bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition shadow-lg"
        >
          <Package className="w-5 h-5" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}

// Suspense boundary is required by Next.js when using search parameters!
export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading your receipt...</div>}>
      <SuccessContent />
    </Suspense>
  );
}