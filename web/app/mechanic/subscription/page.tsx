'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  Zap,
  Star,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import MechanicSidebar from '@/components/MechanicSidebar';

export default function MechanicSubscriptionPage() {
  const [selectedPlanId, setSelectedPlanId] = useState('plan_pro');
  const [successNotice, setSuccessNotice] = useState(false);

  const handleUpgrade = (planTitle: string) => {
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col lg:flex-row">
      <MechanicSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
            Subscription & Lead Quota
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Partner plans, priority breakdown broadcasting, and lead consumption
          </p>
        </div>

        {/* Active Plan Status Card */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                ACTIVE PLAN
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
                Pro Partner Workshop
              </h2>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-100">Monthly Billing</div>
              <div className="text-lg font-black">₹999 / mo</div>
            </div>
          </div>

          {/* Lead Quota Progress */}
          <div className="space-y-1.5 pt-2 border-t border-white/20">
            <div className="flex items-center justify-between text-xs">
              <span>Emergency Breakdown Leads Used</span>
              <span className="font-bold">42 / 60 Leads</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/20 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '70%' }} />
            </div>
            <div className="text-[11px] text-blue-100">Renews automatically in 12 days</div>
          </div>
        </div>

        {successNotice && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-[#16A34A] text-xs font-bold rounded-xl border border-emerald-200">
            ✓ Subscription updated! Your new lead quota is now active.
          </div>
        )}

        {/* Available Tier Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Starter Plan */}
          <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                Starter Tier
              </h3>
              <div className="text-2xl font-black text-[#172338] dark:text-[#F8FAFC]">
                Free
              </div>
              <p className="text-xs text-slate-400">For individual roadside mobile mechanics</p>

              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-3">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>10 Breakdown Leads/mo</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>5 km Dispatch Radius</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Standard 10% Platform Fee</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade('Starter')}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Partner Plan (Selected) */}
          <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border-2 border-[#1769E8] shadow-md flex flex-col justify-between space-y-4 relative">
            <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#1769E8] text-white text-[10px] font-bold">
              MOST POPULAR
            </span>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#1769E8]">
                Pro Partner
              </h3>
              <div className="text-2xl font-black text-[#172338] dark:text-[#F8FAFC]">
                ₹999 <span className="text-xs font-normal text-slate-400">/ mo</span>
              </div>
              <p className="text-xs text-slate-400">For established multi-bay garages</p>

              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-3">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>60 Breakdown Leads/mo</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>15 km Dispatch Radius</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Green Verified Partner Badge</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Lower 5% Commission</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade('Pro Partner')}
              className="w-full py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1358C2] text-white text-xs font-bold shadow-sm"
            >
              Active Subscription
            </button>
          </div>

          {/* Elite Workshop Plan */}
          <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                Elite Enterprise
              </h3>
              <div className="text-2xl font-black text-[#172338] dark:text-[#F8FAFC]">
                ₹2,499 <span className="text-xs font-normal text-slate-400">/ mo</span>
              </div>
              <p className="text-xs text-slate-400">For towing operators & service centers</p>

              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-3">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Unlimited Leads</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>30 km Regional Radius</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>0% Commission (Keep 100%)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Priority Broadcast Routing</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade('Elite Enterprise')}
              className="w-full py-2.5 rounded-xl border border-[#1769E8] text-[#1769E8] text-xs font-bold hover:bg-blue-50"
            >
              Upgrade to Elite
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

