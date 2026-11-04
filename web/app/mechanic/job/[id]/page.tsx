'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Navigation,
  CheckCircle,
  PhoneCall,
  MessageSquare,
  MapPin,
  Car,
  Bike,
  User,
  ArrowLeft,
  FileSpreadsheet,
  Plus,
  Trash2,
  DollarSign,
} from 'lucide-react';
import MechanicSidebar from '@/components/MechanicSidebar';
import {
  getBreakdownRequests,
  updateRequestStatus,
  submitQuote,
  DEMO_MECHANIC,
} from '@/lib/api';
import { BreakdownRequest, QuoteItem } from '@/lib/types';

export default function MechanicJobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const jobId = resolvedParams.id;

  const [job, setJob] = useState<BreakdownRequest | null>(null);
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { id: '1', itemType: 'labour', description: 'Labour & diagnostic inspection', quantity: 1, unitPrice: 350, totalPrice: 350 },
    { id: '2', itemType: 'part', description: 'Replacement fuse & boost charge', quantity: 1, unitPrice: 150, totalPrice: 150 },
  ]);

  useEffect(() => {
    getBreakdownRequests(DEMO_MECHANIC.id, 'mechanic').then((list) => {
      const match = list.find((j) => j.id === jobId) || list[0];
      setJob(match);
    });
  }, [jobId]);

  const handleCall = () => {
    window.location.href = `tel:${job?.customerPhone || '+919876543210'}`;
  };

  const handleWhatsApp = () => {
    const phone = job?.customerPhone?.replace(/[^0-9]/g, '') || '919876543210';
    window.open(`https://wa.me/${phone}?text=Hello%20Arjun%2C%20I%20am%20your%20MECHFIND%20breakdown%20mechanic`, '_blank');
  };

  const handleStartNav = () => {
    router.push(`/mechanic/navigation/${jobId}`);
  };

  const handleMarkArrived = async () => {
    if (!job) return;
    await updateRequestStatus(job.id, 'arrived');
    setJob((prev) => prev ? { ...prev, status: 'arrived' } : null);
  };

  const handleCompleteRepair = async () => {
    if (!job) return;
    await updateRequestStatus(job.id, 'completed');
    router.push('/mechanic/jobs');
  };

  const handleSendQuote = async () => {
    if (!job) return;
    const total = quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);
    await submitQuote(job.id, job.mechanicId || 'mech_01', quoteItems, 'Standard breakdown parts & labor guarantee.');
    setShowQuoteBuilder(false);
    setJob((prev) => prev ? { ...prev, status: 'quote_submitted', estimatedCost: total } : null);
  };

  const customerName = job?.customerName || 'Arjun Kapoor';
  const serviceTitle = job?.categoryName || 'Battery Jumpstart';
  const vehicleDesc = job?.vehicle
    ? `${job.vehicle.make} ${job.vehicle.model}${
        job.vehicle.licensePlate ? ` (${job.vehicle.licensePlate})` : ''
      }`
    : 'Hyundai Creta SX (MH 02 EE 4092)';
  const locationAddress = job?.addressText || (job?.location as any)?.address || 'SV Road, Near Bandra Station West';
  const estimateCost = job?.estimatedCost || 400;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col lg:flex-row">
      <MechanicSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full space-y-6">
        {/* Top Header with Active Badge (Matching Mobile Screen 7) */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#1769E8]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Job Details</span>
          </button>

          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#16A34A] text-xs font-bold">
            Active
          </span>
        </div>

        {/* Customer Profile Row Card (Matching Mobile Screen 7) */}
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-[#1769E8]">
              <User className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#172338] dark:text-[#F8FAFC]">
                {customerName}
              </h2>
              <p className="text-xs text-slate-400">Motorist Client</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCall}
              className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#16A34A] border border-emerald-200 dark:border-emerald-800 flex items-center justify-center hover:bg-emerald-100 transition-colors"
              title="Call Customer"
            >
              <PhoneCall className="w-4 h-4" />
            </button>
            <button
              onClick={handleWhatsApp}
              className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#16A34A] border border-emerald-200 dark:border-emerald-800 flex items-center justify-center hover:bg-emerald-100 transition-colors"
              title="WhatsApp Customer"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Breakdown Information Fields (Matching Mobile Screen 7) */}
        <div className="bg-white dark:bg-[#131D2E] p-6 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-400">Service</div>
            <div className="text-base font-bold text-[#172338] dark:text-[#F8FAFC] mt-0.5">
              {serviceTitle}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400">Vehicle</div>
            <div className="text-base font-bold text-[#172338] dark:text-[#F8FAFC] mt-0.5">
              {vehicleDesc}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400">Location</div>
            <div className="text-base font-bold text-[#172338] dark:text-[#F8FAFC] mt-0.5">
              {locationAddress}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400">Estimate</div>
            <div className="text-xl font-extrabold text-[#1769E8] mt-0.5">
              ₹{estimateCost}
            </div>
          </div>
        </div>

        {/* Action Buttons: Start Navigation & Mark as Arrived (Screen 7 Parity) */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleStartNav}
            className="w-full h-12 rounded-2xl border-2 border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131D2E] text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <Navigation className="w-4 h-4 text-[#1769E8]" />
            <span>Start Navigation</span>
          </button>

          {job?.status !== 'arrived' && job?.status !== 'work_in_progress' && (
            <button
              onClick={handleMarkArrived}
              className="w-full h-13 py-3.5 rounded-2xl bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark as Arrived</span>
            </button>
          )}

          {job?.status === 'arrived' && (
            <button
              onClick={handleCompleteRepair}
              className="w-full h-13 py-3.5 rounded-2xl bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete Repair & Collect Fare</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
