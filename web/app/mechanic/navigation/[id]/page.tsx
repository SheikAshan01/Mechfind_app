'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Navigation,
  Clock,
  PhoneCall,
  MessageSquare,
  MapPin,
  CheckCircle,
  ArrowLeft,
  Car,
  User,
} from 'lucide-react';
import MechanicSidebar from '@/components/MechanicSidebar';
import InteractiveMap from '@/components/InteractiveMap';
import { getBreakdownRequests, updateRequestStatus, DEMO_MECHANIC } from '@/lib/api';
import { BreakdownRequest } from '@/lib/types';

export default function MechanicNavigationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const jobId = resolvedParams.id;

  const [job, setJob] = useState<BreakdownRequest | null>(null);
  const [eta, setEta] = useState(10);

  useEffect(() => {
    getBreakdownRequests(DEMO_MECHANIC.id, 'mechanic').then((list) => {
      const match = list.find((j) => j.id === jobId) || list[0];
      setJob(match);
    });
  }, [jobId]);

  const handleMarkArrived = async () => {
    if (!job) return;
    await updateRequestStatus(job.id, 'arrived');
    router.push(`/mechanic/job/${job.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col lg:flex-row">
      <MechanicSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#1769E8]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Navigation</span>
          </button>

          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1769E8] text-xs font-bold">
            GPS Turn-by-Turn
          </span>
        </div>

        {/* Map View */}
        <div className="h-80 sm:h-96 w-full rounded-3xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm">
          <InteractiveMap
            userLocation={{ latitude: 19.076, longitude: 72.8777 }}
            mechanicLocation={{ latitude: 19.085, longitude: 72.885 }}
            showRoute={true}
            etaMinutes={eta}
            distanceKm={1.2}
            height="100%"
          />
        </div>

        {/* Customer Breakdown Destination Card */}
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-[#1769E8]">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                {job?.customerName || 'Arjun Kapoor'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {job?.addressText || (job?.location as any)?.address || 'SV Road, Near Bandra Station West'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${job?.customerPhone || '+919876543210'}`}
              className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#16A34A] border border-emerald-200"
              title="Call"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
            <button
              onClick={handleMarkArrived}
              className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              Mark as Arrived
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
