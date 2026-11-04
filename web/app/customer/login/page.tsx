'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PhoneCall, ShieldCheck, ArrowRight, UserCheck, KeyRound } from 'lucide-react';
import { setSessionUser, DEMO_CUSTOMER } from '@/lib/api';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSessionUser({
        ...DEMO_CUSTOMER,
        phoneNumber: phoneNumber || DEMO_CUSTOMER.phoneNumber,
      });
      router.push('/customer/dashboard');
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    setSessionUser(DEMO_CUSTOMER);
    router.push('/customer/dashboard');
  };

  return (
    <div className="py-16 sm:py-24 max-w-md mx-auto px-4 text-white">
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD400]/15 text-[#FFD400] border border-[#FFD400]/30 flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Customer Portal Login</h1>
          <p className="text-xs text-gray-400">
            Access your active breakdown requests, past services, and vehicle garage.
          </p>
        </div>

        {/* Quick Demo Login Option */}
        <div className="p-3.5 rounded-2xl bg-[#1C1C1C] border border-[#FFD400]/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Demo Customer Account:</span>
            <span className="text-[#FFD400] font-semibold">Instant Access</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Sign in instantly as &quot;Rahul Verma&quot; to test active tracking & garage features.
          </p>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-2.5 rounded-xl bg-[#FFD400] hover:bg-[#E5BE00] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-brand active:scale-95 transition-transform"
          >
            <span>Sign In As Demo Customer</span>
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

        {/* Real Phone OTP Login Form */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-xs font-bold text-gray-400">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl pl-12 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD400]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#262626] hover:bg-[#333333] text-white font-bold text-xs flex items-center justify-center gap-2 border border-gray-700 transition-colors"
            >
              <span>Send 4-Digit OTP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Enter Verification OTP (Use &apos;1234&apos;)
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="• • • •"
                className="w-full text-center tracking-[0.5em] bg-[#1A1A1A] border border-[#333333] rounded-xl py-2.5 text-lg font-black text-[#FFD400] focus:outline-none focus:border-[#FFD400]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#FFD400] hover:bg-[#E5BE00] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-brand"
            >
              <span>{loading ? 'Verifying...' : 'Verify OTP & Continue'}</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/customer/signup" className="text-[#FFD400] font-bold hover:underline">
              Create New Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
