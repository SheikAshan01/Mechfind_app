'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Radio,
  Clock,
  MapPin,
  Car,
  Bike,
  CheckCircle,
  X,
  PhoneCall,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import MechanicSidebar from '@/components/MechanicSidebar';
import { getBreakdownRequests, updateRequestStatus, DEMO_MECHANIC } from '@/lib/api';
import { BreakdownRequest } from '@/lib/types';

export default function MechanicRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<BreakdownRequest[]>([]);

  useEffect(() => {
    getBreakdownRequests(DEMO_MECHANIC.id, 'mechanic').then((list) => {
      setRequests(list);
    });
  }, []);

  const incomingList = requests.filter((r) => r.status === 'submitted');

  const handleAccept = async (id: string) => {
    await updateRequestStatus(id, 'accepted');
    router.push(`/mechanic/job/${id}`);
  };

  const handleDecline = async (id: string) => {
    await updateRequestStatus(id, 'cancelled');
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col lg:flex-row">
      <MechanicSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
            Incoming Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time roadside breakdown alerts broadcasted to your workshop dispatch radius
          </p>
        </div>

        <div className="space-y-4">
          {incomingList.length === 0 ? (
            <div className="bg-white dark:bg-[#131D2E] p-8 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] text-center space-y-2">
              <Radio className="w-10 h-10 text-slate-400 mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
                No pending incoming requests
              </h3>
              <p className="text-xs text-slate-500">
                You are online. When a driver breaks down in your 15 km zone, alerts will appear here instantly.
              </p>
            </div>
          ) : (
            incomingList.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1769E8]">
                      {req.vehicle?.type === 'bike' ? <Bike className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                          {req.categoryName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#16A34A] text-[10px] font-bold">
                          NEW
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {req.customerName} • {req.vehicle?.make} {req.vehicle?.model} ({req.vehicle?.licensePlate})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Estimated Payout</span>
                    <div className="text-base font-extrabold text-[#1769E8]">
                      ₹{req.estimatedCost}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-[#1769E8]" />
                    <span>{req.addressText || (req.location as any).address || 'SV Road, Mumbai'}</span>
                  </div>
                  <div className="text-slate-400 pl-5">
                    Landmark: {req.landmark || (req.location as any)?.landmark || 'Roadside marker'}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleDecline(req.id)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="flex-1 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    Accept Request
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
