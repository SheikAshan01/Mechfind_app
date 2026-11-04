'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Radio,
  Sliders,
  Building,
  Bell,
  Sun,
  Moon,
  LogOut,
  Save,
  Check,
} from 'lucide-react';
import MechanicSidebar from '@/components/MechanicSidebar';

export default function MechanicSettingsPage() {
  const router = useRouter();
  const [radius, setRadius] = useState(15);
  const [nightService, setNightService] = useState(true);
  const [instantPayouts, setInstantPayouts] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleTheme = (val: boolean) => {
    setIsDark(val);
    if (val) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSignOut = () => {
    if (confirm('Sign out of your mechanic partner session?')) {
      router.push('/mechanic/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col lg:flex-row">
      <MechanicSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
              Workshop Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Dispatch operating radius, night hours, and payout preferences
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-[#1769E8] hover:bg-[#1358C2] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-[#16A34A] text-xs font-bold rounded-xl border border-emerald-200">
            ✓ Workshop operational preferences saved!
          </div>
        )}

        {/* 1. Dispatch Radius Slider */}
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#1769E8]" />
              <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
                Dispatched Service Radius
              </h3>
            </div>
            <span className="text-sm font-extrabold text-[#1769E8]">{radius} km</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Breakdown leads within this geographical boundary will ring your mobile app.
          </p>

          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-[#1769E8] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>5 km (Local)</span>
            <span>15 km (Standard)</span>
            <span>30 km (Highway)</span>
          </div>
        </div>

        {/* 2. Emergency Night Shift */}
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
                24/7 Night Roadside Assistance
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Eligible for 1.5x night-time breakdown surcharge between 11:00 PM and 6:00 AM
              </p>
            </div>
            <input
              type="checkbox"
              checked={nightService}
              onChange={(e) => setNightService(e.target.checked)}
              className="w-4 h-4 text-[#1769E8] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* 3. Bank Account & Settlements */}
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#1769E8]" />
            <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
              Bank Settlement Account
            </h3>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-[#172338] dark:text-[#F8FAFC]">
              HDFC Bank Current A/C
            </div>
            <div className="text-slate-500 font-mono">•••• •••• •••• 9081</div>
            <div className="text-slate-400 text-[10px]">IFSC: HDFC0001234</div>
          </div>
        </div>

        {/* 4. Appearance */}
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
            Appearance
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => toggleTheme(false)}
              className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 ${
                !isDark ? 'border-[#1769E8] bg-blue-50/50 text-[#1769E8]' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Light Mode</span>
            </button>
            <button
              onClick={() => toggleTheme(true)}
              className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 ${
                isDark ? 'border-[#1769E8] bg-slate-800 text-[#38BDF8]' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* 5. Logout */}
        <div className="pt-2">
          <button
            onClick={handleSignOut}
            className="w-full py-3 rounded-2xl border border-rose-200 dark:border-rose-900 text-rose-600 text-xs sm:text-sm font-bold hover:bg-rose-50 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Workshop Session</span>
          </button>
        </div>
      </main>
    </div>
  );
}

