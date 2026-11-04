'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { setSessionUser, Profile } from '@/lib/api';

export default function CustomerSignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: Profile = {
      id: 'cust_' + Math.random().toString(36).substr(2, 9),
      fullName,
      phoneNumber,
      email: email || null,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    setSessionUser(newUser);
    router.push('/customer/dashboard');
  };

  return (
    <div className="py-16 sm:py-24 max-w-lg mx-auto px-4 text-white">
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD400]/15 text-[#FFD400] border border-[#FFD400]/30 flex items-center justify-center mx-auto">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Join MECHFIND</h1>
          <p className="text-xs text-gray-400">
            Create your motorist profile for rapid roadside breakdown protection.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Verma"
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD400]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Mobile Number (For Verification & Call) *
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD400]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Email Address (For Invoices)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD400]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Emergency Contact Person Phone
            </label>
            <input
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="+91 98111 22334 (Spouse / Family)"
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD400]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#FFD400] text-black font-black text-sm flex items-center justify-center gap-2 shadow-brand hover:bg-[#E5BE00] active:scale-95 transition-transform"
          >
            <span>Create Account & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-400">
            Already have an account?{' '}
            <Link href="/customer/login" className="text-[#FFD400] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
