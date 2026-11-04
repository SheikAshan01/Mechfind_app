'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, KeyRound, ArrowRight, Lock } from 'lucide-react';
import { setSessionUser, DEMO_ADMIN } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoAdmin = () => {
    setSessionUser(DEMO_ADMIN);
    router.push('/admin/dashboard');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSessionUser(DEMO_ADMIN);
      router.push('/admin/dashboard');
    }, 600);
  };

  return (
    <div className="py-20 max-w-md mx-auto px-4 text-white">
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD400]/15 text-[#FFD400] border border-[#FFD400]/30 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Operations Portal</h1>
          <p className="text-xs text-gray-400">
            Platform governance, KYC verification, finance & subscriptions.
          </p>
        </div>

        {/* Demo Admin Instant Access (Sandbox / Demo Mode Only) */}
        {process.env.NEXT_PUBLIC_DISABLE_DEMO_LOGIN !== 'true' && (
          <div className="p-3.5 rounded-2xl bg-[#1C1C1C] border border-[#FFD400]/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Super Administrator:</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-[#FFD400]">
                DEMO / SANDBOX ONLY
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Preview role &quot;Vikramaditya Rao&quot; (Auto-disabled when NEXT_PUBLIC_DISABLE_DEMO_LOGIN=true).
            </p>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="w-full py-2.5 rounded-xl bg-[#FFD400] hover:bg-[#E5BE00] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-brand active:scale-95 transition-transform"
            >
              <span>One-Click Demo Admin Sign-In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-800"></div>
          <span className="flex-shrink mx-4 text-[11px] text-gray-500 uppercase font-semibold">
            Or Admin Credentials
          </span>
          <div className="flex-grow border-t border-gray-800"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-300 mb-1">Corporate Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mechfind.com"
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFD400]"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-300 mb-1">Security Passkey</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFD400]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#262626] hover:bg-[#333333] text-white font-bold text-xs flex items-center justify-center gap-2 border border-gray-700"
          >
            <Lock className="w-4 h-4 text-[#FFD400]" />
            <span>{loading ? 'Authenticating...' : 'Enter Admin Console'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

