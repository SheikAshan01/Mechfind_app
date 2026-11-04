'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Send,
  Navigation,
  Clock,
  PhoneCall,
  User,
  CheckCircle,
  ChevronRight,
  Car,
  Bike,
} from 'lucide-react';
import MechanicSidebar from '@/components/MechanicSidebar';
import { getBreakdownRequests, DEMO_MECHANIC } from '@/lib/api';
import { BreakdownRequest } from '@/lib/types';

export default function MechanicDispatchesPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<BreakdownRequest[]>([]);

  useEffect(() => {
    getBreakdownRequests(DEMO_MECHANIC.id, 'mechanic').then(setRequests);
  }, []);

  const dispatchList = requests.filter(
    (r) => r.status === 'heading_to_customer' || r.status === 'accepted' || r.status === 'arrived'
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col lg:flex-row">
      <MechanicSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
            Active Dispatches
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Roadside assistance calls where mechanics are en-route or on-site
          </p>
        </div>

        <div className="space-y-3">
          {dispatchList.map((job) => (
            <div
              key={job.id}
              onClick={() => router.push(`/mechanic/job/${job.id}`)}
              className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm hover:border-[#1769E8] cursor-pointer transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-[#1769E8]">
                  {job.vehicle?.type === 'bike' ? <Bike className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                      {job.categoryName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1769E8] text-[10px] font-bold">
                      EN-ROUTE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customer: {job.customerName} • {job.vehicle?.make} {job.vehicle?.model}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Spot: {job.addressText || (job.location as any).address || 'SV Road, Mumbai'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/mechanic/navigation/${job.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-xl bg-[#1769E8] text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                </Link>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
