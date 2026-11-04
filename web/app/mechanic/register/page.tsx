'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench, ShieldCheck, ArrowRight, Upload, CheckCircle2 } from 'lucide-react';
import { VehicleType } from '@/lib/types';
import { VEHICLE_OPTIONS } from '@/lib/constants';

export default function MechanicRegisterPage() {
  const router = useRouter();

  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [experience, setExperience] = useState(5);
  const [radius, setRadius] = useState(15);
  const [supportedVehicles, setSupportedVehicles] = useState<VehicleType[]>(['car', 'bike']);
  const [loading, setLoading] = useState(false);

  const toggleVehicle = (v: VehicleType) => {
    if (supportedVehicles.includes(v)) {
      setSupportedVehicles(supportedVehicles.filter((x) => x !== v));
    } else {
      setSupportedVehicles([...supportedVehicles, v]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/mechanic/verification?status=submitted');
    }, 800);
  };

  return (
    <div className="py-12 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-white space-y-8">
      <div className="border-b border-[#262626] pb-6">
        <span className="text-xs font-bold text-[#FFD400] uppercase tracking-wider">
          Partner Onboarding
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">
          Workshop & Mechanic Registration
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-2">
          Join India&apos;s fastest growing roadside assistance network. Instant dispatches and daily payouts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#FFD400]" />
            1. Garage & Workshop Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Workshop / Garage Name *
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Apex Speed Garage & Auto Care"
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD400]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Owner / Head Mechanic Full Name *
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD400]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Direct Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98201 12345"
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD400]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Years of Automotive Experience
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD400]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Physical Garage Address *
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop number, street name, landmark, city, pin code..."
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FFD400]"
            />
          </div>
        </div>

        {/* Supported Vehicles & Service Radius */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white">2. Vehicle Coverage & Service Radius</h2>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2">
              Select Vehicle Types You Service
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {VEHICLE_OPTIONS.map((v) => {
                const isSelected = supportedVehicles.includes(v.id);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => toggleVehicle(v.id)}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-[#FFD400] text-black border-[#FFD400] shadow-sm'
                        : 'bg-[#181818] text-gray-400 border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <span>{v.icon}</span>
                    <span>{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-300">
                Service Radius From Garage:
              </label>
              <span className="text-xs font-extrabold text-[#FFD400]">{radius} km</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-[#FFD400]"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>5 km (Local)</span>
              <span>15 km (City Wide)</span>
              <span>30 km (Highway Corridor)</span>
            </div>
          </div>
        </div>

        {/* Verification Documents Uploads */}
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            3. Verification Documents (KYC)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-dashed border-gray-700 rounded-xl p-4 text-center space-y-2 hover:border-[#FFD400] transition-colors cursor-pointer">
              <Upload className="w-6 h-6 text-gray-400 mx-auto" />
              <div className="text-xs font-bold text-white">Government ID (Aadhaar / Voter ID)</div>
              <p className="text-[11px] text-gray-500">PNG, JPG or PDF up to 5MB</p>
            </div>

            <div className="border border-dashed border-gray-700 rounded-xl p-4 text-center space-y-2 hover:border-[#FFD400] transition-colors cursor-pointer">
              <Upload className="w-6 h-6 text-gray-400 mx-auto" />
              <div className="text-xs font-bold text-white">Workshop Photo / Trade License</div>
              <p className="text-[11px] text-gray-500">Shop board photo or GST certificate</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-[#FFD400] text-black font-black text-sm flex items-center justify-center gap-2 shadow-brand hover:bg-[#E5BE00] active:scale-95 transition-transform"
        >
          <span>{loading ? 'Submitting Registration...' : 'Submit Workshop Application'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
