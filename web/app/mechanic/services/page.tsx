'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  DollarSign,
  Check,
  Plus,
  ArrowLeft,
  Bike,
  Car,
  Save,
} from 'lucide-react';
import MechanicSidebar from '@/components/MechanicSidebar';
import { SERVICE_CATEGORIES } from '@/lib/constants';

export default function MechanicServicesPage() {
  const [services, setServices] = useState(
    SERVICE_CATEGORIES.map((s) => ({
      ...s,
      enabled: true,
      customPrice: s.estimatedPrice,
    }))
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handlePriceChange = (id: string, price: number) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, customPrice: price } : s))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col lg:flex-row">
      <MechanicSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
              Services & Base Pricing
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Configure available breakdown assistance categories and workshop dispatch fees
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-[#1769E8] hover:bg-[#1358C2] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Pricing</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-[#16A34A] text-xs font-bold rounded-xl border border-emerald-200">
            ✓ Workshop services and transparent dispatch tariffs updated successfully!
          </div>
        )}

        <div className="space-y-3">
          {services.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all bg-white dark:bg-[#131D2E] flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.enabled
                  ? 'border-[#E2E8F0] dark:border-[#1E293B] shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1769E8] flex-shrink-0">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.description}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    Est. Duration: ~{item.estimatedTimeMin} mins
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={item.customPrice}
                    onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                    className="w-16 bg-transparent text-xs sm:text-sm font-extrabold text-[#1769E8] focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => toggleService(item.id)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    item.enabled ? 'bg-[#16A34A]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      item.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

