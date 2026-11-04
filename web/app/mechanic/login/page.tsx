'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench, ArrowRight, ShieldCheck } from 'lucide-react';
import { setSessionUser, DEMO_MECHANIC } from '@/lib/api';

export default function MechanicLoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = () => {
    setSessionUser(DEMO_MECHANIC);
    router.push('/mechanic/dashboard');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSessionUser({
        ...DEMO_MECHANIC,
        phoneNumber: phoneNumber || DEMO_MECHANIC.phoneNumber,
      });
      router.push('/mechanic/dashboard');
    }, 600);
  };

  return (
    <div className="py-16 sm:py-24 max-w-md mx-auto px-4 text-white">
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD400]/15 text-[#FFD400] border border-[#FFD400]/30 flex items-center justify-center mx-auto">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Mechanic Terminal Login</h1>
          <p className="text-xs text-gray-400">
            Access your live breakdown dispatch terminal and manage jobs.
          </p>
        </div>

        {/* Quick Demo Mechanic Option */}
        <div className="p-3.5 rounded-2xl bg-[#1C1C1C] border border-[#FFD400]/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Partner Demo Account:</span>
            <span className="text-[#FFD400] font-semibold">Verified Workshop</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Sign in as &quot;Rajesh Sharma&quot; (Apex Speed Garage) to test incoming dispatch alerts & status transitions.
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 rounded-xl bg-[#FFD400] hover:bg-[#E5BE00] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-brand active:scale-95 transition-transform"
          >
            <span>Sign In As Demo Mechanic Partner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gray-800"></div>
          <span className="flex-shrink mx-4 text-[11px] text-gray-500 uppercase font-semibold">
            Or Sign In With Phone
          </span>
          <div className="flex-grow border-t border-gray-800"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Registered Partner Mobile
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs font-bold text-gray-400">+91</span>
              <input
                type="tel"
                required
                placeholder="98201 12345"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl pl-12 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD400]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#262626] hover:bg-[#333333] text-white font-bold text-xs flex items-center justify-center gap-2 border border-gray-700"
          >
            <span>{loading ? 'Connecting Terminal...' : 'Open Partner Terminal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-400">
            Want to register your garage?{' '}
            <Link href="/mechanic/register" className="text-[#FFD400] font-bold hover:underline">
              Apply For Partnership
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
