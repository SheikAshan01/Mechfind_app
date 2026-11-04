'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Smartphone, ArrowDownToLine, Download } from 'lucide-react';
import { useDeviceOS, APP_DOWNLOAD_LINKS } from '@/lib/useDeviceOS';

export default function SmartAppBanner() {
  const { os, isAndroid, isIOS } = useDeviceOS();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if dismissed previously in session
    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem('mechfind_app_banner_dismissed');
      if (dismissed === 'true') {
        setIsVisible(false);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mechfind_app_banner_dismissed', 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-[#172338] text-white border-b border-slate-800 px-3.5 py-2.5 transition-all sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: App Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1 rounded-full transition-colors flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-blue-500/30 bg-[#1769E8] p-1 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="MECHFIND"
              width={28}
              height={28}
              className="w-full h-full object-contain brightness-0 invert"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white tracking-wide truncate">
                MECHFIND Mobile App
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-500/20 text-[#14B8A6] border border-blue-500/30">
                {isAndroid ? 'Android' : isIOS ? 'iOS' : 'Free Mobile App'}
              </span>
            </div>
            <p className="text-[11px] text-gray-300 truncate">
              {isAndroid
                ? 'Get live background GPS & instant mechanic arrival on Android'
                : isIOS
                ? 'Download from Apple App Store for roadside assistance'
                : 'Install the native app on Android & iPhone'}
            </p>
          </div>
        </div>

        {/* Right: Smart CTA Button according to OS */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAndroid ? (
            <a
              href={APP_DOWNLOAD_LINKS.android}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1769E8] hover:bg-[#1358C2] text-white font-extrabold text-xs shadow-sm transition-all whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.125 12 8.125s-3.5902.2866-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
              </svg>
              <span>Download on Google Play</span>
            </a>
          ) : isIOS ? (
            <a
              href={APP_DOWNLOAD_LINKS.ios}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1769E8] hover:bg-[#1358C2] text-white font-extrabold text-xs shadow-sm transition-all whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76.99.08 2.04-.51 2.68-1.26z" />
              </svg>
              <span>Download on App Store</span>
            </a>
          ) : (
            <div className="flex items-center gap-1.5">
              <a
                href={APP_DOWNLOAD_LINKS.android}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
              >
                <span>Google Play</span>
              </a>
              <a
                href={APP_DOWNLOAD_LINKS.ios}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all"
              >
                <span>App Store</span>
              </a>
              <a
                href="#app-download-section"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1769E8] hover:bg-[#1358C2] text-white font-extrabold text-xs shadow-sm transition-all"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Get App</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

