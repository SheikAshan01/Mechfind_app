'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Moon,
  Sun,
  MapPin,
  Bell,
  Globe,
  Shield,
  FileText,
  Lock,
  Check,
} from 'lucide-react';
import CustomerNav from '@/components/CustomerNav';
import { getCurrentLanguage, setLanguage, Language } from '@/lib/i18n';

export default function CustomerSettingsPage() {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [gpsHighAccuracy, setGpsHighAccuracy] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);

  const toggleTheme = (val: boolean) => {
    setIsDark(val);
    if (val) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageChange = (l: Language) => {
    setLang(l);
    setLanguage(l);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col">
      <CustomerNav />

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure appearance, GPS tracking accuracy, and alert channels
          </p>
        </div>

        {/* 1. Theme Appearance */}
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
              Appearance Mode
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => toggleTheme(false)}
              className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                !isDark
                  ? 'border-[#1769E8] bg-blue-50/50 text-[#1769E8] shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => toggleTheme(true)}
              className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isDark
                  ? 'border-[#1769E8] bg-slate-800 text-[#38BDF8] shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* 2. GPS & Location Accuracy */}
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1769E8]" />
            <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
              GPS Accuracy & Location Services
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            High-precision GPS mode allows dispatched mechanics to pinpoint your exact lane and breakdown marker.
          </p>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
            <span className="text-xs sm:text-sm font-semibold text-[#172338] dark:text-[#F8FAFC]">
              High-Precision PostGIS GPS
            </span>
            <input
              type="checkbox"
              checked={gpsHighAccuracy}
              onChange={(e) => setGpsHighAccuracy(e.target.checked)}
              className="w-4 h-4 text-[#1769E8] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* 3. Notification Channels */}
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#1769E8]" />
            <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
              Dispatch Alerts & Notifications
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <div>
                <div className="text-xs sm:text-sm font-semibold text-[#172338] dark:text-[#F8FAFC]">
                  SMS Telephony Updates
                </div>
                <div className="text-[11px] text-slate-400">Mechanic dispatch & OTP verification via SMS</div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 text-[#1769E8] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <div>
                <div className="text-xs sm:text-sm font-semibold text-[#172338] dark:text-[#F8FAFC]">
                  WhatsApp ETA Tracking
                </div>
                <div className="text-[11px] text-slate-400">Live ETA map link sent to your registered phone</div>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-4 h-4 text-[#1769E8] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Language Selector */}
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#1769E8]" />
            <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
              Regional Language
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between ${
                lang === 'en'
                  ? 'border-[#1769E8] bg-blue-50/50 text-[#1769E8]'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>English</span>
              {lang === 'en' && <Check className="w-4 h-4" />}
            </button>

            <button
              onClick={() => handleLanguageChange('ta')}
              className={`p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between ${
                lang === 'ta'
                  ? 'border-[#1769E8] bg-blue-50/50 text-[#1769E8]'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>தமிழ் (Tamil)</span>
              {lang === 'ta' && <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Legal & Privacy */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <span>•</span>
          <Link href="/faq" className="hover:underline">Help & FAQ</Link>
        </div>
      </div>
    </div>
  );
}

