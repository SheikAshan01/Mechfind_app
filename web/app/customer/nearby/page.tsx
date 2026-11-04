'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Navigation,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  Wrench,
  ArrowRight,
  Filter,
} from 'lucide-react';
import CustomerNav from '@/components/CustomerNav';
import InteractiveMap from '@/components/InteractiveMap';
import { findNearbyMechanics } from '@/lib/api';
import { INITIAL_MECHANICS } from '@/lib/constants';

type FilterOption = 'nearby' | 'rating' | 'price';

export default function NearbyMechanicsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('nearby');
  const [rawMechanics, setRawMechanics] = useState<any[]>(() =>
    INITIAL_MECHANICS.map((m, idx) => ({
      ...m,
      distanceKm: idx === 0 ? 1.2 : idx === 1 ? 2.4 : idx === 2 ? 3.8 : 5.1,
      estimatedMinutes: idx === 0 ? 10 : idx === 1 ? 18 : idx === 2 ? 24 : 30,
      pricingStartingAt: idx === 0 ? 350 : idx === 1 ? 400 : 300,
    }))
  );

  const customerCoords = { latitude: 19.076, longitude: 72.8777, label: 'Dindigul West' };

  useEffect(() => {
    async function load() {
      const data = await findNearbyMechanics(customerCoords.latitude, customerCoords.longitude, 20);
      if (data && data.length > 0) {
        setRawMechanics(data);
      }
    }
    load();
  }, []);

  const mechanics = useMemo(() => {
    const list = [...rawMechanics];
    if (activeFilter === 'rating') {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (activeFilter === 'price') {
      return list.sort((a, b) => (a.pricingStartingAt || a.startingPrice || 350) - (b.pricingStartingAt || b.startingPrice || 350));
    }
    return list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [rawMechanics, activeFilter]);

  const mapMarkers = mechanics.map((m) => ({
    id: m.id || m.userId,
    name: m.shopName,
    rating: m.rating,
    distanceKm: m.distanceKm || 1.5,
    pricingStartingAt: m.pricingStartingAt || m.startingPrice || 350,
    latitude: m.lat || m.latitude || 19.076,
    longitude: m.lng || m.longitude || 72.8777,
    isOnline: m.isOnline,
  }));

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col">
      <CustomerNav />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
              Nearby Mechanics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Verified workshops and mobile puncture vans within 15 km of your location
            </p>
          </div>

          {/* Filter Pills: Nearby | Rating | Price */}
          <div className="flex items-center gap-2 p-1 bg-white dark:bg-[#131D2E] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm">
            {(['nearby', 'rating', 'price'] as FilterOption[]).map((filter) => {
              const isSelected = activeFilter === filter;
              const label =
                filter === 'nearby'
                  ? 'Nearby (Distance)'
                  : filter === 'rating'
                  ? 'Top Rated'
                  : 'Starting Price';

              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
        </div>

        {/* Top Radar Map Preview */}
        <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-sm">
          <InteractiveMap
            userLocation={customerCoords}
            mechanics={mapMarkers}
            height="100%"
          />
        </div>

        {/* Mechanic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mechanics.map((mechanic) => (
            <div
              key={mechanic.id}
              className="bg-white dark:bg-[#131D2E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm hover:border-[#1769E8] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1769E8] flex-shrink-0">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC] truncate">
                        {mechanic.shopName}
                      </h3>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#16A34A] bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-bold text-[#172338] dark:text-[#F8FAFC]">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {mechanic.rating} ({mechanic.reviewCount})
                      </span>
                      <span>•</span>
                      <span>{mechanic.distanceKm} km</span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                      {mechanic.shopAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1 font-bold text-[#172338] dark:text-[#F8FAFC]">
                    ₹{mechanic.pricingStartingAt} Starting
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>~{mechanic.estimatedArrivalMinutes} mins</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Link
                  href={`/customer/mechanic/${mechanic.id}`}
                  className="flex-1 py-2 rounded-xl border border-[#E2E8F0] dark:border-slate-700 text-xs font-bold text-center text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                >
                  View Profile
                </Link>
                <Link
                  href={`/customer/book?mechanicId=${mechanic.id}`}
                  className="flex-1 py-2 rounded-xl bg-[#1769E8] hover:bg-[#1358C2] text-white text-xs font-bold text-center shadow-sm transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
