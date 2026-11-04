'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  PhoneCall,
  MapPin,
  RefreshCw,
  Globe,
  Smartphone,
  ShieldCheck,
  ChevronDown,
  Moon,
  Sun,
  Wrench,
  Search,
  User,
} from 'lucide-react';
import SmartAppBanner from './SmartAppBanner';
import { useDeviceOS, APP_DOWNLOAD_LINKS } from '@/lib/useDeviceOS';
import { getCurrentLanguage, setLanguage, Language } from '@/lib/i18n';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLangState] = useState<Language>('en');
  const [isLocating, setIsLocating] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('Dindigul West');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();
  const { os, isAndroid, isIOS, storeName, downloadUrl } = useDeviceOS();

  useEffect(() => {
    setLangState(getCurrentLanguage());
  }, [pathname]);

  const toggleLanguage = () => {
    const nextLang: Language = lang === 'en' ? 'ta' : 'en';
    setLanguage(nextLang);
    setLangState(nextLang);
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setIsDarkMode(isDark);
  };

  const handleRefreshLocation = () => {
    setIsLocating(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setTimeout(() => {
            setCurrentAddress('Dindigul West');
            setIsLocating(false);
          }, 350);
        },
        () => {
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setTimeout(() => setIsLocating(false), 300);
    }
  };

  return (
    <>
      {/* 1. Smart Dynamic App Download Banner */}
      <SmartAppBanner />

      {/* 2. Main Premium Header (Exact App Colors: Royal Blue #1769E8, Teal, White, Slate) */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#131D2E] border-b border-[#E2E8F0] dark:border-[#1E293B] shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: MECHFIND Brand & Location Dropdown */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#1769E8] p-1 border border-blue-600 shadow-sm flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="MECHFIND"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain brightness-0 invert"
                    priority
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold tracking-tight text-[#172338] dark:text-[#F8FAFC]">
                    MECH<span className="text-[#1769E8]">FIND</span>
                  </span>
                  <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] -mt-0.5 hidden sm:inline">
                    Your Mechanic, Just Around the Corner
                  </span>
                </div>
              </Link>

              {/* Location Pill Dropdown */}
              <button
                onClick={handleRefreshLocation}
                title="Tap to refresh your GPS coordinates"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-[#172338] dark:text-slate-200 border border-[#E2E8F0] dark:border-[#334155] hover:bg-slate-200 transition-colors"
              >
                <MapPin className={`w-3.5 h-3.5 text-[#1769E8] ${isLocating ? 'animate-spin' : ''}`} />
                <span className="max-w-[130px] truncate">{isLocating ? 'Locating...' : currentAddress}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Middle Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/customer/find"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  pathname === '/customer/find'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-[#1769E8]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#1769E8]'
                }`}
              >
                Find Mechanics
              </Link>
              <Link
                href="/customer/book"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  pathname === '/customer/book'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-[#1769E8]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#1769E8]'
                }`}
              >
                Book Assistance
              </Link>
              <Link
                href="/customer/bookings"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  pathname === '/customer/bookings'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-[#1769E8]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#1769E8]'
                }`}
              >
                My Bookings
              </Link>
              <Link
                href="/customer/vehicles"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  pathname === '/customer/vehicles'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-[#1769E8]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#1769E8]'
                }`}
              >
                My Garage
              </Link>
              <Link
                href="/mechanic/dashboard"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  pathname?.startsWith('/mechanic')
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-[#16A34A]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#16A34A]'
                }`}
              >
                Mechanic Portal
              </Link>
            </nav>

            {/* Right Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Emergency SOS Call Hotline */}
              <a
                href="tel:18006324346"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors"
                title="24/7 Breakdown Hotline"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                <span>1800-MECH-FIND</span>
              </a>

              {/* Dark Mode Switch */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'தமிழ்' : 'EN'}</span>
              </button>

              {/* Customer Profile Link */}
              <Link
                href="/customer/profile"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#1769E8] hover:bg-slate-200 transition-colors"
                title="Customer Profile"
              >
                <User className="w-4 h-4" />
              </Link>

              {/* Primary Dispatch CTA */}
              <Link
                href="/customer/book"
                className="px-4 py-2 rounded-xl bg-[#1769E8] hover:bg-[#1358C2] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Book Fix</span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800"
                aria-label="Toggle Menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Flyout Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#131D2E] p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/customer/find"
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-[#1769E8]" />
                <span>Find Mechanics</span>
              </Link>
              <Link
                href="/customer/book"
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold flex items-center gap-2"
              >
                <Wrench className="w-4 h-4 text-[#1769E8]" />
                <span>Book Breakdown</span>
              </Link>
              <Link
                href="/customer/bookings"
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>My Bookings</span>
              </Link>
              <Link
                href="/customer/vehicles"
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-[#1769E8]" />
                <span>My Garage</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/mechanic/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-[#16A34A] flex items-center gap-1.5"
              >
                <span>Mechanic Partner Portal →</span>
              </Link>
              <a
                href="tel:18006324346"
                className="text-xs font-bold text-rose-600 flex items-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>SOS 1800-MECH-FIND</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
