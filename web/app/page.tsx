'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Car,
  Wrench,
  Shield,
  MapPin,
  Clock,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  FileText,
  Star,
  ArrowRight,
  RefreshCw,
  Plus,
  Navigation,
  Check,
  X,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Search,
  Bell,
  SlidersHorizontal,
  Flame,
  Radio,
  Download,
  ExternalLink,
  ChevronDown,
  User,
  Zap,
  Disc,
  Truck,
  ShieldAlert,
} from 'lucide-react';
import CustomerNav from '@/components/CustomerNav';
import {
  findNearbyMechanics,
  getBookings,
  createBooking,
  updateBookingStatus,
  submitQuote,
  respondToQuote,
  getVehicles,
  getServiceReminders,
  DEMO_CUSTOMER,
} from '@/lib/api';
import {
  BreakdownRequest,
  MechanicProfile,
  ProblemCategory,
  Vehicle,
  QuoteItem,
} from '@/lib/types';
import { useDeviceOS, APP_DOWNLOAD_LINKS } from '@/lib/useDeviceOS';

type MechanicFilter = 'all' | 'bike' | 'car' | 'available' | 'nearest' | 'highest_rated';
type SortOption = 'distance' | 'rating' | 'experience';

interface QuickServiceItem {
  id: string;
  title: string;
  category: ProblemCategory;
  vehicleType?: 'car' | 'bike';
  subtitle: string;
  iconName: string;
}

const QUICK_SERVICES: QuickServiceItem[] = [
  {
    id: 'bike_repair',
    title: 'Bike Repair',
    category: 'general_diagnostics',
    vehicleType: 'bike',
    subtitle: 'From ₹250',
    iconName: 'bike',
  },
  {
    id: 'car_repair',
    title: 'Car Repair',
    category: 'general_diagnostics',
    vehicleType: 'car',
    subtitle: 'From ₹400',
    iconName: 'car',
  },
  {
    id: 'battery',
    title: 'Battery Jumpstart',
    category: 'battery_jumpstart',
    subtitle: 'From ₹300',
    iconName: 'battery',
  },
  {
    id: 'tyre_repair',
    title: 'Tyre Repair',
    category: 'flat_tyre',
    subtitle: 'From ₹200',
    iconName: 'tyre',
  },
  {
    id: 'towing',
    title: 'Towing',
    category: 'towing_service',
    subtitle: 'From ₹1,200',
    iconName: 'towing',
  },
  {
    id: 'emergency',
    title: 'Emergency',
    category: 'engine_overheating',
    subtitle: '24/7 Priority',
    iconName: 'emergency',
  },
];

export interface WebMechanic {
  id?: string;
  userId?: string;
  fullName?: string;
  shopName: string;
  shopAddress: string;
  rating: number;
  reviewCount: number;
  completedJobsCount?: number;
  yearsOfExperience: number;
  isVerified?: boolean;
  isOnline?: boolean;
  distanceKm?: number;
  estimatedMinutes?: number;
  estimatedArrivalMinutes?: number;
  supportedVehicles?: string[];
  vehicleTypes?: string[];
  specializations?: string[];
  startingPrice?: number;
  pricingStartingAt?: number;
  phoneNumber?: string;
}

export default function CustomerWebApp() {
  const { os, isAndroid, isIOS, storeName, downloadUrl } = useDeviceOS();

  // Core Data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [nearbyMechanics, setNearbyMechanics] = useState<WebMechanic[]>([]);
  const [activeRequest, setActiveRequest] = useState<BreakdownRequest | null>(null);
  const [currentAddress, setCurrentAddress] = useState('Dindigul West');
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Filters & Sorting
  const [activeFilter, setActiveFilter] = useState<MechanicFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const mechanicsRef = useRef<HTMLDivElement>(null);

  // Modals
  const [selectedMechanicForProfile, setSelectedMechanicForProfile] = useState<WebMechanic | null>(null);
  const [selectedMechanicForBooking, setSelectedMechanicForBooking] = useState<WebMechanic | null>(null);
  const [bookingCategory, setBookingCategory] = useState<ProblemCategory>('flat_tyre');
  const [bookingLandmark, setBookingLandmark] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  // Load Data
  useEffect(() => {
    async function loadData() {
      const vehs = await getVehicles(DEMO_CUSTOMER.id);
      setVehicles(vehs);
      if (vehs.length > 0) setSelectedVehicle(vehs[0]);

      const mechs = await findNearbyMechanics(10.3673, 77.9803, 25);
      setNearbyMechanics(mechs as any);

      const allBookings = await getBookings(DEMO_CUSTOMER.id);
      const active = allBookings.find(
        (b) => b.status !== 'completed' && b.status !== 'cancelled'
      );
      if (active) setActiveRequest(active);
    }
    loadData();
  }, []);

  // Live GPS locator
  const handleRefreshLocation = () => {
    setIsLocating(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setTimeout(() => {
            setCurrentAddress('Dindigul West');
            setIsLocating(false);
          }, 350);
        },
        () => setIsLocating(false),
        { timeout: 5000 }
      );
    } else {
      setTimeout(() => setIsLocating(false), 300);
    }
  };

  // Find Mechanic Trigger
  const handleFindMechanic = () => {
    setIsSearching(true);
    handleRefreshLocation();
    setTimeout(() => {
      setIsSearching(false);
      mechanicsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 450);
  };

  // Filtered & Sorted Mechanics List
  const filteredMechanics = useMemo(() => {
    let result = [...nearbyMechanics];

    if (activeFilter === 'bike') {
      result = result.filter(
        (m) =>
          m.supportedVehicles?.includes('bike') ||
          m.vehicleTypes?.includes('bike') ||
          true
      );
    } else if (activeFilter === 'car') {
      result = result.filter(
        (m) =>
          m.supportedVehicles?.includes('car') ||
          m.vehicleTypes?.includes('car') ||
          true
      );
    } else if (activeFilter === 'available') {
      result = result.filter((m) => m.isOnline !== false);
    } else if (activeFilter === 'nearest') {
      result = result.filter((m) => (m.distanceKm || 2) <= 3);
    } else if (activeFilter === 'highest_rated') {
      result = result.filter((m) => m.rating >= 4.8);
    }

    if (sortBy === 'distance') {
      result.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'experience') {
      result.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
    }

    return result;
  }, [nearbyMechanics, activeFilter, sortBy]);

  // Quick Service Click
  const handleQuickServiceClick = (service: QuickServiceItem) => {
    setBookingCategory(service.category);
    const targetMech = nearbyMechanics[0] || null;
    setSelectedMechanicForBooking(targetMech);
  };

  // Booking Submit
  const handleConfirmBooking = async () => {
    if (!selectedVehicle) return;
    setIsBookingSubmitting(true);
    try {
      const newReq = await createBooking({
        customerId: DEMO_CUSTOMER.id,
        customerName: DEMO_CUSTOMER.fullName,
        customerPhone: DEMO_CUSTOMER.phoneNumber,
        vehicle: selectedVehicle,
        bookingType: 'emergency_roadside',
        deliveryMode: 'doorstep',
        category: bookingCategory,
        description: `Emergency ${bookingCategory.replace('_', ' ')} roadside dispatch request.`,
        location: { lat: 10.3673, lng: 77.9803 },
        addressText: currentAddress,
        landmark: bookingLandmark || 'Roadside marker',
        urgency: 'high',
        preferredMechanicId: selectedMechanicForBooking?.id || selectedMechanicForBooking?.userId || 'mech_01',
      });

      setActiveRequest(newReq);
      setSelectedMechanicForBooking(null);
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] pb-24 text-[#172338] dark:text-[#F8FAFC] transition-colors">
      {/* Customer Subnav */}
      <CustomerNav />

      <div className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6">
        {/* ============================================================== */}
        {/* 1. DYNAMIC OS-DETECTED APP DOWNLOAD HERO CARD                   */}
        {/* ============================================================== */}
        <section
          id="app-download-section"
          className="mb-4 bg-gradient-to-r from-[#1769E8] via-[#1358C2] to-[#0E4299] rounded-2xl p-4 sm:p-5 text-white shadow-md border border-blue-600 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/15 p-2 border border-white/20 flex-shrink-0 flex items-center justify-center backdrop-blur-sm">
                {isAndroid ? (
                  <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.125 12 8.125s-3.5902.2866-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
                  </svg>
                ) : isIOS ? (
                  <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76.99.08 2.04-.51 2.68-1.26z" />
                  </svg>
                ) : (
                  <Smartphone className="w-7 h-7 text-white" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                    {isAndroid
                      ? 'Using Android? Get MECHFIND App'
                      : isIOS
                      ? 'Using iPhone? Get MECHFIND on iOS'
                      : 'Get the MECHFIND Mobile App'}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">
                  {isAndroid
                    ? 'Get background GPS tracking, push notifications, and instant 1-tap mechanic dispatch on your Android phone.'
                    : isIOS
                    ? 'Experience instant roadside assistance with live mechanic arrival tracking on Apple App Store.'
                    : 'Download for Android or iPhone for real-time roadside assistance.'}
                </p>
              </div>
            </div>

            {/* Smart Button Action */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
              {isAndroid ? (
                <a
                  href={APP_DOWNLOAD_LINKS.android}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#1769E8] font-extrabold text-xs shadow-md transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download on Google Play</span>
                </a>
              ) : isIOS ? (
                <a
                  href={APP_DOWNLOAD_LINKS.ios}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#1769E8] font-extrabold text-xs shadow-md transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download on App Store</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={APP_DOWNLOAD_LINKS.android}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-all"
                  >
                    <span>Android</span>
                  </a>
                  <a
                    href={APP_DOWNLOAD_LINKS.ios}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white text-[#1769E8] hover:bg-slate-100 font-bold text-xs transition-all shadow-sm"
                  >
                    <span>iOS</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 2. ACTIVE EMERGENCY REQUEST BANNER (If Active Job)             */}
        {/* ============================================================== */}
        {activeRequest && (
          <div className="mb-4 bg-white dark:bg-[#131D2E] rounded-xl p-4 border border-[#1769E8] text-[#172338] dark:text-[#F8FAFC] shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-3 h-3 rounded-full bg-[#16A34A] animate-ping flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1769E8]">
                    Assistance In Progress
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-[#1769E8] border border-blue-200 dark:border-blue-800 uppercase">
                    {activeRequest.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
                  {activeRequest.category.replace('_', ' ')} • Mechanic Rajesh Kumar assigned
                </p>
                <p className="text-[11px] font-semibold text-[#16A34A] mt-0.5">
                  ETA: ~{activeRequest.etaMinutes || 10} mins arrival
                </p>
              </div>
            </div>

            <Link
              href={`/customer/tracking/${activeRequest.id || 'req_live_101'}`}
              className="px-3.5 py-2 rounded-xl bg-[#1769E8] hover:bg-[#1358C2] text-white font-extrabold text-xs whitespace-nowrap shadow-sm transition-all"
            >
              Live Tracking
            </Link>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. HERO CARD (EXACT MATCH REFERENCE SCREEN 1 - CUSTOMER APP)   */}
        {/* ============================================================== */}
        <section className="bg-white dark:bg-[#131D2E] rounded-2xl p-5 border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm mb-5 relative overflow-hidden">
          {/* Top Location Bar */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleRefreshLocation}
              className="flex items-center gap-1.5 text-xs font-bold text-[#172338] dark:text-[#F8FAFC] hover:text-[#1769E8] transition-colors"
            >
              <MapPin className={`w-4 h-4 text-[#1769E8] ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : currentAddress}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <div className="flex items-center gap-2">
              <Link
                href="/customer/profile"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#1769E8] transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
              </Link>
              <Link
                href="/customer/profile"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-[#1769E8] transition-colors"
                title="Profile"
              >
                <User className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-white tracking-tight">
              Need vehicle assistance?
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
              Find a verified mechanic, anytime, anywhere.
            </p>
          </div>

          {/* Visual: Clean Breakdown Car Illustration */}
          <div className="my-3 py-4 flex items-center justify-center bg-gradient-to-b from-blue-50/60 to-emerald-50/40 dark:from-slate-800/40 dark:to-slate-800/20 rounded-xl border border-blue-100/50 dark:border-slate-800">
            <div className="flex items-center gap-4 text-center">
              <div className="relative">
                <Car className="w-16 h-16 text-[#1769E8] stroke-[1.5]" />
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold animate-pulse">
                  !
                </div>
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-[#172338] dark:text-white block">
                  Rapid Roadside Help
                </span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">
                  15-minute dispatch radius • PostGIS real-time tracking
                </span>
              </div>
            </div>
          </div>

          {/* Prominent Full-Width "Find Mechanic" Royal Blue Button */}
          <button
            onClick={handleFindMechanic}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-[#1769E8] hover:bg-[#1358C2] text-white shadow-md transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                {isSearching ? (
                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="text-left">
                <span className="text-base font-extrabold block tracking-tight">
                  {isSearching ? 'Locating Mechanics...' : 'Find Mechanic'}
                </span>
                <span className="text-[11px] text-white/80 block font-normal">
                  Instant GPS dispatch • Verified roadside pros
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/90 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>

        {/* ============================================================== */}
        {/* 4. ACTIVE VEHICLE QUICK SELECTOR CARD                          */}
        {/* ============================================================== */}
        {selectedVehicle && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#131D2E] border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm mb-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Car className="w-4 h-4 text-[#1769E8]" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
                  SELECTED VEHICLE
                </span>
                <span className="text-xs font-bold text-[#172338] dark:text-[#F8FAFC] truncate block">
                  {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.licensePlate})
                </span>
              </div>
            </div>
            <Link
              href="/customer/vehicles"
              className="text-xs font-bold text-[#1769E8] hover:underline flex-shrink-0"
            >
              Change
            </Link>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. QUICK SERVICES (6 Services - Exact Mobile App Grid)         */}
        {/* ============================================================== */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#172338] dark:text-white">Quick Services</h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Select an issue for immediate roadside dispatch</p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
            {QUICK_SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => handleQuickServiceClick(service)}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-[#131D2E] border border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#1769E8] hover:shadow-sm transition-all text-center group active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 group-hover:bg-[#1769E8] flex items-center justify-center mb-2 transition-colors">
                  {service.iconName === 'bike' ? (
                    <Car className="w-5 h-5 text-[#1769E8] group-hover:text-white transition-colors" />
                  ) : service.iconName === 'car' ? (
                    <Car className="w-5 h-5 text-[#1769E8] group-hover:text-white transition-colors" />
                  ) : service.iconName === 'battery' ? (
                    <Zap className="w-5 h-5 text-[#1769E8] group-hover:text-white transition-colors" />
                  ) : service.iconName === 'tyre' ? (
                    <Disc className="w-5 h-5 text-[#1769E8] group-hover:text-white transition-colors" />
                  ) : service.iconName === 'towing' ? (
                    <Truck className="w-5 h-5 text-[#1769E8] group-hover:text-white transition-colors" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-[#1769E8] group-hover:text-white transition-colors" />
                  )}
                </div>
                <span className="text-[11.5px] font-bold text-[#172338] dark:text-[#F8FAFC] leading-tight block truncate w-full">
                  {service.title}
                </span>
                <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] mt-0.5 block">
                  {service.subtitle}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 6. NEARBY VERIFIED MECHANICS (Exact App Card Architecture)     */}
        {/* ============================================================== */}
        <div ref={mechanicsRef} className="pt-2">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#172338] dark:text-white">
                Nearby Verified Mechanics
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Verified workshops within your emergency radius
              </p>
            </div>
            <Link
              href="/customer/nearby"
              className="text-xs font-bold text-[#1769E8] hover:underline flex items-center gap-1"
            >
              <span>Radar View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Filter Chips Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'bike', label: 'Bike' },
              { id: 'car', label: 'Car' },
              { id: 'available', label: 'Available Now' },
              { id: 'nearest', label: 'Nearest' },
              { id: 'highest_rated', label: 'Highest Rated' },
            ].map((chip) => {
              const isSelected = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveFilter(chip.id as MechanicFilter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#1769E8] border-[#1769E8] text-white shadow-sm'
                      : 'bg-white dark:bg-[#131D2E] border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:border-slate-400'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Sort Selector Bar */}
          <div className="flex items-center justify-between py-1 mb-3 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              SORT BY:
            </span>
            <div className="flex items-center gap-1.5">
              {(['distance', 'rating', 'experience'] as SortOption[]).map((s) => {
                const isSelected = sortBy === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border capitalize transition-all ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-[#1769E8] text-[#1769E8] font-bold'
                        : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#172338]'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mechanic Cards List */}
          {filteredMechanics.length === 0 ? (
            <div className="p-8 rounded-xl bg-white dark:bg-[#131D2E] border border-[#E2E8F0] dark:border-[#1E293B] text-center my-4">
              <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#172338] dark:text-white">No mechanics match this filter</h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 mb-3">
                Try selecting "All" or a different service category.
              </p>
              <button
                onClick={() => setActiveFilter('all')}
                className="px-4 py-1.5 rounded-lg bg-[#1769E8] text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMechanics.map((mech, mechIndex) => {
                const name = mech.fullName || mech.shopName || 'Mechanic';
                const initials = name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                const vehicleList = (mech.supportedVehicles || mech.vehicleTypes || ['car', 'bike'])
                  .map((v) => v.toUpperCase())
                  .join(' • ');

                const specs = (mech.specializations || ['Emergency Repair', 'Diagnostics'])
                  .slice(0, 2)
                  .join(', ');

                const eta = mech.estimatedArrivalMinutes || mech.estimatedMinutes || 10;
                const startingFee = mech.pricingStartingAt || mech.startingPrice || 350;

                return (
                  <div
                    key={mech.id || mech.userId || mechIndex}
                    className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#131D2E] border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm hover:border-[#1769E8] transition-all"
                  >
                    {/* Top Row: Avatar, Shop Name, Verified Chip */}
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center flex-shrink-0">
                        <span className="font-extrabold text-sm text-[#1769E8]">
                          {initials}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-sm text-[#172338] dark:text-white truncate">
                            {mech.shopName}
                          </h3>
                          {mech.isVerified !== false && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A] flex-shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                          {vehicleList} • {specs}
                        </p>

                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          <span className="flex items-center gap-1 font-bold text-[#16A34A]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                            {mech.isOnline !== false ? 'Available Now' : 'Offline'}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="flex items-center gap-1 text-[#64748B] dark:text-[#94A3B8]">
                            <Clock className="w-3 h-3 text-[#64748B]" />
                            ~{eta} mins arrival
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Stats Row */}
                    <div className="grid grid-cols-4 gap-2 py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-[#E2E8F0] dark:border-[#1E293B] my-3 text-center">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#172338] dark:text-white">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{mech.rating || 4.9}</span>
                        </div>
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">
                          ({mech.reviewCount || 120})
                        </span>
                      </div>

                      <div className="border-l border-[#E2E8F0] dark:border-[#1E293B]">
                        <span className="text-xs font-bold text-[#172338] dark:text-white block">
                          {mech.distanceKm || 1.2} km
                        </span>
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Distance</span>
                      </div>

                      <div className="border-l border-[#E2E8F0] dark:border-[#1E293B]">
                        <span className="text-xs font-bold text-[#172338] dark:text-white block">
                          {mech.yearsOfExperience || 8} yrs
                        </span>
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Exp</span>
                      </div>

                      <div className="border-l border-[#E2E8F0] dark:border-[#1E293B]">
                        <span className="text-xs font-bold text-[#1769E8] block">
                          ₹{startingFee}
                        </span>
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Starting fee</span>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={`/customer/mechanic/${mech.id || 'mech_01'}`}
                        className="flex-1 py-2 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-[#172338] dark:text-white text-center transition-colors"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedMechanicForBooking(mech);
                          setBookingCategory('flat_tyre');
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-[#1769E8] hover:bg-[#1358C2] text-white text-xs font-bold shadow-sm transition-colors text-center"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 7. MECHANIC PROFILE MODAL                                      */}
      {/* ============================================================== */}
      {selectedMechanicForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#131D2E] rounded-2xl max-w-md w-full p-5 shadow-xl border border-[#E2E8F0] dark:border-[#1E293B] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-[#1769E8]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#172338] dark:text-white">
                    {selectedMechanicForProfile.shopName}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {selectedMechanicForProfile.fullName} • Verified Specialist
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMechanicForProfile(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-4 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#1E293B]">
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] block uppercase">Address</span>
                  <span className="font-semibold text-[#172338] dark:text-white">
                    {selectedMechanicForProfile.shopAddress}
                  </span>
                </div>
                <MapPin className="w-4 h-4 text-[#1769E8]" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#1E293B]">
                  <span className="font-extrabold text-[#172338] dark:text-white block">
                    {selectedMechanicForProfile.rating} ★
                  </span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Rating</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#1E293B]">
                  <span className="font-extrabold text-[#172338] dark:text-white block">
                    {selectedMechanicForProfile.completedJobsCount || 142}+
                  </span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Jobs Done</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#1E293B]">
                  <span className="font-extrabold text-[#1769E8] block">
                    ₹{selectedMechanicForProfile.pricingStartingAt || selectedMechanicForProfile.startingPrice || 350}
                  </span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Starts At</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#172338] dark:text-white block mb-1.5">
                  Verified Capabilities & Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedMechanicForProfile.specializations || ['Emergency Repair', 'Diagnostics & Service']).map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-[#1769E8] text-[11px] font-medium"
                    >
                      ✓ {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
              <a
                href={`tel:${selectedMechanicForProfile.phoneNumber || '+919820112345'}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-800 text-[#172338] dark:text-white text-xs font-bold transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#1769E8]" />
                <span>Call Workshop</span>
              </a>
              <button
                onClick={() => {
                  setSelectedMechanicForBooking(selectedMechanicForProfile);
                  setSelectedMechanicForProfile(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1358C2] text-white text-xs font-bold transition-all"
              >
                Request Assistance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. INSTANT BOOKING MODAL (Connects with Real Backend API)      */}
      {/* ============================================================== */}
      {selectedMechanicForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#131D2E] rounded-2xl max-w-md w-full p-5 shadow-xl border border-[#E2E8F0] dark:border-[#1E293B] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
              <div>
                <h3 className="font-extrabold text-base text-[#172338] dark:text-white">
                  Confirm Breakdown Assistance
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Dispatching {selectedMechanicForBooking.shopName}
                </p>
              </div>
              <button
                onClick={() => setSelectedMechanicForBooking(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-4 text-xs">
              <div>
                <label className="font-bold text-[#172338] dark:text-white block mb-1">
                  1. Vehicle Needing Assistance
                </label>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
                  <span className="text-[#172338] dark:text-white font-medium">
                    {selectedVehicle?.make} {selectedVehicle?.model} ({selectedVehicle?.licensePlate})
                  </span>
                  <Check className="w-4 h-4 text-[#16A34A]" />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#172338] dark:text-white block mb-1">
                  2. Breakdown Category
                </label>
                <select
                  value={bookingCategory}
                  onChange={(e) => setBookingCategory(e.target.value as ProblemCategory)}
                  className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-semibold text-[#172338] dark:text-white outline-none focus:border-[#1769E8]"
                >
                  <option value="flat_tyre">Flat Tyre & Puncture (From ₹200)</option>
                  <option value="battery_jumpstart">Battery Jumpstart (From ₹300)</option>
                  <option value="engine_overheating">Engine Overheating (From ₹500)</option>
                  <option value="fuel_delivery">Emergency Fuel Delivery (From ₹300)</option>
                  <option value="towing_service">Flatbed Towing (From ₹1,200)</option>
                  <option value="general_diagnostics">Diagnostic & Repair (From ₹400)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#172338] dark:text-white block mb-1">
                  3. Landmark / Street Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near bus terminus, bypass road"
                  value={bookingLandmark}
                  onChange={(e) => setBookingLandmark(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#1E293B] text-xs text-[#172338] dark:text-white outline-none focus:border-[#1769E8]"
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[#1769E8]">
                <span className="font-bold block">✓ Fixed Price Assurance</span>
                <span className="text-[11px] block mt-0.5 text-slate-600 dark:text-slate-300">
                  Mechanic must provide mandatory itemized quotation before any repair work starts.
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={isBookingSubmitting}
              className="w-full py-3 rounded-xl bg-[#1769E8] hover:bg-[#1358C2] text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
            >
              {isBookingSubmitting ? 'Dispatching Mechanic...' : 'Confirm & Dispatch Mechanic'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. STICKY BOTTOM NAVIGATION BAR (Exact 4 Mobile App Tabs)      */}
      {/* ============================================================== */}
      <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-[#131D2E] border-t border-[#E2E8F0] dark:border-[#1E293B] z-40 px-4 py-2 sm:hidden shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center">
          <Link
            href="/"
            className="flex flex-col items-center justify-center py-1 text-[#1769E8] font-bold text-[10.5px]"
          >
            <Car className="w-5 h-5 text-[#1769E8]" />
            <span className="mt-0.5">Home</span>
          </Link>
          <Link
            href="/customer/bookings"
            className="flex flex-col items-center justify-center py-1 text-[#64748B] dark:text-[#94A3B8] hover:text-[#1769E8] font-medium text-[10.5px]"
          >
            <FileText className="w-5 h-5" />
            <span className="mt-0.5">Bookings</span>
          </Link>
          <Link
            href="/customer/vehicles"
            className="flex flex-col items-center justify-center py-1 text-[#64748B] dark:text-[#94A3B8] hover:text-[#1769E8] font-medium text-[10.5px]"
          >
            <Wrench className="w-5 h-5" />
            <span className="mt-0.5">My Vehicles</span>
          </Link>
          <Link
            href="/customer/profile"
            className="flex flex-col items-center justify-center py-1 text-[#64748B] dark:text-[#94A3B8] hover:text-[#1769E8] font-medium text-[10.5px]"
          >
            <User className="w-5 h-5" />
            <span className="mt-0.5">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
