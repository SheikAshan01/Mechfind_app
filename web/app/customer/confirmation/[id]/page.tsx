'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Car,
  PhoneCall,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Star,
  Wrench,
} from 'lucide-react';
import CustomerNav from '@/components/CustomerNav';
import { MOCK_MECHANICS } from '@/lib/constants';

export default function BookingConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const bookingId = resolvedParams.id;
  const leadMechanic = MOCK_MECHANICS[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col">
      <CustomerNav />

      <div className="max-w-xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Success Header Badge */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#16A34A] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
            Booking Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Booking ID: <span className="font-mono font-bold text-[#1769E8]">{bookingId}</span>
          </p>
        </div>

        {/* ETA & Status Card */}
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1769E8] text-white flex items-center justify-center">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1769E8]">ESTIMATED ARRIVAL</div>
                <div className="text-base sm:text-lg font-extrabold text-[#172338] dark:text-[#F8FAFC]">
                  ~10 - 12 Minutes
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#16A34A] text-white text-[11px] font-bold">
              DISPATCHED
            </span>
          </div>

          {/* Allocated Mechanic Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-[#1769E8] shadow-sm">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
                    Apex Speed Garage
                  </h3>
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Technician: Rajesh Kumar (★ 4.9)
                </p>
              </div>
            </div>

            <a
              href="tel:+919820112345"
              className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#16A34A] hover:bg-emerald-200 transition-colors"
              title="Call Mechanic"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
          </div>

          {/* Booking Summary Details */}
          <div className="space-y-2 text-xs sm:text-sm pt-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Service Type</span>
              <span className="font-bold text-[#172338] dark:text-[#F8FAFC]">Emergency Assistance</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Assigned Vehicle</span>
              <span className="font-bold text-[#172338] dark:text-[#F8FAFC]">Hyundai Creta SX (MH 02 EE 4092)</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Breakdown Location</span>
              <span className="font-bold text-[#172338] dark:text-[#F8FAFC]">SV Road, Near Bandra Station West</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Estimated Base Fare</span>
              <span className="font-extrabold text-[#1769E8] text-base">₹400</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href={`/customer/tracking/${bookingId}`}
            className="w-full h-13 py-3.5 rounded-2xl bg-[#1769E8] hover:bg-[#1358C2] text-white font-extrabold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            <span>Open Live Tracking Screen</span>
          </Link>

          <Link
            href="/customer/bookings"
            className="w-full py-3 rounded-2xl border border-[#E2E8F0] dark:border-slate-700 text-xs sm:text-sm font-bold text-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 block transition-colors"
          >
            View All Bookings & History
          </Link>
        </div>
      </div>
    </div>
  );
}
