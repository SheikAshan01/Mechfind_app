'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  Car,
  Bell,
  LogOut,
  ChevronRight,
  Lock,
  ArrowRight,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import CustomerNav from '@/components/CustomerNav';
import { getCurrentSession, getVehicles, DEMO_CUSTOMER } from '@/lib/api';
import { Vehicle } from '@/lib/types';

export default function CustomerProfilePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sosContact, setSosContact] = useState('+91 98200 99999');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    getVehicles(DEMO_CUSTOMER.id).then(setVehicles);
  }, []);

  const handleSaveSOS = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col">
      <CustomerNav />

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
            Customer Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Account settings, verified phone identity, and emergency roadside security
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-[#131D2E] p-6 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-[#1769E8] shadow-sm">
            <User className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#172338] dark:text-[#F8FAFC]">
                Arjun Kapoor
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#16A34A] text-[10px] font-bold">
                VERIFIED MOTORIST
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>arjun.kapoor@mechfind.app</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/customer/vehicles"
            className="p-4 bg-white dark:bg-[#131D2E] rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm hover:border-[#1769E8] transition-all"
          >
            <div className="flex items-center justify-between text-[#1769E8]">
              <Car className="w-5 h-5" />
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-extrabold text-[#172338] dark:text-[#F8FAFC] mt-2">
              {vehicles.length || 3}
            </div>
            <div className="text-xs text-slate-500">Saved Vehicles in Garage</div>
          </Link>

          <Link
            href="/customer/bookings"
            className="p-4 bg-white dark:bg-[#131D2E] rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm hover:border-[#1769E8] transition-all"
          >
            <div className="flex items-center justify-between text-[#16A34A]">
              <ShieldCheck className="w-5 h-5" />
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-extrabold text-[#172338] dark:text-[#F8FAFC] mt-2">
              100%
            </div>
            <div className="text-xs text-slate-500">Service Completion Rate</div>
          </Link>
        </div>

        {/* Emergency SOS Contact Card */}
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
              Emergency SOS Contact
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This contact number is automatically notified with live GPS coordinates if you trigger an emergency SOS alert.
          </p>

          <form onSubmit={handleSaveSOS} className="flex gap-2">
            <input
              type="tel"
              value={sosContact}
              onChange={(e) => setSosContact(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1358C2] text-white text-xs font-bold transition-colors"
            >
              Update
            </button>
          </form>
          {savedSuccess && (
            <p className="text-xs font-bold text-[#16A34A]">
              ✓ Emergency SOS contact updated successfully
            </p>
          )}
        </div>

        {/* Portals & Switch Roles */}
        <div className="bg-white dark:bg-[#131D2E] p-4 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-2">
          <Link
            href="/mechanic/dashboard"
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#16A34A] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
                  Switch to Mechanic Partner Portal
                </div>
                <div className="text-[11px] text-slate-400">
                  Manage workshop dispatches, earnings, and subscriptions
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/customer/login"
            className="flex items-center gap-3 p-3 rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs sm:text-sm font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Session</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

