'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Package, LogOut, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login'); // If they aren't logged in, send them back to login
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 min-h-screen">
      <h1 className="text-3xl font-serif font-bold mb-8 text-black">My Account</h1>
      
      {/* ACCOUNT INFO CARD */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-4 rounded-full">
            <User className="w-8 h-8 text-black" />
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Logged in as</p>
            <p className="font-bold text-lg text-black">{user.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>

      {/* ORDER HISTORY SECTION */}
      <h2 className="text-2xl font-serif font-bold mb-4 text-black flex items-center gap-2">
        <Package className="w-6 h-6" /> Order History
      </h2>
      <div className="bg-gray-50 rounded-xl p-10 text-center border border-gray-200">
        <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
        <button onClick={() => router.push('/')} className="mt-4 bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-gray-800 transition">
          Start Shopping
        </button>
      </div>
    </div>
  );
}