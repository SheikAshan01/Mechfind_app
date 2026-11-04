'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Navigation,
  Wrench,
  Clock,
  Star,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  PhoneCall,
  Loader2,
  Calendar,
  SlidersHorizontal,
  Map as MapIcon,
  List,
  Sparkles,
  Building,
  Home,
} from 'lucide-react';
import {
  findNearbyMechanics,
  createBreakdownRequest,
  getVehicles,
  DEMO_CUSTOMER,
  MechanicFilterOptions,
} from '@/lib/api';
import { SERVICE_CATEGORIES, VEHICLE_OPTIONS } from '@/lib/constants';
import {
  BookingType,
  ExperienceTier,
  ProblemCategory,
  ServiceDeliveryMode,
  VehicleType,
} from '@/lib/types';

export default function LocationHero() {
  const router = useRouter();

  // Coordinates (Default: Mumbai Bandra coordinates)
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 19.0596,
    lng: 72.8295,
  });
  const [addressText, setAddressText] = useState(
    'Linking Road, Bandra West, Mumbai, Maharashtra'
  );
  const [landmark, setLandmark] = useState('Near Bandra Police Station');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<string | null>('High Precision GPS');

  // Booking Type & Delivery Mode
  const [bookingType, setBookingType] = useState<BookingType>('emergency_roadside');
  const [deliveryMode, setDeliveryMode] = useState<ServiceDeliveryMode>('doorstep');
  const [scheduledDate, setScheduledDate] = useState('2026-11-04');
  const [scheduledTime, setScheduledTime] = useState('10:00');

  // Vehicle & Issue Selection
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>('car');
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory>('flat_tyre');
  const [issueDescription, setIssueDescription] = useState('');

  // Filters & Sorting
  const [minRating, setMinRating] = useState<number>(0);
  const [experienceTier, setExperienceTier] = useState<ExperienceTier | ''>('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'experience' | 'price'>('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Mechanics results
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [isLoadingMechanics, setIsLoadingMechanics] = useState(true);

  // Booking Modal
  const [bookingMechanic, setBookingMechanic] = useState<any | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');
  const [vehiclePlate, setVehiclePlate] = useState('MH 02 EE 4092');

  // Trigger geolocation on browser
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setGpsAccuracy(`GPS Locked (±${Math.round(accuracy)}m)`);
        setAddressText(`Detected Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setIsDetectingLocation(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsDetectingLocation(false);
        setGpsAccuracy('Using Default Location (GPS Permission Denied)');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Search mechanics when location, vehicle type or filters change
  useEffect(() => {
    let active = true;
    setIsLoadingMechanics(true);

    const filterOptions: MechanicFilterOptions = {
      radiusKm: 30,
      minRating: minRating || undefined,
      experienceTier: experienceTier || undefined,
      deliveryMode,
      sortBy,
    };

    findNearbyMechanics(coords.lat, coords.lng, 30, selectedVehicleType, filterOptions).then((res) => {
      if (active) {
        setMechanics(res);
        setIsLoadingMechanics(false);
      }
    });
    return () => {
      active = false;
    };
  }, [coords.lat, coords.lng, selectedVehicleType, minRating, experienceTier, deliveryMode, sortBy]);

  const selectedCategoryMeta = SERVICE_CATEGORIES.find((c) => c.id === selectedCategory);

  // Confirm booking
  const handleConfirmBooking = async () => {
    setIsSubmittingBooking(true);
    try {
      const vehicles = await getVehicles(DEMO_CUSTOMER.id);
      const vehicle = vehicles[0] || {
        id: 'veh_01',
        userId: DEMO_CUSTOMER.id,
        type: selectedVehicleType,
        make: 'Hyundai',
        model: 'Creta',
        year: 2022,
        licensePlate: vehiclePlate,
        fuelType: 'petrol',
        isDefault: true,
      };

      const scheduledAtString =
        bookingType === 'scheduled' ? `${scheduledDate}T${scheduledTime}:00` : undefined;

      const req = await createBreakdownRequest({
        customerId: DEMO_CUSTOMER.id,
        customerName: DEMO_CUSTOMER.fullName,
        customerPhone: contactPhone,
        vehicle,
        category: selectedCategory,
        description:
          issueDescription ||
          `${selectedCategoryMeta?.name} (${deliveryMode.replace('_', ' ')}) needed near ${addressText}`,
        location: coords,
        addressText,
        landmark,
        urgency: bookingType === 'emergency_roadside' ? 'critical' : 'high',
        bookingType,
        deliveryMode,
        scheduledAt: scheduledAtString,
        preferredMechanicId: bookingMechanic?.userId,
      });

      router.push(`/customer/dashboard?activeJob=${req.id}`);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Booking could not be created. Please try again.');
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="relative bg-[#080808] text-white pt-6 pb-20 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-[#FFD400]/10 via-[#FFD400]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Mobility-First Hero Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1C1C1C] border border-[#FFD400]/30 text-xs font-bold text-[#FFD400]">
            <span className="w-2 h-2 rounded-full bg-[#FFD400] animate-pulse" />
            Live Marketplace • 12,500+ Verified Garages & Mechanics
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Need a Mechanic?{' '}
            <span className="text-[#FFD400] underline decoration-[#FFD400]/40">
              Instant Dispatch
            </span>{' '}
            or Schedule Ahead.
          </h1>
          <p className="text-sm sm:text-base text-gray-400 font-normal max-w-2xl mx-auto">
            Book trusted roadside breakdown assistance, doorstep mobile puncture/battery service,
            or drive into a certified workshop with upfront guaranteed rates.
          </p>
        </div>

        {/* Discovery & Booking Console */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
          {/* Top Toggles: Booking Type & Delivery Mode */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-[#222222]">
            {/* Booking Type Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-[#1A1A1A] border border-[#2C2C2C]">
              <button
                type="button"
                onClick={() => setBookingType('emergency_roadside')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  bookingType === 'emergency_roadside'
                    ? 'bg-[#FFD400] text-black shadow-brand'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                Emergency / Roadside
              </button>
              <button
                type="button"
                onClick={() => setBookingType('instant')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  bookingType === 'instant'
                    ? 'bg-[#FFD400] text-black shadow-brand'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Instant Fix (15m)
              </button>
              <button
                type="button"
                onClick={() => setBookingType('scheduled')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  bookingType === 'scheduled'
                    ? 'bg-[#FFD400] text-black shadow-brand'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Schedule Later
              </button>
            </div>

            {/* Delivery Mode Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-[#1A1A1A] border border-[#2C2C2C]">
              <button
                type="button"
                onClick={() => setDeliveryMode('doorstep')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  deliveryMode === 'doorstep'
                    ? 'bg-white text-black font-extrabold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-[#FFD400]" />
                Doorstep / Breakdown Spot
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode('workshop_visit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  deliveryMode === 'workshop_visit'
                    ? 'bg-white text-black font-extrabold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-blue-400" />
                Visit Workshop
              </button>
            </div>
          </div>

          {/* Schedule Date/Time selector if scheduled is chosen */}
          {bookingType === 'scheduled' && (
            <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#FFD400]/40 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
              <span className="text-xs font-bold text-[#FFD400] flex items-center gap-1.5 whitespace-nowrap">
                <Calendar className="w-4 h-4" /> Pick Date & Time:
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="bg-[#242424] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="bg-[#242424] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* 1. Vehicle Selection Bar */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              1. Select Vehicle Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {VEHICLE_OPTIONS.map((v) => {
                const isSelected = selectedVehicleType === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicleType(v.id)}
                    className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl border text-sm font-bold transition-all ${
                      isSelected
                        ? 'bg-[#FFD400] text-black border-[#FFD400] shadow-brand scale-[1.02]'
                        : 'bg-[#1A1A1A] text-gray-300 border-[#2A2A2A] hover:border-gray-600 hover:bg-[#202020]'
                    }`}
                  >
                    <span className="text-xl">{v.icon}</span>
                    <span className="whitespace-nowrap">{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Location & Landmark Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                2. Breakdown / Service Location
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-5 h-5 text-[#FFD400] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="Enter current highway, street, or locality..."
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl pl-10 pr-28 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD400]"
                />
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="absolute right-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFD400] hover:bg-[#E5BE00] text-black text-xs font-bold transition-all active:scale-95 disabled:opacity-60"
                >
                  {isDetectingLocation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Locating...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      Auto Detect
                    </>
                  )}
                </button>
              </div>
              {gpsAccuracy && (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pl-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{gpsAccuracy}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Nearest Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Petrol Pump"
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD400]"
              />
            </div>
          </div>

          {/* 3. Issue / Service Category Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              3. Select Breakdown Service or Package
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SERVICE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#FFD400]/15 border-[#FFD400] text-white shadow-sm ring-1 ring-[#FFD400]'
                        : 'bg-[#181818] border-[#2B2B2B] text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white truncate pr-1">
                        {cat.name}
                      </span>
                      <span className="text-xs font-extrabold text-[#FFD400]">
                        ₹{cat.estimatedPrice}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 line-clamp-1">
                      ~{cat.estimatedTimeMin} min turnaround
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Issue Note */}
          <div>
            <input
              type="text"
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Optional: Add specific symptoms or voice-note description..."
              className="w-full bg-[#181818] border border-[#2B2B2B] rounded-xl px-4 py-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#FFD400]"
            />
          </div>

          {/* 4. Filter & Sorting Controls Bar */}
          <div className="pt-2 border-t border-[#222222] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  showFilters
                    ? 'bg-[#FFD400] text-black border-[#FFD400]'
                    : 'bg-[#1C1C1C] text-gray-300 border-gray-700 hover:border-gray-500'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters & Sorting</span>
              </button>

              {/* Quick sort pills */}
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-[#1C1C1C] border border-gray-700 text-xs font-bold rounded-lg px-2.5 py-1.5 text-gray-300 focus:outline-none focus:border-[#FFD400]"
              >
                <option value="distance">Sort: Nearest First</option>
                <option value="rating">Sort: Top Rated (4.8+)</option>
                <option value="experience">Sort: Most Experienced</option>
                <option value="price">Sort: Lowest Price</option>
              </select>
            </div>

            {/* List vs Map View Toggle */}
            <div className="inline-flex p-1 rounded-lg bg-[#1C1C1C] border border-gray-800">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded text-xs ${
                  viewMode === 'list' ? 'bg-[#FFD400] text-black font-bold' : 'text-gray-400'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded text-xs ${
                  viewMode === 'map' ? 'bg-[#FFD400] text-black font-bold' : 'text-gray-400'
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expandable Filter Drawer */}
          {showFilters && (
            <div className="p-4 rounded-xl bg-[#181818] border border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in text-xs">
              <div>
                <label className="block font-bold text-gray-400 mb-1">Minimum Customer Rating</label>
                <div className="flex gap-2">
                  {[0, 4.0, 4.5, 4.8].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setMinRating(r)}
                      className={`px-2.5 py-1 rounded-lg border font-bold ${
                        minRating === r
                          ? 'bg-[#FFD400] text-black border-[#FFD400]'
                          : 'bg-[#222222] text-gray-400 border-gray-700'
                      }`}
                    >
                      {r === 0 ? 'All' : `${r}★+`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-400 mb-1">Mechanic Experience</label>
                <div className="flex gap-2">
                  {[
                    { id: '', label: 'All' },
                    { id: 'experienced', label: '5+ Yrs' },
                    { id: 'expert', label: 'Certified Expert' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setExperienceTier(tier.id as any)}
                      className={`px-2.5 py-1 rounded-lg border font-bold ${
                        experienceTier === tier.id
                          ? 'bg-[#FFD400] text-black border-[#FFD400]'
                          : 'bg-[#222222] text-gray-400 border-gray-700'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-400 mb-1">Active Coverage</label>
                <div className="text-gray-300 font-medium pt-1">
                  Showing 30 km radius via PostGIS
                </div>
              </div>
            </div>
          )}

          {/* 5. Mechanics Matching Results (List or Map View) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#FFD400]" />
                Available Verified Mechanics ({mechanics.length})
              </h3>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live PostGIS Matching Active
              </span>
            </div>

            {isLoadingMechanics ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                <Loader2 className="w-8 h-8 text-[#FFD400] animate-spin" />
                <span className="text-xs font-medium">Scanning nearby workshops via PostGIS...</span>
              </div>
            ) : mechanics.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#1A1A1A] border border-gray-800 text-center">
                <AlertTriangle className="w-8 h-8 text-[#FFD400] mx-auto mb-2" />
                <p className="text-sm font-bold text-white">No mechanics match these exact filters</p>
                <p className="text-xs text-gray-400 mt-1">
                  Try clearing rating or experience filters, or call 1800-MECH-FIND directly.
                </p>
              </div>
            ) : viewMode === 'map' ? (
              /* Map View Representation */
              <div className="h-64 bg-[#181818] border border-gray-800 rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-4 text-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FFD400_1px,transparent_1px)] [background-size:16px_16px]" />
                <MapPin className="w-8 h-8 text-[#FFD400] animate-bounce mb-2" />
                <h4 className="text-sm font-bold text-white">Interactive Spatial Map View</h4>
                <p className="text-xs text-gray-400 max-w-sm mt-1">
                  {mechanics.length} certified mobile technicians pinpointed around {addressText}.
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-3">
                  {mechanics.slice(0, 3).map((m) => (
                    <span
                      key={m.userId}
                      onClick={() => setBookingMechanic(m)}
                      className="px-2.5 py-1 rounded-full bg-black/80 border border-[#FFD400]/40 text-xs font-bold text-[#FFD400] cursor-pointer hover:bg-[#FFD400] hover:text-black transition-colors"
                    >
                      📍 {m.shopName} ({m.distanceKm} km)
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              /* List View Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mechanics.map((mech) => (
                  <div
                    key={mech.userId}
                    className="p-4 rounded-xl bg-[#191919] border border-[#2B2B2B] hover:border-[#FFD400]/60 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-[#FFD400] transition-colors">
                            {mech.shopName}
                          </h4>
                          {mech.isVerified && (
                            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          )}
                          {mech.subscriptionTier === 'premium' && (
                            <span className="text-[10px] bg-[#FFD400]/20 text-[#FFD400] px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Featured
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-extrabold bg-[#FFD400]/15 text-[#FFD400] px-2 py-0.5 rounded-full whitespace-nowrap">
                          {mech.distanceKm} km
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 line-clamp-1 mb-2">
                        {mech.shopAddress}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-gray-300 mb-3">
                        <span className="flex items-center gap-1 font-bold text-yellow-400">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          {mech.rating}
                          <span className="text-gray-500 font-normal">({mech.reviewCount})</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3.5 h-3.5 text-[#FFD400]" />
                          ETA: {mech.estimatedMinutes} mins
                        </span>
                        <span>•</span>
                        <span className="text-gray-400 capitalize">
                          {mech.experienceTier || `${mech.yearsOfExperience} yrs`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
                      <div className="text-xs">
                        <span className="text-gray-400">Standard Rate: </span>
                        <span className="font-extrabold text-[#FFD400]">
                          ₹{selectedCategoryMeta?.estimatedPrice || 350}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBookingMechanic(mech)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#FFD400] hover:bg-[#E5BE00] text-black text-xs font-extrabold flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm"
                      >
                        <span>{bookingType === 'scheduled' ? 'Schedule Fix' : 'Request Now'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Booking Modal */}
      {bookingMechanic && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-gray-800 pb-3">
              <div>
                <span className="text-xs text-[#FFD400] font-bold uppercase tracking-wider">
                  Confirm {bookingType === 'scheduled' ? 'Scheduled Booking' : 'Emergency Dispatch'}
                </span>
                <h3 className="text-lg font-black text-white">
                  Dispatching {bookingMechanic.shopName}
                </h3>
              </div>
              <button
                onClick={() => setBookingMechanic(null)}
                className="text-gray-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* Service & Price Summary */}
            <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Service:</span>
                <span className="font-bold text-white">{selectedCategoryMeta?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mode:</span>
                <span className="font-bold text-white capitalize">
                  {deliveryMode.replace('_', ' ')}
                </span>
              </div>
              {bookingType === 'scheduled' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Scheduled For:</span>
                  <span className="font-bold text-[#FFD400]">
                    {scheduledDate} at {scheduledTime}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Location:</span>
                <span className="font-medium text-gray-200 truncate max-w-[240px]">
                  {addressText}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-800 text-sm">
                <span className="font-bold text-white">Estimated Base Labor:</span>
                <span className="font-extrabold text-[#FFD400]">
                  ₹{selectedCategoryMeta?.estimatedPrice}
                </span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Your Contact Phone (For Mechanic Call)
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-[#1F1F1F] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFD400]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  placeholder="e.g. MH 02 EE 4092"
                  className="w-full bg-[#1F1F1F] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white uppercase focus:outline-none focus:border-[#FFD400]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setBookingMechanic(null)}
                className="w-1/3 py-2.5 rounded-xl border border-gray-700 text-xs font-bold text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isSubmittingBooking}
                className="w-2/3 py-2.5 rounded-xl bg-[#FFD400] hover:bg-[#E5BE00] text-black text-sm font-black flex items-center justify-center gap-2 shadow-brand active:scale-95 disabled:opacity-60"
              >
                {isSubmittingBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Dispatching...
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4" />
                    Confirm & Track Live
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
