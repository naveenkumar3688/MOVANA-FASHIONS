'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { Loader2, Package, Truck, Calendar, MapPin, ArrowRight } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchOrders() {
      // 1. Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Please log in to view your orders.");
        router.push('/login');
        return;
      }

      // 2. Fetch ONLY the orders for this specific customer email!
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', session.user.email)
        .order('created_at', { ascending: false }); // Newest orders first!

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }

    fetchOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      <div className="bg-black text-white py-10 px-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-widest mb-1">My Orders</h1>
        <p className="text-gray-400 tracking-widest uppercase text-[10px]">Your Purchase History</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold uppercase tracking-tight mb-4">No Orders Found</h2>
            <Link href="/" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-gray-800 transition">
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                
                {/* Order Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order ID</p>
                    <p className="text-xs sm:text-sm font-mono font-bold text-black">{order.payment_id || order.id}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Date</p>
                      <p className="text-xs font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> 
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total</p>
                      <p className="text-xs font-bold text-green-600">₹{order.amount}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Items List */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b pb-2">Items Ordered</h3>
                    <div className="space-y-3">
                      {order.items && order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <div className="w-12 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                            {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold uppercase tracking-tight text-black line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity} × ₹{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tracking & Address */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b pb-2">Tracking & Status</h3>
                      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                        <Truck className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest mb-1">{order.status || 'Processing'}</p>
                          
                          {/* 🚚 DYNAMIC TRACKING ID FEATURE */}
                          {order.tracking_id ? (
                            <p className="text-sm font-medium">Tracking ID: <span className="font-bold font-mono">{order.tracking_id}</span></p>
                          ) : (
                            <p className="text-xs text-blue-600/80">Tracking ID will be updated once dispatched.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b pb-2">Delivery Details</h3>
                      <div className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <p>{order.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}