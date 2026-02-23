'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // EMAIL & PASSWORD LOGIN
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message);
      } else {
        router.push('/');
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert(error.message);
      } else {
        router.push('/');
      }
    }
    setLoading(false);
  };

  // 🚀 BRAND NEW: GOOGLE LOGIN FUNCTION
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      {/* BRAND HEADER */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-[0.2em] text-black mb-2 uppercase">
          Movana
        </h1>
        <p className="text-gray-500 tracking-widest text-xs uppercase">
          Premium Essentials
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* LUXURY CARD DESIGN */}
        <div className="bg-white py-10 px-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] sm:rounded-3xl sm:px-12 border border-gray-100">
          
          <h2 className="text-center text-2xl font-semibold text-gray-900 mb-8 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join the Club'}
          </h2>

          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email address</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-black sm:text-sm outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-black sm:text-sm outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-xs font-bold uppercase tracking-widest text-white bg-black hover:bg-gray-900 focus:outline-none transition-all disabled:bg-gray-300 hover:shadow-xl"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-white text-gray-400">Or Continue With</span>
              </div>
            </div>

            {/* 🚀 GOOGLE BUTTON - PREMIUM UPGRADE */}
            <div className="mt-8">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center gap-3 py-4 px-4 border-2 border-gray-100 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:border-gray-300 hover:bg-gray-50 focus:outline-none transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="font-bold underline decoration-2 underline-offset-4">
                  {isLogin ? 'Sign up' : 'Sign in'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}