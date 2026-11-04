'use client';

import React from 'react';
import { Star, MessageSquare, ShieldCheck, ThumbsUp } from 'lucide-react';
import MechanicSidebar from '@/components/MechanicSidebar';
import { INITIAL_MECHANICS } from '@/lib/constants';

export default function MechanicReviewsPage() {
  const lead = INITIAL_MECHANICS[0];
  const reviews = [
    { id: 'rev_1', customerName: 'Arjun Kapoor', rating: 5, comment: 'Instant arrival within 12 minutes! Fixed the puncture quickly and properly balanced the wheel.', createdAt: 'Today, 11:30 AM' },
    { id: 'rev_2', customerName: 'Sneha Patel', rating: 5, comment: 'Very professional, diagnosed battery alternator issue right away.', createdAt: 'Yesterday' },
    { id: 'rev_3', customerName: 'Rohan Sharma', rating: 4, comment: 'Arrived quickly during peak hours. Good service.', createdAt: '3 days ago' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col lg:flex-row">
      <MechanicSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
            Customer Reviews & Ratings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real feedback from motorists assisted by Apex Speed Garage
          </p>
        </div>

        {/* Rating Overview Card */}
        <div className="bg-white dark:bg-[#131D2E] p-6 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          <div className="sm:col-span-5 text-center sm:text-left space-y-1">
            <div className="text-4xl sm:text-5xl font-black text-[#172338] dark:text-[#F8FAFC]">
              4.9
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 text-amber-500 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-slate-400">Based on 142 verified breakdown dispatches</p>
          </div>

          {/* Progress Bars */}
          <div className="sm:col-span-7 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-6 font-bold text-slate-600 dark:text-slate-300">5 ★</span>
              <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '88%' }} />
              </div>
              <span className="w-8 text-right text-slate-400">88%</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-6 font-bold text-slate-600 dark:text-slate-300">4 ★</span>
              <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '9%' }} />
              </div>
              <span className="w-8 text-right text-slate-400">9%</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-6 font-bold text-slate-600 dark:text-slate-300">3 ★</span>
              <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '3%' }} />
              </div>
              <span className="w-8 text-right text-slate-400">3%</span>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-[#131D2E] p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
                  {r.customerName}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= r.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                "{r.comment}"
              </p>
              <div className="text-[10px] text-slate-400">{r.createdAt}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
