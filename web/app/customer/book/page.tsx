'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Wrench,
  Car,
  Bike,
  MapPin,
  Clock,
  Star,
  CheckCircle,
  Navigation,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import CustomerNav from '@/components/CustomerNav';
import {
  createBreakdownRequest,
  getVehicles,
  getCurrentSession,
  DEMO_CUSTOMER,
} from '@/lib/api';
import { INITIAL_MECHANICS } from '@/lib/constants';
import { ProblemCategory, Vehicle } from '@/lib/types';

interface ServiceOption {
  id: string;
  category: ProblemCategory;
  title: string;
  priceText: string;
  priceAmount: number;
  isOther?: boolean;
}

const SERVICE_OPTIONS: ServiceOption[] = [
  { id: 'opt_bike', category: 'general_diagnostics', title: 'Bike Repair', priceText: 'From ₹250', priceAmount: 250 },
  { id: 'opt_car', category: 'general_diagnostics', title: 'Car Repair', priceText: 'From ₹400', priceAmount: 400 },
  { id: 'opt_battery', category: 'battery_jumpstart', title: 'Battery Jumpstart', priceText: 'From ₹300', priceAmount: 300 },
  { id: 'opt_tyre', category: 'flat_tyre', title: 'Tyre Repair', priceText: 'From ₹200', priceAmount: 200 },
  { id: 'opt_towing', category: 'towing_service', title: 'Towing', priceText: 'From ₹1,200', priceAmount: 1200 },
  { id: 'opt_other', category: 'general_diagnostics', title: 'Other Issue', priceText: 'Tell us your issue', priceAmount: 350, isOther: true },
];

function BookAssistanceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramMechanicId = searchParams.get('mechanicId');
  const paramCategory = searchParams.get('category');

  const selectedMechanic =
    INITIAL_MECHANICS.find((m) => m.id === paramMechanicId || m.userId === paramMechanicId) || INITIAL_MECHANICS[0];

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('veh_01');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => {
    if (paramCategory) {
      const match = SERVICE_OPTIONS.find((s) => s.category === paramCategory);
      if (match) return match.id;
    }
    return 'opt_car'; // Default to Car Repair matching Screen 3
  });

  const [customIssue, setCustomIssue] = useState('');
  const [landmark, setLandmark] = useState('Near roadside marker');
  const [address, setAddress] = useState('SV Road, Near Bandra Station West');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const sess = getCurrentSession();
    const userId = sess.user ? sess.user.id : DEMO_CUSTOMER.id;
    getVehicles(userId).then((list) => {
      setVehicles(list);
      if (list.length > 0) setSelectedVehicleId(list[0].id);
    });
  }, []);

  const handleRefreshLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setAddress(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          setIsLocating(false);
        },
        () => setIsLocating(false),
        { timeout: 5000 }
      );
    }
  };

  const selectedService =
    SERVICE_OPTIONS.find((s) => s.id === selectedServiceId) || SERVICE_OPTIONS[1];

  const handleConfirmBooking = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const activeVehicle =
        vehicles.find((v) => v.id === selectedVehicleId) || {
          id: 'veh_01',
          userId: 'cust_01',
          type: 'car' as const,
          make: 'Hyundai',
          model: 'Creta SX (MH 02 EE 4092)',
          year: 2022,
          licensePlate: 'MH 02 EE 4092',
          fuelType: 'petrol' as const,
          isDefault: true,
          createdAt: new Date().toISOString(),
        };

      const newRequest = await createBreakdownRequest({
        customerId: 'cust_01',
        customerName: 'Arjun Kapoor',
        customerPhone: '+91 98765 43210',
        vehicle: activeVehicle,
        category: selectedService.category,
        description: customIssue || `${selectedService.title} assistance requested`,
        location: {
          lat: 19.076,
          lng: 72.8777,
        },
        addressText: address,
        landmark: landmark || 'Roadside marker',
        urgency: 'high',
        bookingType: 'emergency_roadside',
        deliveryMode: 'doorstep',
        preferredMechanicId: selectedMechanic?.userId || selectedMechanic?.id || 'mech_01',
      });

      setIsSubmitting(false);
      router.push(`/customer/confirmation/${newRequest.id}`);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col">
      <CustomerNav />

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
            Book Assistance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Select service and confirm emergency breakdown dispatch
          </p>
        </div>

        {/* 1. Workshop Card at Top (Matching Mobile Screen 3) */}
        <div className="bg-white dark:bg-[#131D2E] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1769E8] flex-shrink-0">
            <Car className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-[#172338] dark:text-[#F8FAFC] truncate">
                {selectedMechanic.shopName}
              </h3>
              <CheckCircle className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-semibold">{selectedMechanic.rating}</span>
              <span>({selectedMechanic.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* 2. Select Service (Radio Buttons matching Screen 3) */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
            Select Service
          </h2>

          <div className="space-y-2.5">
            {SERVICE_OPTIONS.map((item) => {
              const isSelected = selectedServiceId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedServiceId(item.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-[#131D2E] ${
                    isSelected
                      ? 'border-[#1769E8] ring-1 ring-[#1769E8] shadow-sm'
                      : 'border-[#E2E8F0] dark:border-[#1E293B] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Radio Indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-[#1769E8]' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#1769E8]" />}
                    </div>

                    <span className="text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs sm:text-sm font-semibold ${
                        isSelected ? 'text-[#1769E8]' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.priceText}
                    </span>
                    {item.isOther && <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Issue Notes (if "Other" selected) */}
        {selectedService.isOther && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Describe breakdown issue
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Engine making strange ticking noise and coolant smoking..."
              value={customIssue}
              onChange={(e) => setCustomIssue(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131D2E] text-xs sm:text-sm focus:outline-none focus:border-[#1769E8]"
            />
          </div>
        )}

        {/* 3. Vehicle Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Active Vehicle
            </label>
            <Link
              href="/customer/vehicles"
              className="text-xs font-bold text-[#1769E8] hover:underline"
            >
              + Manage Garage
            </Link>
          </div>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131D2E] text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#1769E8]"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.make} {v.model} ({v.licensePlate}) • {v.fuelType.toUpperCase()}
              </option>
            ))}
            {vehicles.length === 0 && (
              <option value="veh_01">Hyundai Creta SX (MH 02 EE 4092)</option>
            )}
          </select>
        </div>

        {/* 4. Location & Landmark Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Breakdown Coordinates & Landmark
          </label>
          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131D2E]">
            <MapPin className="w-4 h-4 text-[#1769E8] flex-shrink-0" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 bg-transparent border-none text-xs sm:text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={handleRefreshLocation}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#1769E8] hover:bg-slate-200"
              title="GPS Detect"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Nearest Landmark (e.g. Opposite Signal / Petrol Pump)"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#131D2E] text-xs sm:text-sm focus:outline-none"
          />
        </div>

        {/* 5. Bottom Sticky Action Button */}
        <div className="pt-4">
          <button
            onClick={handleConfirmBooking}
            disabled={isSubmitting}
            className="w-full h-13 py-3.5 rounded-2xl bg-[#1769E8] hover:bg-[#1358C2] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Dispatching Mechanic...</span>
            ) : (
              <>
                <span>Confirm Booking • ₹{selectedService.priceAmount}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookAssistancePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading Booking Flow...</div>}>
      <BookAssistanceInner />
    </Suspense>
  );
}
