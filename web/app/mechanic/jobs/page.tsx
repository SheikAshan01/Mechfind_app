'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  CheckCircle,
  Clock,
  Car,
  Bike,
  ChevronRight,
  Filter,
} from 'lucide-react';
import MechanicSidebar from '@/components/MechanicSidebar';
import { getBreakdownRequests, DEMO_MECHANIC } from '@/lib/api';
import { BreakdownRequest } from '@/lib/types';

type JobTab = 'all' | 'active' | 'completed';

export default function MechanicJobsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<JobTab>('all');
  const [jobs, setJobs] = useState<BreakdownRequest[]>([]);

  useEffect(() => {
    getBreakdownRequests(DEMO_MECHANIC.id, 'mechanic').then(setJobs);
  }, []);

  const filtered = jobs.filter((j) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return j.status !== 'completed' && j.status !== 'cancelled';
    if (activeTab === 'completed') return j.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col lg:flex-row">
      <MechanicSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
              Assigned Jobs & History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage work-in-progress, completed repairs, and inspection logs
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#131D2E] rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B]">
            {(['all', 'active', 'completed'] as JobTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-[#1769E8] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((job) => {
            const isActive = job.status !== 'completed' && job.status !== 'cancelled';
            return (
              <div
                key={job.id}
                onClick={() => router.push(`/mechanic/job/${job.id}`)}
                className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm hover:border-[#1769E8] cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1769E8]">
                    {job.vehicle?.type === 'bike' ? <Bike className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                        {job.categoryName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-[#1769E8]'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-[#16A34A]'
                        }`}
                      >
                        {isActive ? 'ACTIVE' : 'COMPLETED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {job.customerName} • {job.vehicle?.make} {job.vehicle?.model}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 font-semibold text-[#1769E8]">
                      Fare: ₹{job.estimatedCost}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

