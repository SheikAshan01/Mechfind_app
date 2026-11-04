'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car,
  Bike,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronRight,
  FileText,
  Printer,
  Calendar,
} from 'lucide-react';
import CustomerNav from '@/components/CustomerNav';
import {
  getBreakdownRequests,
  submitReview,
  generateInvoice,
  DEMO_CUSTOMER,
} from '@/lib/api';
import { BreakdownRequest, Invoice } from '@/lib/types';

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

export default function CustomerBookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [requests, setRequests] = useState<BreakdownRequest[]>([]);
  const [selectedReviewJob, setSelectedReviewJob] = useState<BreakdownRequest | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    getBreakdownRequests(DEMO_CUSTOMER.id, 'customer').then(setRequests);
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return r.status !== 'completed' && r.status !== 'cancelled';
    if (activeTab === 'completed') return r.status === 'completed';
    if (activeTab === 'cancelled') return r.status === 'cancelled';
    return true;
  });

  const handleOpenReview = (job: BreakdownRequest) => {
    setSelectedReviewJob(job);
    setRating(5);
    setComment('');
  };

  const handleSubmitReview = async () => {
    if (!selectedReviewJob || !selectedReviewJob.mechanicId) return;
    await submitReview(
      selectedReviewJob.id,
      rating,
      comment || 'Excellent emergency roadside repair!'
    );
    setSelectedReviewJob(null);
  };

  const handleViewInvoice = async (job: BreakdownRequest) => {
    const inv = await generateInvoice(job.id);
    setActiveInvoice(inv);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col">
      <CustomerNav />

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
            My Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Roadside assistance dispatches, ongoing fixes, and service history
          </p>
        </div>

        {/* Filter Pills (Matching Screen 5) */}
        <div className="flex items-center gap-2 p-1 bg-white dark:bg-[#131D2E] rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm">
          {(['all', 'active', 'completed', 'cancelled'] as FilterTab[]).map((tab) => {
            const isSelected = activeTab === tab;
            const label =
              tab === 'all'
                ? 'All'
                : tab === 'active'
                ? 'Active'
                : tab === 'completed'
                ? 'Completed'
                : 'Cancelled';

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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

        {/* Bookings List Cards (Matching Mobile Screen 5 Exactly) */}
        <div className="space-y-3">
          {filteredRequests.map((item) => {
            const isActive = item.status !== 'completed' && item.status !== 'cancelled';
            const isCompleted = item.status === 'completed';
            const isCancelled = item.status === 'cancelled';

            const badgeBg = isActive
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-[#16A34A]'
              : isCompleted
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600';

            const badgeLabel = isActive ? 'Active' : isCompleted ? 'Completed' : 'Cancelled';

            const v = item.vehicleDetails || (item as any).vehicle;
            const vehicleTitle = v
              ? `${v.make} ${v.model}${v.licensePlate ? ` (${v.licensePlate})` : ''}`
              : 'Hyundai Creta SX (MH 02 EE 4092)';

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isActive) {
                    router.push(`/customer/tracking/${item.id}`);
                  } else if (isCompleted) {
                    handleOpenReview(item);
                  }
                }}
                className="bg-white dark:bg-[#131D2E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm hover:border-slate-300 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3.5">
                  {/* Left Vehicle Icon in Box */}
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1769E8] flex-shrink-0">
                    {v?.type === 'bike' ? (
                      <Bike className="w-6 h-6" />
                    ) : (
                      <Car className="w-6 h-6" />
                    )}
                  </div>

                  {/* Middle Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-[#172338] dark:text-[#F8FAFC] truncate">
                        {(item as any).categoryName || item.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeBg}`}>
                        {badgeLabel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {vehicleTitle}
                    </p>

                    <p
                      className={`text-xs mt-1 font-semibold ${
                        isActive ? 'text-[#16A34A]' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {isActive
                        ? `ETA: ~${item.etaMinutes || 10} mins`
                        : '25 Oct, 10:55 AM'}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </div>

                {isCompleted && (
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewInvoice(item);
                      }}
                      className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1769E8]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenReview(item);
                      }}
                      className="flex items-center gap-1 font-bold text-[#1769E8] hover:underline"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Rate Service</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 5-Star Rating Modal */}
        {selectedReviewJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#131D2E] p-6 rounded-3xl max-w-sm w-full space-y-4 text-center border border-slate-200 dark:border-slate-800 shadow-xl">
              <h3 className="text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                Rate Your Mechanic
              </h3>
              <p className="text-xs text-slate-500">
                {(selectedReviewJob as any).mechanic?.shopName || 'Apex Speed Garage'}
              </p>

              {/* Star Selector */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1 text-amber-500 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${s <= rating ? 'fill-amber-500' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                placeholder="Share your experience with this breakdown service..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedReviewJob(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="flex-1 py-2.5 rounded-xl bg-[#1769E8] text-white text-xs font-bold shadow-sm"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {activeInvoice && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#131D2E] p-6 rounded-3xl max-w-md w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#1769E8]">
                  {activeInvoice.invoiceNumber}
                </span>
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                  MECHFIND Tax Invoice
                </h3>
                <p className="text-xs text-slate-400">Paid via UPI / Razorpay</p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Customer</span>
                  <span className="font-bold text-[#172338] dark:text-[#F8FAFC]">{activeInvoice.customerName}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Workshop</span>
                  <span className="font-bold text-[#172338] dark:text-[#F8FAFC]">{activeInvoice.mechanicShopName}</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Total Amount Paid</span>
                  <span className="font-extrabold text-base text-[#1769E8]">₹{activeInvoice.grandTotal}</span>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tax Invoice</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
