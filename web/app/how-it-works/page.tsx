'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Smartphone,
  PhoneCall,
  CheckCircle,
  Award,
  ArrowRight,
  TrendingUp,
  CreditCard,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

export default function HowItWorksPage() {
  const [role, setRole] = useState<'customer' | 'mechanic'>('customer');

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 text-white">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#FFD400] uppercase tracking-wider">
          Transparent & Seamless
        </span>
        <h1 className="text-3xl sm:text-5xl font-black">
          How MECHFIND Operates
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          Built on real-time PostGIS spatial routing and verified roadside mechanics.
          Select your perspective below to explore the complete workflow.
        </p>

        {/* Perspective Switcher */}
        <div className="inline-flex p-1.5 rounded-2xl bg-[#141414] border border-[#2A2A2A] mt-4">
          <button
            onClick={() => setRole('customer')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === 'customer'
                ? 'bg-[#FFD400] text-black shadow-brand'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            For Motorists & Drivers
          </button>
          <button
            onClick={() => setRole('mechanic')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === 'mechanic'
                ? 'bg-[#FFD400] text-black shadow-brand'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            For Mechanics & Garages
          </button>
        </div>
      </div>

      {/* Customer Perspective */}
      {role === 'customer' ? (
        <div className="space-y-12 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#FFD400] text-black font-black flex items-center justify-center text-lg shadow-brand">
                1
              </div>
              <h3 className="text-lg font-bold">1-Tap Location Lock</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Open the MECHFIND website or mobile app. Click &apos;Auto Detect&apos; to let
                browser GPS capture your exact highway milestone or street coordinates.
              </p>
              <span className="text-[11px] font-semibold text-[#FFD400] block">
                Works without typing address
              </span>
            </div>

            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#FFD400] text-black font-black flex items-center justify-center text-lg shadow-brand">
                2
              </div>
              <h3 className="text-lg font-bold">Select Vehicle & Issue</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Choose Two-Wheeler, Car, or Auto/Commercial. Pick your breakdown symptom (Flat Tyre,
                Dead Battery, Overheating, Fuel Out, Lockout, or Towing).
              </p>
              <span className="text-[11px] font-semibold text-emerald-400 block">
                Upfront fixed rate displayed
              </span>
            </div>

            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#FFD400] text-black font-black flex items-center justify-center text-lg shadow-brand">
                3
              </div>
              <h3 className="text-lg font-bold">PostGIS Instant Dispatch</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Our algorithm matches the nearest verified workshop. The mechanic gets your
                location and calls you immediately with estimated arrival in 12-18 minutes.
              </p>
              <span className="text-[11px] font-semibold text-[#FFD400] block">
                Direct mechanic call & ETA
              </span>
            </div>

            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#FFD400] text-black font-black flex items-center justify-center text-lg shadow-brand">
                4
              </div>
              <h3 className="text-lg font-bold">On-Site Fix & Fair Pay</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                The mechanic conducts repairs right by your vehicle. Inspect the fix, confirm
                job completion, and pay securely via UPI, Card, or Cash.
              </p>
              <span className="text-[11px] font-semibold text-emerald-400 block">
                30-Day service warranty
              </span>
            </div>
          </div>

          {/* Customer CTA */}
          <div className="text-center pt-4">
            <Link
              href="/customer/book"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#FFD400] text-black font-black text-sm hover:bg-[#E5BE00] shadow-brand"
            >
              <span>Book Emergency Roadside Assistance</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Mechanic Perspective */
        <div className="space-y-12 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#FFD400] text-black font-black flex items-center justify-center text-lg shadow-brand">
                1
              </div>
              <h3 className="text-lg font-bold">Register & Verify Garage</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sign up your workshop, upload your mechanic trade license/Aadhaar, and define
                your service radius (up to 25 km around your workshop).
              </p>
              <span className="text-[11px] font-semibold text-emerald-400 block">
                Verified within 2 hours
              </span>
            </div>

            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#FFD400] text-black font-black flex items-center justify-center text-lg shadow-brand">
                2
              </div>
              <h3 className="text-lg font-bold">Toggle Duty & Receive Alerts</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Switch your status to &apos;Online&apos; when ready. Whenever a breakdown occurs within
                your radius, your phone alerts you with exact distance, car model, and problem.
              </p>
              <span className="text-[11px] font-semibold text-[#FFD400] block">
                Real-time audio dispatch siren
              </span>
            </div>

            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#FFD400] text-black font-black flex items-center justify-center text-lg shadow-brand">
                3
              </div>
              <h3 className="text-lg font-bold">Accept & Navigate</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Tap &apos;Accept Job&apos;. Connect with the stranded customer via call, open GPS
                turn-by-turn navigation to their vehicle, and update your status on arrival.
              </p>
              <span className="text-[11px] font-semibold text-emerald-400 block">
                Built-in customer direct call
              </span>
            </div>

            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4 relative">
              <div className="w-10 h-10 rounded-xl bg-[#FFD400] text-black font-black flex items-center justify-center text-lg shadow-brand">
                4
              </div>
              <h3 className="text-lg font-bold">Complete & Earn Daily</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Mark job completed on your terminal. Collect direct payment or receive instant
                UPI settlements into your registered bank account.
              </p>
              <span className="text-[11px] font-semibold text-[#FFD400] block">
                0% Commission intro period
              </span>
            </div>
          </div>

          {/* Mechanic CTA */}
          <div className="text-center pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/mechanic/join"
              className="px-8 py-3.5 rounded-xl bg-[#FFD400] text-black font-black text-sm hover:bg-[#E5BE00] shadow-brand"
            >
              <span>Apply As Mechanic Partner</span>
            </Link>
            <Link
              href="/mechanic/dashboard"
              className="px-8 py-3.5 rounded-xl bg-[#222222] text-white font-bold text-sm hover:bg-[#2C2C2C] border border-gray-700"
            >
              <span>Open Mechanic Dispatch Terminal</span>
            </Link>
          </div>
        </div>
      )}

      {/* Safety & Trust Pillars */}
      <div className="border-t border-[#222222] pt-16">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-10">
          The MECHFIND Safety Guarantee
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#141414] border border-[#2B2B2B] rounded-2xl p-6 space-y-3">
            <UserCheck className="w-8 h-8 text-[#FFD400]" />
            <h3 className="text-base font-bold">100% Background Checked</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every workshop technician passes government ID verification, criminal background
              checks, and mechanical competence tests before going live on the platform.
            </p>
          </div>

          <div className="bg-[#141414] border border-[#2B2B2B] rounded-2xl p-6 space-y-3">
            <CreditCard className="w-8 h-8 text-emerald-400" />
            <h3 className="text-base font-bold">Fixed & Standardized Rates</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Never get overcharged during an emergency. All base labor fees, puncture plugs,
              jumpstart rates, and towing costs are regulated and capped.
            </p>
          </div>

          <div className="bg-[#141414] border border-[#2B2B2B] rounded-2xl p-6 space-y-3">
            <PhoneCall className="w-8 h-8 text-[#FFD400]" />
            <h3 className="text-base font-bold">24x7 SOS Support Center</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Our central human dispatch team monitors active highway requests continuously.
              If a vehicle is in a high-risk area, we coordinate emergency priority escort.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

