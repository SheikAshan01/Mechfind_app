'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  PhoneCall,
  Shield,
  ArrowLeft,
  Calendar,
  Share2,
  ChevronRight,
  Radio,
} from 'lucide-react';
import CustomerNav from '@/components/CustomerNav';
import { INITIAL_MECHANICS } from '@/lib/constants';

export default function MechanicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const baseMech =
    INITIAL_MECHANICS.find((m) => m.id === resolvedParams.id || m.userId === resolvedParams.id) ||
    INITIAL_MECHANICS[0];

  const mechanic = {
    ...baseMech,
    id: baseMech.id || baseMech.userId,
    fullName: (baseMech as any).fullName || 'Rajesh Sharma',
    distanceKm: (baseMech as any).distanceKm || 1.2,
    pricingStartingAt: (baseMech as any).pricingStartingAt || 350,
    workingHours: `${baseMech.workingHoursStart || '07:00'} - ${baseMech.workingHoursEnd || '23:00'}`,
    vehicleTypes: (baseMech.supportedVehicles || ['car', 'bike']) as string[],
    reviews: [
      { id: 'rev_1', customerName: 'Arjun Kapoor', rating: 5, comment: 'Instant arrival within 12 minutes! Fixed the puncture quickly.', createdAt: '2 days ago' },
      { id: 'rev_2', customerName: 'Sneha Patel', rating: 5, comment: 'Very professional, diagnosed battery issue right away.', createdAt: '1 week ago' },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col">
      <CustomerNav />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Top Back Action */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#1769E8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mechanics</span>
        </button>

        {/* Workshop Banner Card */}
        <div className="bg-white dark:bg-[#131D2E] rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] overflow-hidden shadow-sm">
          {/* Header Graphic */}
          <div className="h-44 sm:h-52 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 flex flex-col justify-end relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Online & Ready</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center text-[#1769E8]">
                <Wrench className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold">{mechanic.shopName}</h1>
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-xs sm:text-sm text-blue-100">
                  Lead Master Technician: <span className="font-bold">{mechanic.fullName}</span> ({mechanic.yearsOfExperience} yrs exp)
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 p-4 border-b border-[#E2E8F0] dark:border-[#1E293B] text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-base sm:text-lg font-extrabold text-[#172338] dark:text-[#F8FAFC]">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{mechanic.rating}</span>
              </div>
              <div className="text-[11px] text-slate-400">{mechanic.reviewCount} Reviews</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold text-[#172338] dark:text-[#F8FAFC]">
                {mechanic.distanceKm} km
              </div>
              <div className="text-[11px] text-slate-400">Road Distance</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold text-[#1769E8]">
                ₹{mechanic.pricingStartingAt}
              </div>
              <div className="text-[11px] text-slate-400">Starting Fare</div>
            </div>
          </div>

          {/* Operational Details */}
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Workshop Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <MapPin className="w-5 h-5 text-[#1769E8] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#172338] dark:text-[#F8FAFC]">Location Address</div>
                  <div className="text-slate-500 dark:text-slate-400">{mechanic.shopAddress}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <Clock className="w-5 h-5 text-[#1769E8] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#172338] dark:text-[#F8FAFC]">Service Hours</div>
                  <div className="text-slate-500 dark:text-slate-400">{mechanic.workingHours}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <Shield className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#172338] dark:text-[#F8FAFC]">Verification Status</div>
                  <div className="text-slate-500 dark:text-slate-400">KYC & Trade License Verified by MECHFIND</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <Wrench className="w-5 h-5 text-[#1769E8] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#172338] dark:text-[#F8FAFC]">Vehicle Coverage</div>
                  <div className="text-slate-500 dark:text-slate-400">
                    {mechanic.vehicleTypes.join(', ').toUpperCase()} Roadside Dispatch
                  </div>
                </div>
              </div>
            </div>

            {/* Specializations Tags */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-400 mb-2">SPECIALIZATIONS:</div>
              <div className="flex flex-wrap gap-2">
                {mechanic.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#1769E8] text-xs font-semibold rounded-lg"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC] mb-3">
                Customer Reviews ({mechanic.reviews?.length || 0})
              </h3>
              <div className="space-y-3">
                {mechanic.reviews?.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#172338] dark:text-[#F8FAFC]">
                        {rev.customerName}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      "{rev.comment}"
                    </p>
                    <span className="text-[10px] text-slate-400">{rev.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Link
                href={`/customer/book?mechanicId=${mechanic.id}`}
                className="w-full h-12 rounded-2xl bg-[#1769E8] hover:bg-[#1358C2] text-white font-bold flex items-center justify-center gap-2 shadow-md transition-all text-sm"
              >
                <span>Book Breakdown Assistance</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
