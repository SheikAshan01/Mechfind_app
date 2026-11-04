import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Wrench,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Clock,
  DollarSign,
  Award,
} from 'lucide-react';

export default function MechanicJoinPage() {
  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 text-white">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#111111] border border-[#2B2B2B] rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl space-y-5 relative z-10">
          <span className="px-3.5 py-1.5 rounded-full bg-[#FFD400]/20 text-[#FFD400] text-xs font-black uppercase tracking-wider inline-block">
            Become A MECHFIND Captain Partner
          </span>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight">
            Grow Your Workshop Revenue.{' '}
            <span className="text-[#FFD400]">Earn ₹45,000 to ₹80,000/Month.</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Get instant breakdown alerts whenever motorists get stranded near your shop.
            Fill idle garage hours with high-margin roadside fixes: tyre punctures, battery
            jumpstarts, towing, and engine emergency diagnostics.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href="/mechanic/register"
              className="px-8 py-3.5 rounded-xl bg-[#FFD400] text-black font-black text-sm flex items-center justify-center gap-2 shadow-brand hover:bg-[#E5BE00] active:scale-95 transition-transform"
            >
              <span>Register Workshop Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/mechanic/login"
              className="px-6 py-3.5 rounded-xl bg-[#262626] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#333333] border border-gray-700"
            >
              <span>Already Registered? Sign In</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Perks Grid */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-10">
          Why Over 12,500 Garages Partner With MECHFIND
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-3">
            <DollarSign className="w-8 h-8 text-[#FFD400]" />
            <h3 className="text-lg font-bold">Daily Direct Settlements</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              No waiting for month-end payments. Cash collected is yours immediately, and
              digital UPI payments are settled directly into your bank account every night.
            </p>
          </div>

          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-3">
            <Clock className="w-8 h-8 text-emerald-400" />
            <h3 className="text-lg font-bold">100% Flexible Hours</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              You control your availability. Switch duty &apos;Online&apos; when your mechanics are free,
              or toggle &apos;Offline&apos; during peak in-garage overhaul jobs.
            </p>
          </div>

          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-3">
            <ShieldCheck className="w-8 h-8 text-[#FFD400]" />
            <h3 className="text-lg font-bold">Zero Joining Fees & 0% Commission</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              New partners enjoy a 60-day promotional window with zero platform commission.
              Keep 100% of all labor revenue and spare part earnings.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-[#141414] border border-[#262626] rounded-3xl p-8 sm:p-12 space-y-8">
        <h2 className="text-2xl font-black text-center">Voices From Our Garage Partners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2E2E2E] space-y-3">
            <p className="text-xs sm:text-sm text-gray-300 italic leading-relaxed">
              &quot;Earlier, if no cars walked into my shop in the morning, my mechanics sat idle.
              With MECHFIND, we complete 4-6 puncture and jumpstart calls every day on the highway
              near Bandra. We added over ₹55,000 in monthly net profit.&quot;
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-[#FFD400] text-black font-black flex items-center justify-center">
                RS
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Rajesh Sharma</h4>
                <p className="text-[11px] text-gray-400">Apex Speed Garage, Mumbai (Partner for 14 mos)</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#1C1C1C] border border-[#2E2E2E] space-y-3">
            <p className="text-xs sm:text-sm text-gray-300 italic leading-relaxed">
              &quot;The audio dispatch siren and exact GPS pin save so much time. I don&apos;t have to
              ask customers 10 times where they are stuck. One tap navigation leads straight to
              their bumper.&quot;
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center">
                VJ
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Vikram Joshi</h4>
                <p className="text-[11px] text-gray-400">Metro 24/7 Breakdown, Andheri (Partner for 9 mos)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-black">Ready to expand your auto business?</h3>
        <p className="text-xs text-gray-400">Registration takes 3 minutes. Zero paperwork hurdles.</p>
        <Link
          href="/mechanic/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#FFD400] text-black font-black text-sm shadow-brand hover:bg-[#E5BE00]"
        >
          <span>Register Your Workshop Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

