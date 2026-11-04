'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Radio,
  Send,
  Wrench,
  Navigation,
  Wallet,
  Star,
  Store,
  DollarSign,
  ShieldCheck,
  Settings,
  LogOut,
  Power,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { DEMO_MECHANIC } from '@/lib/api';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/mechanic/dashboard', icon: LayoutDashboard },
  { label: 'Incoming Requests', href: '/mechanic/requests', icon: Radio, badge: '1 New' },
  { label: 'Dispatches', href: '/mechanic/dispatches', icon: Send },
  { label: 'Active Jobs', href: '/mechanic/jobs', icon: Wrench, badge: 'Active' },
  { label: 'Navigation', href: '/mechanic/navigation/job_active_01', icon: Navigation },
  { label: 'Earnings', href: '/mechanic/earnings', icon: Wallet },
  { label: 'Reviews', href: '/mechanic/reviews', icon: Star },
  { label: 'Workshop Profile', href: '/mechanic/profile', icon: Store },
  { label: 'Services & Pricing', href: '/mechanic/services', icon: DollarSign },
  { label: 'Subscription', href: '/mechanic/subscription', icon: ShieldCheck },
  { label: 'Settings', href: '/mechanic/settings', icon: Settings },
];

export default function MechanicSidebar() {
  const pathname = usePathname();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  return (
    <>
      {/* Mobile Drawer Trigger Bar */}
      <div className="lg:hidden flex items-center justify-between p-3.5 bg-white dark:bg-[#131D2E] border-b border-[#E2E8F0] dark:border-[#1E293B] sticky top-16 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1769E8] flex items-center justify-center text-white">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#172338] dark:text-[#F8FAFC]">
              Apex Speed Garage
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#16A34A] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          aria-label="Toggle Mechanic Menu"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-16 lg:sticky lg:top-16 inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#131D2E] border-r border-[#E2E8F0] dark:border-[#1E293B] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } h-[calc(100vh-4rem)] overflow-y-auto`}
      >
        {/* Workshop Mini Header */}
        <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E293B]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1769E8]">
                <Store className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC] truncate">
                  Apex Speed Garage
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Partner ID: MECH-9021
                </div>
              </div>
            </div>
          </div>

          {/* Quick Online Switch */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-[#16A34A] border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-[#16A34A] animate-pulse' : 'bg-slate-400'
                }`}
              />
              {isOnline ? 'Online & Receiving Dispatches' : 'Offline (Paused)'}
            </span>
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpenMobile(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1769E8] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge.includes('New')
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-[#16A34A]'
                        : 'bg-blue-100 dark:bg-blue-900/40 text-[#1769E8]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer: Quick Sign out */}
        <div className="p-3 border-t border-[#E2E8F0] dark:border-[#1E293B]">
          <Link
            href="/mechanic/login"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch Role / Sign Out</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

