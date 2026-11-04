'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShieldCheck, Wrench, Loader2 } from 'lucide-react';

function MechanicVerificationContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const isSubmitted = statusParam === 'submitted';

  return (
    <div className="py-16 sm:py-24 max-w-xl mx-auto px-4 text-white text-center space-y-8">
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#FFD400]/20 text-[#FFD400] flex items-center justify-center mx-auto shadow-brand">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#FFD400] uppercase tracking-wider">
            Partner KYC Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {isSubmitted ? 'Application Under Review' : 'Verified Partner Workshop'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            {isSubmitted
              ? 'Your workshop documents and trade credentials have been submitted to our field auditing team. Typical review takes 2 hours.'
              : 'Your garage identity, trade certifications, and mechanic credentials are fully verified and approved on the MECHFIND network.'}
          </p>
        </div>

        {/* Verification Checklist */}
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-4 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Aadhaar / Government ID:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Workshop Geo-Coordinates:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> PostGIS Indexed
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Trade Experience Audit:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Daily Payouts Bank Mandate:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/mechanic/dashboard"
            className="flex-1 py-3 rounded-xl bg-[#FFD400] hover:bg-[#E5BE00] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-brand"
          >
            <Wrench className="w-4 h-4" />
            <span>Open Dispatch Terminal</span>
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-[#262626] hover:bg-[#333333] text-gray-300 font-bold text-xs border border-gray-700"
          >
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MechanicVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-white flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#FFD400]" />
          <span>Verifying credentials...</span>
        </div>
      }
    >
      <MechanicVerificationContent />
    </Suspense>
  );
}
