'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Headphones, ArrowRight, ShieldCheck } from 'lucide-react';
import { setSessionUser, DEMO_SUPPORT_AGENT } from '@/lib/api';

export default function SupportLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoAgent = () => {
    setSessionUser(DEMO_SUPPORT_AGENT);
    router.push('/support/dashboard');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSessionUser(DEMO_SUPPORT_AGENT);
      router.push('/support/dashboard');
    }, 600);
  };

  return (
    <div className="py-20 max-w-md mx-auto px-4 text-white">
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Headphones className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Support Agent Desk</h1>
          <p className="text-xs text-gray-400">
            Customer assistance, disputes, refund approvals & internal notes.
          </p>
        </div>

        {/* Demo Support Agent Access (Sandbox / Demo Mode Only) */}
        {process.env.NEXT_PUBLIC_DISABLE_DEMO_LOGIN !== 'true' && (
          <div className="p-3.5 rounded-2xl bg-[#1C1C1C] border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Level 2 Support Agent:</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                DEMO / SANDBOX ONLY
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Preview role &quot;Pooja Iyer&quot; (Auto-disabled when NEXT_PUBLIC_DISABLE_DEMO_LOGIN=true).
            </p>
            <button
              type="button"
              onClick={handleDemoAgent}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <span>One-Click Demo Support Sign-In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-800"></div>
          <span className="flex-shrink mx-4 text-[11px] text-gray-500 uppercase font-semibold">
            Or Agent Credentials
          </span>
          <div className="flex-grow border-t border-gray-800"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-300 mb-1">Agent Support ID</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pooja.support@mechfind.com"
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#262626] hover:bg-[#333333] text-white font-bold text-xs flex items-center justify-center gap-2 border border-gray-700"
          >
            <Headphones className="w-4 h-4 text-emerald-400" />
            <span>{loading ? 'Opening Desk...' : 'Access Support Terminal'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

