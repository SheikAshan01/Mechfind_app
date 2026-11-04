'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  MapPin,
  Clock,
  Navigation,
  CheckCircle,
  Shield,
  Store,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  FileCheck,
  DollarSign,
} from 'lucide-react';
import MechanicSidebar from '@/components/MechanicSidebar';

export default function MechanicProfilePage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const val = document.documentElement.classList.toggle('dark');
    setIsDark(val);
  };

  const handleLogout = () => {
    if (confirm('Sign out of your partner mechanic session?')) {
      router.push('/mechanic/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col lg:flex-row">
      <MechanicSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
            Workshop Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Partner garage credentials, operating radius, and compliance
          </p>
        </div>

        {/* 1. Workshop Banner Card (Matching Mobile Screen 9) */}
        <div className="bg-white dark:bg-[#131D2E] rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] overflow-hidden shadow-sm">
          {/* Banner Graphic Header */}
          <div className="h-32 sm:h-36 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 flex items-center justify-center text-white">
            <Wrench className="w-12 h-12 text-white/90" />
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#172338] dark:text-[#F8FAFC]">
                Apex Speed Garage & Roadside Care
              </h2>
              <CheckCircle className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#1769E8] mt-0.5">
              Owner: Rajesh Sharma
            </p>
          </div>
        </div>

        {/* 2. Workshop Details (Matching Mobile Screen 9) */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
            Workshop Details
          </h3>

          <div className="bg-white dark:bg-[#131D2E] rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden text-xs sm:text-sm">
            <div className="p-4 flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Shop 4, Linking Road, Bandra West</span>
            </div>

            <div className="p-4 flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>7:00 AM - 11:00 PM</span>
            </div>

            <div className="p-4 flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Navigation className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Service Radius 15 km</span>
            </div>
          </div>
        </div>

        {/* 3. Manage List (Matching Mobile Screen 9) */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
            Manage
          </h3>

          <div className="bg-white dark:bg-[#131D2E] rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden text-xs sm:text-sm">
            <Link
              href="/mechanic/services"
              className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <Wrench className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">Services & Pricing</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/mechanic/verification"
              className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <FileCheck className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">Documents & Verification</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <button
              onClick={toggleTheme}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-400" />}
                <span className="font-semibold">Appearance ({isDark ? 'Dark Mode' : 'Light Mode'})</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full p-4 flex items-center justify-between hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-rose-500" />
                <span className="font-semibold">Logout</span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-500" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

