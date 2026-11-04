'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Power,
  PhoneCall,
  MapPin,
  Clock,
  Navigation,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Star,
  RefreshCw,
  LogOut,
  ShieldCheck,
  ArrowRight,
  Radio,
  Car,
  Bike,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import MechanicSidebar from '@/components/MechanicSidebar';
import {
  getBreakdownRequests,
  updateRequestStatus,
  DEMO_MECHANIC,
} from '@/lib/api';
import { BreakdownRequest } from '@/lib/types';

export default function MechanicDashboardPage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [requests, setRequests] = useState<BreakdownRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const list = await getBreakdownRequests(DEMO_MECHANIC.id, 'mechanic');
    setRequests(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeJob = requests.find(
    (r) => r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'submitted'
  ) || requests[0];

  const incomingRequest = requests.find((r) => r.status === 'submitted') || {
    id: 'req_inc_201',
    customerId: 'cust_03',
    customerName: 'Pooja Bhatt',
    customerPhone: '+91 98111 22334',
    vehicle: {
      id: 'veh_03',
      userId: 'cust_03',
      type: 'car' as const,
      make: 'Honda',
      model: 'City ZX',
      year: 2021,
      licensePlate: 'MH 02 CZ 1044',
      fuelType: 'petrol' as const,
      isDefault: true,
      createdAt: '2025-03-01T00:00:00Z',
    },
    category: 'flat_tyre' as const,
    categoryName: 'Flat Tyre & Puncture',
    description: 'Front left tyre hit a pothole and rapidly deflated. Spare tyre is in the trunk.',
    photos: [],
    location: {
      latitude: 19.0645,
      longitude: 72.835,
      address: 'Near Bandra Reclamation Promenade',
      landmark: 'Near Sea Link Toll Plaza Entry',
    },
    status: 'submitted' as const,
    urgency: 'high' as const,
    estimatedCost: 350,
    etaMinutes: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleAccept = (reqId: string) => {
    updateRequestStatus(reqId, 'accepted');
    router.push(`/mechanic/job/${reqId}`);
  };

  const handleDecline = (reqId: string) => {
    updateRequestStatus(reqId, 'cancelled');
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col lg:flex-row">
      <MechanicSidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* 1. Workshop Header Card (Matching Mobile Screen 6) */}
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-[#1769E8] shadow-sm">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-bold text-[#172338] dark:text-[#F8FAFC]">
                  Apex Speed Garage
                </h1>
                <CheckCircle className="w-4 h-4 text-[#16A34A]" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isOnline
                  ? 'Online • Ready to receive requests'
                  : 'Offline • Toggle switch to receive emergency jobs'}
              </p>
            </div>
          </div>

          {/* Online Toggle Switch */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                isOnline ? 'bg-[#16A34A]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={isOnline}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isOnline ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* 2. Three Metric Stat Boxes (Matching Mobile Screen 6) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Active Jobs */}
          <div className="bg-[#142235] dark:bg-[#1E293B] p-5 rounded-2xl text-white flex flex-col justify-between shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold mb-1">
              {activeJob ? 2 : 1}
            </div>
            <div className="text-xs font-semibold text-slate-300">Active Jobs</div>
          </div>

          {/* This Week */}
          <div className="bg-[#142235] dark:bg-[#1E293B] p-5 rounded-2xl text-white flex flex-col justify-between shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold mb-1">₹4,200</div>
            <div className="text-xs font-semibold text-slate-300">This Week</div>
          </div>

          {/* Rating */}
          <div className="bg-[#142235] dark:bg-[#1E293B] p-5 rounded-2xl text-white flex flex-col justify-between shadow-sm">
            <div className="text-2xl sm:text-3xl font-extrabold mb-1 flex items-center gap-1">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>4.9</span>
            </div>
            <div className="text-xs font-semibold text-slate-300">(142 Reviews)</div>
          </div>
        </div>

        {/* 3. New Requests (1) Card (Matching Mobile Screen 6) */}
        {incomingRequest && (
          <div className="space-y-2.5">
            <h2 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
              New Requests (1)
            </h2>

            <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1769E8] flex-shrink-0">
                  <Bike className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#172338] dark:text-[#F8FAFC] truncate">
                      {incomingRequest.categoryName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#16A34A] text-[11px] font-bold">
                      Just now
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {incomingRequest.vehicle?.make} {incomingRequest.vehicle?.model || 'Honda City ZX'}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>~1.2 km</span>
                    <span>•</span>
                    <span className="font-bold text-[#1769E8]">₹{incomingRequest.estimatedCost}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Decline & Accept */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleDecline(incomingRequest.id)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleAccept(incomingRequest.id)}
                  className="flex-1 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Active Job Card (Matching Mobile Screen 6) */}
        {activeJob && (
          <div className="space-y-2.5">
            <h2 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
              Active Job
            </h2>

            <div
              onClick={() => router.push(`/mechanic/job/${activeJob.id}`)}
              className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm hover:border-[#1769E8] cursor-pointer transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-[#1769E8]">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                      {activeJob.categoryName || 'Battery Jumpstart'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1769E8] text-[10px] font-bold">
                      On the way
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeJob.vehicle?.make || 'Hyundai'} {activeJob.vehicle?.model || 'Creta SX'}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
