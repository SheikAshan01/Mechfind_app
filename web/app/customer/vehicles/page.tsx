'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  Bike,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Fuel,
  X,
} from 'lucide-react';
import CustomerNav from '@/components/CustomerNav';
import { getVehicles, addVehicle, getCurrentSession, DEMO_CUSTOMER } from '@/lib/api';
import { Vehicle, VehicleType, FuelType } from '@/lib/types';
import { VEHICLE_OPTIONS } from '@/lib/constants';

export default function CustomerVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [session, setSession] = useState(getCurrentSession());

  // Form fields
  const [type, setType] = useState<VehicleType>('car');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2023);
  const [licensePlate, setLicensePlate] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('petrol');

  const loadVehicles = async () => {
    const sess = getCurrentSession();
    setSession(sess);
    const userId = sess.user ? sess.user.id : DEMO_CUSTOMER.id;
    const list = await getVehicles(userId);
    setVehicles(list);
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make.trim() || !model.trim() || !licensePlate.trim()) return;

    const userId = session.user ? session.user.id : DEMO_CUSTOMER.id;
    await addVehicle({
      userId,
      type,
      make,
      model,
      year: Number(year),
      licensePlate,
      fuelType,
      isDefault: vehicles.length === 0,
    });
    setMake('');
    setModel('');
    setLicensePlate('');
    setShowAddForm(false);
    loadVehicles();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col">
      <CustomerNav />

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
              My Garage
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage saved vehicles for automatic breakdown dispatch & service reminders
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-xl bg-[#1769E8] hover:bg-[#1358C2] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>

        {/* Compliance & PUC Reminder Banner */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-[#16A34A] flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#172338] dark:text-[#F8FAFC]">
                PUC & Insurance Reminder (MH 02 EE 4092)
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Pollution test valid for 14 more days. Fast renewal available at nearby verified workshops.
              </div>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-[#16A34A] text-white text-[11px] font-bold">
            14 DAYS LEFT
          </span>
        </div>

        {/* Vehicles List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-[#131D2E] p-5 rounded-2xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1769E8]">
                    {v.type === 'bike' ? <Bike className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                      {v.make} {v.model}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-bold text-[#1769E8]">{v.licensePlate}</span>
                      <span>•</span>
                      <span>{v.year}</span>
                    </div>
                  </div>
                </div>

                {v.isDefault && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1769E8] text-[10px] font-bold">
                    DEFAULT
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-slate-400" />
                  <span className="capitalize">{v.fuelType}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Model {v.year}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link
                  href={`/customer/book?vehicleId=${v.id}`}
                  className="flex-1 py-2 rounded-xl bg-[#1769E8] text-white text-xs font-bold text-center hover:bg-[#1358C2] transition-colors"
                >
                  Book Fix for Vehicle
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Add Vehicle Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form
              onSubmit={handleAdd}
              className="bg-white dark:bg-[#131D2E] p-6 rounded-3xl max-w-md w-full space-y-4 border border-[#E2E8F0] dark:border-[#1E293B] shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                  Register New Vehicle
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Vehicle Type Picker */}
              <div className="grid grid-cols-3 gap-2">
                {(['car', 'bike', 'truck'] as VehicleType[]).map((vt) => (
                  <button
                    key={vt}
                    type="button"
                    onClick={() => setType(vt)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                      type === vt
                        ? 'bg-[#1769E8] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {vt}
                  </button>
                ))}
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Make / Brand
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyundai, Honda, Tata"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Model
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Creta SX, City ZX, Nexon"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      License Plate
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MH 02 EE 4092"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Year
                    </label>
                    <input
                      type="number"
                      required
                      min={2000}
                      max={2026}
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Fuel Type
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as FuelType)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="ev">Electric (EV)</option>
                    <option value="cng">CNG</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1769E8] text-white text-xs font-bold shadow-sm"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
