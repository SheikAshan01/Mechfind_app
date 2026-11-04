import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  PhoneCall,
  Mail,
  MapPin,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Heart,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#172338] text-white pt-14 pb-8 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1769E8] flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                M
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                MECH<span className="text-[#1769E8]">FIND</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              India's 24/7 hyper-local roadside assistance marketplace. Connecting stranded motorists with verified local mechanics, towing, battery boost, and puncture repair within 15 minutes.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>100% Verified Mechanics</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span>Avg Arrival 10-15m</span>
              </div>
            </div>
          </div>

          {/* Quick Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Assistance Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/customer/find" className="hover:text-white transition-colors">
                  Flat Tyre & Puncture
                </Link>
              </li>
              <li>
                <Link href="/customer/find" className="hover:text-white transition-colors">
                  Battery Jumpstart
                </Link>
              </li>
              <li>
                <Link href="/customer/find" className="hover:text-white transition-colors">
                  Emergency Fuel Delivery
                </Link>
              </li>
              <li>
                <Link href="/customer/find" className="hover:text-white transition-colors">
                  Flatbed Towing
                </Link>
              </li>
              <li>
                <Link href="/customer/find" className="hover:text-white transition-colors">
                  Engine & Brake Repair
                </Link>
              </li>
            </ul>
          </div>

          {/* Motorist Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Portals
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/customer/find" className="hover:text-white transition-colors">
                  Find Mechanics
                </Link>
              </li>
              <li>
                <Link href="/customer/book" className="hover:text-white transition-colors">
                  Book Assistance
                </Link>
              </li>
              <li>
                <Link href="/customer/bookings" className="hover:text-white transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/customer/vehicles" className="hover:text-white transition-colors">
                  My Garage
                </Link>
              </li>
              <li>
                <Link href="/mechanic/dashboard" className="text-[#16A34A] font-semibold hover:underline">
                  Mechanic Partner Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Helpline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              24/7 Helpline
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <a
                href="tel:18006324346"
                className="flex items-center gap-2 text-rose-400 font-bold hover:underline"
              >
                <PhoneCall className="w-4 h-4" />
                <span>1800-MECH-FIND</span>
              </a>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>help@mechfind.app</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Dindigul • Chennai • Mumbai • Bengaluru</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} MECHFIND Automotive Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/faq" className="hover:text-slate-300 transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
