import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Target,
  Users,
  Cpu,
  MapPin,
  Clock,
  Award,
  ArrowRight,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 text-white">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <span className="text-xs font-bold text-[#FFD400] uppercase tracking-wider">
          Our Story & Purpose
        </span>
        <h1 className="text-3xl sm:text-5xl font-black">
          Redefining Highway & City Breakdown Recovery
        </h1>
        <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
          MECHFIND was born to solve a universal driver nightmare: being stranded in the middle
          of the night with a flat tyre or smoking engine, having to wait 2+ hours for help or
          falling victim to highway price extortion.
        </p>
      </div>

      {/* Brand Identity & Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#121212] border border-[#262626] rounded-3xl p-8 sm:p-12 shadow-2xl">
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-[#0A0A0A] border border-gray-800 rounded-2xl">
          <div className="w-32 h-32 relative mb-4">
            <Image
              src="/logo.png"
              alt="MECHFIND Logo"
              width={128}
              height={128}
              className="object-contain"
            />
          </div>
          <span className="text-xl font-extrabold text-white">
            MECH<span className="text-[#FFD400]">FIND</span>
          </span>
          <span className="text-xs text-gray-400 font-medium mt-1">
            Your Mechanic, Just Around the Corner
          </span>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-2xl font-bold text-white">
            From 2-Hour Agony to 15-Minute Rescue
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            By connecting local neighborhood mechanics, mobile puncture specialists, and licensed
            garages through a high-precision spatial PostGIS engine, MECHFIND turns every local
            workshop into a rapid first responder for roadside emergencies.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            We provide motorists with upfront pricing, live GPS arrival tracking, and verified
            trust, while giving local mechanics guaranteed income, professional recognition, and
            daily digital settlements.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-10">
          Our Non-Negotiable Standards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 space-y-3">
            <Clock className="w-8 h-8 text-[#FFD400]" />
            <h3 className="text-lg font-bold">15-Minute Response Pledge</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              We reject arbitrary 1-hour wait times. Our algorithms prioritize hyper-local
              workshops within a 3-5 km perimeter so that technicians arrive within minutes.
            </p>
          </div>

          <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 space-y-3">
            <Award className="w-8 h-8 text-emerald-400" />
            <h3 className="text-lg font-bold">Fair & Transparent Rates</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every service has an open rate card visible before booking. No surge rates during
              rain or night emergencies — only predictable, regulated compensation.
            </p>
          </div>

          <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 space-y-3">
            <Users className="w-8 h-8 text-[#FFD400]" />
            <h3 className="text-lg font-bold">Mechanic Empowerment</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              We empower grassroots mechanics and independent garages with digital dispatch tools,
              direct customer access, and steady, high-margin monthly earnings.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Architecture Note */}
      <div className="bg-[#151515] border border-[#2A2A2A] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FFD400]">
            <Cpu className="w-4 h-4" />
            <span>High-Precision Engineering</span>
          </div>
          <h3 className="text-xl font-bold">Built On Real PostgreSQL & PostGIS Spatial Indexes</h3>
          <p className="text-xs text-gray-400">
            Both our iOS/Android mobile apps and our web platform communicate directly with
            a single Supabase PostgreSQL cluster with spatial GIST indexes, ensuring instantaneous
            discovery and realtime job status updates.
          </p>
        </div>
        <Link
          href="/customer/book"
          className="px-6 py-3 rounded-xl bg-[#FFD400] text-black font-extrabold text-sm hover:bg-[#E5BE00] whitespace-nowrap shadow-brand"
        >
          Try Live Discovery
        </Link>
      </div>
    </div>
  );
}

