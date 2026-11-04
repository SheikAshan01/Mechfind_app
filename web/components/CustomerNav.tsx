'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Wrench,
  Navigation,
  Calendar,
  Car,
  User,
  Settings,
} from 'lucide-react';

const LINKS = [
  { label: 'Find Mechanics', href: '/customer/find', icon: Search },
  { label: 'Book Assistance', href: '/customer/book', icon: Wrench },
  { label: 'Live Tracking', href: '/customer/tracking/req_live_101', icon: Navigation },
  { label: 'My Bookings', href: '/customer/bookings', icon: Calendar },
  { label: 'My Garage', href: '/customer/vehicles', icon: Car },
  { label: 'Profile', href: '/customer/profile', icon: User },
  { label: 'Settings', href: '/customer/settings', icon: Settings },
];

export default function CustomerNav() {
  const pathname = usePathname();

  return (
    <div className="bg-white dark:bg-[#131D2E] border-b border-[#E2E8F0] dark:border-[#1E293B] sticky top-16 z-30 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-2 py-2">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#1769E8] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

