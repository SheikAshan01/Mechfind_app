'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  Building,
  CreditCard,
  ChevronRight,
  ArrowUpRight,
  DollarSign,
  Search,
} from 'lucide-react';
import MechanicSidebar from '@/components/MechanicSidebar';

type TimeFilter = 'today' | 'week' | 'month';

export default function MechanicEarningsPage() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('today');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const displayedAmount = activeFilter === 'today' ? 850 : activeFilter === 'week' ? 4200 : 18500;
  const displayedJobs = activeFilter === 'today' ? 1 : activeFilter === 'week' ? 5 : 24;
  const avgPerJob = Math.round(displayedAmount / (displayedJobs || 1));

  const handleRequestPayout = () => {
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setShowPayoutModal(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col lg:flex-row">
      <MechanicSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
              Earnings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Breakdown service revenue & weekly bank settlements
            </p>
          </div>

          <button className="p-2 rounded-xl bg-white dark:bg-[#131D2E] border border-[#E2E8F0] dark:border-[#1E293B] text-slate-500 hover:bg-slate-50">
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Time Period Filter Pills (Matching Mobile Screen 8) */}
        <div className="flex items-center gap-2 p-1 bg-white dark:bg-[#131D2E] rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm">
          {(['today', 'week', 'month'] as TimeFilter[]).map((period) => {
            const isSelected = activeFilter === period;
            const label =
              period === 'today'
                ? 'Today'
                : period === 'week'
                ? 'This Week'
                : 'This Month';

            return (
              <button
                key={period}
                onClick={() => setActiveFilter(period)}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isSelected
                    ? 'bg-[#1769E8] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Large Hero Card (Matching Mobile Screen 8) */}
        <div className="bg-white dark:bg-[#131D2E] p-6 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
              ₹{displayedAmount.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {activeFilter === 'today'
                ? "Today's Earnings"
                : activeFilter === 'week'
                ? "This Week's Earnings"
                : "This Month's Earnings"}
            </div>
          </div>

          {/* Green Rounded Wallet Container */}
          <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] dark:bg-emerald-950/60 flex items-center justify-center text-[#16A34A] shadow-sm">
            <Wallet className="w-7 h-7" />
          </div>
        </div>

        {/* Breakdown Metric Rows Card (Matching Mobile Screen 8) */}
        <div className="bg-white dark:bg-[#131D2E] rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          <div className="p-4 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Jobs Completed</span>
            <span className="font-bold text-[#172338] dark:text-[#F8FAFC]">{displayedJobs}</span>
          </div>

          <div className="p-4 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Avg. per Job</span>
            <span className="font-bold text-[#172338] dark:text-[#F8FAFC]">₹{avgPerJob.toLocaleString()}</span>
          </div>

          <div className="p-4 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Total Earnings</span>
            <span className="font-bold text-[#172338] dark:text-[#F8FAFC]">₹28,400</span>
          </div>
        </div>

        {/* Payouts & Bank Settlement Action (Matching Screen 8) */}
        <div
          onClick={() => setShowPayoutModal(true)}
          className="bg-white dark:bg-[#131D2E] p-4 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm hover:border-[#1769E8] cursor-pointer transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-[#1769E8]">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
                Payouts & Bank Settlement
              </div>
              <div className="text-[11px] text-slate-400">
                HDFC Bank Current A/C •••• 9081 (Verified)
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Bank Settlement Modal */}
        {showPayoutModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#131D2E] p-6 rounded-3xl max-w-sm w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
              <h3 className="text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                Direct Bank Settlement
              </h3>
              <p className="text-xs text-slate-500">
                Weekly automated transfer is scheduled for Monday 10:00 AM. You can also request an instant payout.
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                <div className="font-bold text-[#172338] dark:text-[#F8FAFC]">HDFC Bank Current A/C</div>
                <div className="text-slate-500">•••• •••• •••• 9081</div>
                <div className="text-slate-400 text-[10px]">IFSC: HDFC0001234</div>
              </div>

              {payoutSuccess ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-[#16A34A] text-xs font-bold rounded-xl text-center">
                  ✓ Instant payout of ₹{displayedAmount} initiated to bank account!
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setShowPayoutModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleRequestPayout}
                    className="flex-1 py-2.5 rounded-xl bg-[#1769E8] text-white text-xs font-bold shadow-sm"
                  >
                    Instant Payout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

