'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  Wrench,
  Car,
  Bike,
  Filter,
  Navigation,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Layers,
} from 'lucide-react';
import CustomerNav from '@/components/CustomerNav';
import InteractiveMap from '@/components/InteractiveMap';
import { findNearbyMechanics } from '@/lib/api';
import { INITIAL_MECHANICS } from '@/lib/constants';
import { MechanicProfile, VehicleType } from '@/lib/types';

export default function FindMechanicsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'car' | 'bike'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>('mech_01');
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');
  const [rawMechanics, setRawMechanics] = useState<any[]>(() =>
    INITIAL_MECHANICS.map((m, idx) => ({
      ...m,
      distanceKm: idx === 0 ? 1.2 : idx === 1 ? 2.4 : idx === 2 ? 3.8 : 5.1,
      estimatedMinutes: idx === 0 ? 10 : idx === 1 ? 18 : idx === 2 ? 24 : 30,
      pricingStartingAt: idx === 0 ? 350 : idx === 1 ? 400 : 300,
    }))
  );

  // Customer Coordinates (Dindigul / Mumbai fallback)
  const customerCoords = { latitude: 19.076, longitude: 72.8777, label: 'Current GPS Location' };

  useEffect(() => {
    async function load() {
      const data = await findNearbyMechanics(customerCoords.latitude, customerCoords.longitude, 25);
      if (data && data.length > 0) {
        setRawMechanics(data);
      }
    }
    load();
  }, []);

  // Filter & sort mechanics
  const mechanics = useMemo(() => {
    let list = [...rawMechanics];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.shopName?.toLowerCase().includes(q) ||
          m.shopAddress?.toLowerCase().includes(q) ||
          m.specializations?.some((s: string) => s.toLowerCase().includes(q))
      );
    }

    if (vehicleFilter !== 'all') {
      list = list.filter((m) =>
        (m.supportedVehicles || m.vehicleTypes || []).includes(vehicleFilter as VehicleType)
      );
    }

    if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price') {
      list.sort((a, b) => (a.pricingStartingAt || a.startingPrice || 350) - (b.pricingStartingAt || b.startingPrice || 350));
    } else {
      list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return list;
  }, [rawMechanics, searchQuery, vehicleFilter, sortBy]);

  const mapMechanicMarkers = mechanics.map((m) => ({
    id: m.id || m.userId,
    name: m.shopName,
    rating: m.rating,
    distanceKm: m.distanceKm || 1.5,
    pricingStartingAt: m.pricingStartingAt || m.startingPrice || 350,
    latitude: m.lat || m.latitude || 19.076,
    longitude: m.lng || m.longitude || 72.8777,
    isOnline: m.isOnline,
  }));

  const handleBookMechanic = (mechanicId: string) => {
    router.push(`/customer/book?mechanicId=${mechanicId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col">
      <CustomerNav />

      {/* Main Split Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col">
        {/* Mobile View Switcher (List vs Map) */}
        <div className="lg:hidden flex items-center p-1 bg-slate-200 dark:bg-slate-800 rounded-xl mb-3">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'list'
                ? 'bg-white dark:bg-[#1E293B] text-[#1769E8] shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            List View ({mechanics.length})
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'map'
                ? 'bg-white dark:bg-[#1E293B] text-[#1769E8] shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Live Map
          </button>
        </div>

        {/* Desktop Split Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[680px]">
          {/* LEFT COLUMN: Search, Filters & Mechanic Cards */}
          <div
            className={`lg:col-span-6 xl:col-span-5 flex flex-col h-full ${
              mobileTab === 'map' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Search Input Bar */}
            <div className="bg-white dark:bg-[#131D2E] p-3.5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm mb-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search garage name, repair, or landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-xs sm:text-sm text-[#172338] dark:text-[#F8FAFC] focus:outline-none w-full"
                />
              </div>

              {/* Filter Pills Row */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                {/* Vehicle Types */}
                <div className="flex items-center gap-1.5">
                  {(['all', 'car', 'bike'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setVehicleFilter(type)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        vehicleFilter === type
                          ? 'bg-[#1769E8] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {type === 'all' ? 'All' : type === 'car' ? 'Cars' : 'Bikes'}
                    </button>
                  ))}
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400 hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold py-1 px-2 rounded-lg border-none focus:outline-none cursor-pointer"
                  >
                    <option value="distance">Nearest (Distance)</option>
                    <option value="rating">Top Rated (Stars)</option>
                    <option value="price">Lowest Starting Price</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mechanics List (Scrollable) */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {mechanics.length === 0 ? (
                <div className="bg-white dark:bg-[#131D2E] p-8 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] text-center">
                  <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    No mechanics match your filters
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Try broadening your search term or switching vehicle category.
                  </p>
                </div>
              ) : (
                mechanics.map((mechanic) => {
                  const isSelected = selectedMechanicId === mechanic.id;

                  return (
                    <div
                      key={mechanic.id}
                      onClick={() => setSelectedMechanicId(mechanic.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-[#131D2E] ${
                        isSelected
                          ? 'border-[#1769E8] shadow-md ring-1 ring-[#1769E8]'
                          : 'border-[#E2E8F0] dark:border-[#1E293B] hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Workshop Avatar */}
                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1769E8] flex-shrink-0">
                          <Wrench className="w-6 h-6" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC] truncate">
                              {mechanic.shopName}
                            </h3>
                            <span className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex-shrink-0">
                              <CheckCircle className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center gap-1 font-bold text-[#172338] dark:text-[#F8FAFC]">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              {mechanic.rating} ({mechanic.reviewCount})
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#1769E8]" />
                              {mechanic.distanceKm} km
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              ~{mechanic.estimatedArrivalMinutes} mins
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                            {mechanic.shopAddress}
                          </p>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div>
                              <span className="text-[11px] text-slate-400">Starting from</span>
                              <div className="text-sm font-extrabold text-[#1769E8]">
                                ₹{mechanic.pricingStartingAt}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Link
                                href={`/customer/mechanic/${mechanic.id}`}
                                className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                              >
                                View Profile
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookMechanic(mechanic.id);
                                }}
                                className="px-4 py-1.5 rounded-xl bg-[#1769E8] hover:bg-[#1358C2] text-white text-xs font-bold shadow-sm transition-colors"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Live Map */}
          <div
            className={`lg:col-span-6 xl:col-span-7 h-[420px] lg:h-full rounded-2xl overflow-hidden ${
              mobileTab === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            <InteractiveMap
              userLocation={customerCoords}
              mechanics={mapMechanicMarkers}
              selectedMechanicId={selectedMechanicId}
              onSelectMechanic={(id) => setSelectedMechanicId(id)}
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
