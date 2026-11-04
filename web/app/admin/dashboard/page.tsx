'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Users,
  Wrench,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Award,
  Layers,
  MapPin,
  FileText,
  Clock,
  Plus,
  RefreshCw,
  LogOut,
  Sliders,
  Check,
  X,
  Eye,
  Filter,
} from 'lucide-react';
import {
  getAdminMetrics,
  getAllMechanics,
  updateMechanicVerification,
  getBreakdownRequests,
  getSubscriptionPlans,
  saveSubscriptionPlan,
  getIncentiveRules,
  saveIncentiveRule,
  getRewardLedger,
  getServiceabilityZones,
  getAuditLogs,
  getCurrentSession,
  setSessionUser,
  DEMO_ADMIN,
  AdminMetrics,
} from '@/lib/api';
import {
  AuditLogEntry,
  BreakdownRequest,
  IncentiveRule,
  ServiceabilityZone,
  SubscriptionPlan,
} from '@/lib/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(getCurrentSession());
  const [activeTab, setActiveTab] = useState<
    'overview' | 'mechanics' | 'bookings' | 'subscriptions' | 'incentives' | 'zones' | 'audit'
  >('overview');

  // State
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [bookings, setBookings] = useState<BreakdownRequest[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [incentiveRules, setIncentiveRules] = useState<IncentiveRule[]>([]);
  const [rewardLedger, setRewardLedger] = useState<any[]>([]);
  const [zones, setZones] = useState<ServiceabilityZone[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // KYC Reject Modal
  const [rejectModalMechId, setRejectModalMechId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Incomplete workshop license or blurred government ID.');

  const loadData = async () => {
    setIsLoading(true);
    const sess = getCurrentSession();
    setSession(sess);

    const [m, mechs, bks, plns, incs, rwds, zns, aud] = await Promise.all([
      getAdminMetrics(),
      getAllMechanics(),
      getBreakdownRequests(undefined, 'admin'),
      getSubscriptionPlans(),
      getIncentiveRules(),
      getRewardLedger(),
      getServiceabilityZones(),
      getAuditLogs(),
    ]);

    setMetrics(m);
    setMechanics(mechs);
    setBookings(bks);
    setPlans(plns);
    setIncentiveRules(incs);
    setRewardLedger(rwds);
    setZones(zns);
    setAuditLogs(aud);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveKYC = async (mechId: string) => {
    await updateMechanicVerification(mechId, 'approved');
    alert('Mechanic KYC approved successfully!');
    loadData();
  };

  const handleRejectKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalMechId) return;
    await updateMechanicVerification(rejectModalMechId, 'rejected', rejectReason);
    setRejectModalMechId(null);
    alert('Mechanic KYC rejected with formal reason logged.');
    loadData();
  };

  const handleToggleSuspend = async (mech: any) => {
    const newStatus = mech.verificationStatus === 'suspended' ? 'approved' : 'suspended';
    await updateMechanicVerification(mech.userId, newStatus, 'Administrative policy action');
    loadData();
  };

  const handleLogout = () => {
    setSessionUser(null);
    router.push('/admin/login');
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-white">
      {/* Top Admin Header */}
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#FFD400] uppercase tracking-wider">
              MECHFIND Central Command
            </span>
            <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-extrabold uppercase">
              Super Admin Mode
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">
            {session.user?.fullName || 'Vikramaditya Rao'} • Operations Center
          </h1>
          <p className="text-xs text-gray-400">
            Session: Corporate Headquarters BKC • Role-based access control enforced
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/support/dashboard"
            className="px-3.5 py-2 rounded-xl bg-[#222222] hover:bg-[#2C2C2C] text-xs font-bold text-gray-300 border border-gray-700"
          >
            Support Desk
          </Link>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-[#1C1C1C] border border-gray-700 text-gray-300 hover:text-white"
            title="Refresh All"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-[#1C1C1C] border border-gray-700 text-gray-300 hover:text-rose-400"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-[#262626] gap-6 text-sm font-bold overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: Shield },
          { id: 'mechanics', label: 'Mechanics & KYC Audit', icon: Wrench },
          { id: 'bookings', label: 'Bookings & Dispatch', icon: Clock },
          { id: 'subscriptions', label: 'Subscription Plans', icon: Layers },
          { id: 'incentives', label: 'Incentive Rules', icon: Award },
          { id: 'zones', label: 'Service Zones', icon: MapPin },
          { id: 'audit', label: 'Audit Trail', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-[#FFD400] text-[#FFD400]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#141414] border border-[#282828] rounded-2xl p-5">
              <span className="text-xs text-gray-400 uppercase font-semibold">Total Bookings</span>
              <div className="text-3xl font-black text-white mt-1">{metrics.totalBookings}</div>
              <span className="text-[11px] text-emerald-400">{metrics.activeBookings} active right now</span>
            </div>

            <div className="bg-[#141414] border border-[#282828] rounded-2xl p-5">
              <span className="text-xs text-gray-400 uppercase font-semibold">Total Marketplace GMV</span>
              <div className="text-3xl font-black text-[#FFD400] mt-1">₹{metrics.totalRevenue}</div>
              <span className="text-[11px] text-gray-400">Commission: ₹{metrics.commissionRevenue}</span>
            </div>

            <div className="bg-[#141414] border border-[#282828] rounded-2xl p-5">
              <span className="text-xs text-gray-400 uppercase font-semibold">Subscription ARR</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">₹{metrics.subscriptionRevenue}</div>
              <span className="text-[11px] text-gray-400">Pro & Premium workshops</span>
            </div>

            <div className="bg-[#141414] border border-[#282828] rounded-2xl p-5">
              <span className="text-xs text-gray-400 uppercase font-semibold">Platform Trust Score</span>
              <div className="text-3xl font-black text-yellow-400 mt-1 flex items-center gap-1">
                ★ {metrics.averageRating}
              </div>
              <span className="text-[11px] text-gray-400">Cancellation rate: {metrics.cancellationRatePct}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#141414] border border-[#282828] rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Platform Health & Coverage</h3>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex justify-between p-2 rounded bg-[#1A1A1A]">
                  <span>Active Online Workshops:</span>
                  <span className="font-bold text-emerald-400">{metrics.activeMechanics}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-[#1A1A1A]">
                  <span>Registered Motorists:</span>
                  <span className="font-bold text-white">{metrics.activeCustomers}+</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-[#1A1A1A]">
                  <span>Active PostGIS Metro Zones:</span>
                  <span className="font-bold text-[#FFD400]">6 Hubs (Mumbai, Pune, BLR, NCR, HYD, CHN)</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-[#1A1A1A]">
                  <span>Pending Customer Disputes:</span>
                  <span className="font-bold text-rose-400">{metrics.pendingDisputes}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#141414] border border-[#282828] rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white">Recent System Audit Log</h3>
              <div className="space-y-2 text-xs">
                {auditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="p-2.5 rounded bg-[#1A1A1A] border border-gray-800">
                    <div className="flex justify-between font-bold">
                      <span className="text-[#FFD400]">{log.action}</span>
                      <span className="text-gray-500 text-[10px]">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-300 text-[11px] mt-0.5">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MECHANICS & KYC AUDIT TAB */}
      {activeTab === 'mechanics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Mechanics & Workshop Registry</h3>
              <p className="text-xs text-gray-400">KYC verification, experience tiering, suspension controls</p>
            </div>
            <span className="text-xs bg-[#1A1A1A] px-3 py-1.5 rounded-lg border border-gray-800">
              Total Garages: {mechanics.length}
            </span>
          </div>

          <div className="bg-[#141414] border border-[#282828] rounded-2xl overflow-hidden text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#1A1A1A] text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800">
                  <tr>
                    <th className="p-3.5">Workshop / Shop Name</th>
                    <th className="p-3.5">Experience & Tier</th>
                    <th className="p-3.5">Rating / Jobs</th>
                    <th className="p-3.5">Plan</th>
                    <th className="p-3.5">KYC Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-gray-200">
                  {mechanics.map((mech) => (
                    <tr key={mech.userId} className="hover:bg-[#1A1A1A] transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold text-white block">{mech.shopName}</span>
                        <span className="text-[11px] text-gray-400">{mech.shopAddress}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold block">{mech.yearsOfExperience} Years</span>
                        <span className="text-[10px] uppercase text-[#FFD400] font-bold">{mech.experienceTier || 'Standard'}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-yellow-400">★ {mech.rating}</span>
                        <span className="text-[11px] text-gray-400 block">{mech.completedJobsCount} jobs</span>
                      </td>
                      <td className="p-3.5 uppercase font-bold text-xs text-emerald-400">
                        {mech.subscriptionTier || 'Free'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            mech.verificationStatus === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : mech.verificationStatus === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {mech.verificationStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {mech.verificationStatus !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleApproveKYC(mech.userId)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                          >
                            Approve
                          </button>
                        )}
                        {mech.verificationStatus !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => setRejectModalMechId(mech.userId)}
                            className="px-2.5 py-1 bg-gray-800 hover:bg-rose-950 text-rose-400 rounded font-bold"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleSuspend(mech)}
                          className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                        >
                          {mech.verificationStatus === 'suspended' ? 'Reactivate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. BOOKINGS & DISPATCH MONITORING TAB */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Live Booking Stream ({bookings.length})</h3>
            <span className="text-xs text-gray-400">All customer breakdown records</span>
          </div>

          <div className="bg-[#141414] border border-[#282828] rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#1A1A1A] text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800">
                <tr>
                  <th className="p-3.5">Booking ID</th>
                  <th className="p-3.5">Customer & Phone</th>
                  <th className="p-3.5">Category & Type</th>
                  <th className="p-3.5">Assigned Workshop</th>
                  <th className="p-3.5">Cost (₹)</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-gray-200">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#1A1A1A]">
                    <td className="p-3.5 font-mono text-[#FFD400]">#{b.id.slice(0, 8)}</td>
                    <td className="p-3.5 font-medium">{b.customerName} ({b.customerPhone})</td>
                    <td className="p-3.5 capitalize">{b.category.replace('_', ' ')} • {b.bookingType}</td>
                    <td className="p-3.5">{b.shopName || 'Unassigned / Broadcast'}</td>
                    <td className="p-3.5 font-bold">₹{b.finalCost || b.estimatedCost}</td>
                    <td className="p-3.5 font-bold uppercase text-[10px]">
                      <span className="px-2 py-0.5 bg-gray-800 rounded">{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SUBSCRIPTION PLANS MANAGER TAB */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Mechanic Subscription Plans</h3>
              <p className="text-xs text-gray-400">Dynamic plan pricing, lead quotas, and commission rates</p>
            </div>
            <button
              type="button"
              onClick={() => alert('New plan creator opened.')}
              className="px-3 py-1.5 rounded-lg bg-[#FFD400] text-black font-extrabold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p.id} className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="text-base font-black text-white">{p.name}</h4>
                  <span className="text-[10px] bg-gray-800 text-[#FFD400] font-mono px-2 py-0.5 rounded font-bold">
                    {p.code}
                  </span>
                </div>
                <div className="text-2xl font-black text-[#FFD400]">₹{p.monthlyPrice} / mo</div>
                <p className="text-gray-400">{p.description}</p>
                <div className="space-y-1 pt-2 border-t border-gray-800 text-gray-300">
                  <div className="flex justify-between">
                    <span>Monthly Lead Quota:</span>
                    <span className="font-bold text-white">{p.leadQuotaMonthly}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission Rate:</span>
                    <span className="font-bold text-white">{p.commissionRatePct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Search Ranking Weight:</span>
                    <span className="font-bold text-[#FFD400]">{p.searchRankingWeight}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Instant Booking Eligible:</span>
                    <span className="font-bold text-emerald-400">{p.instantBookingEligible ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. INCENTIVE RULES TAB */}
      {activeTab === 'incentives' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Incentives & Reward Engine Rules</h3>
              <p className="text-xs text-gray-400">Milestone bonuses, rating bonuses, and fraud checks</p>
            </div>
            <button
              type="button"
              onClick={() => alert('New incentive rule creator opened.')}
              className="px-3 py-1.5 rounded-lg bg-[#FFD400] text-black font-extrabold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Create Rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incentiveRules.map((r) => (
              <div key={r.id} className="bg-[#141414] border border-[#282828] rounded-2xl p-5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-white">{r.name}</h4>
                  <span className="font-black text-[#FFD400] text-sm">₹{r.rewardAmount}</span>
                </div>
                <p className="text-gray-400">{r.criteriaDescription}</p>
                <div className="text-[11px] text-gray-500 pt-1">
                  Valid: {r.startDate} to {r.endDate} • Code: {r.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SERVICEABILITY ZONES TAB */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Active PostGIS Serviceability Zones</h3>
            <button
              type="button"
              onClick={() => alert('New zone creation opened.')}
              className="px-3 py-1.5 rounded-lg bg-[#FFD400] text-black font-extrabold text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Metro Hub
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {zones.map((z) => (
              <div key={z.id} className="bg-[#141414] border border-[#282828] rounded-2xl p-5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-white">{z.cityName}</h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <p className="text-gray-400">{z.stateName}</p>
                <div className="pt-2 border-t border-gray-800 text-[11px] text-gray-500">
                  Center: {z.centerLat}, {z.centerLng} • Radius: {z.radiusKm} km
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. AUDIT TRAIL TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">System & Administrative Audit Logs</h3>
            <span className="text-xs text-gray-400">Immutable operations log</span>
          </div>

          <div className="bg-[#141414] border border-[#282828] rounded-2xl p-4 space-y-2 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-[#1A1A1A] border border-gray-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#FFD400] block">{log.action} ({log.entityType})</span>
                  <span className="text-gray-300">{log.details}</span>
                </div>
                <div className="text-right text-[11px] text-gray-500">
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectModalMechId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRejectKYC} className="bg-[#141414] border border-[#333333] rounded-3xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-start justify-between border-b border-gray-800 pb-2">
              <div>
                <span className="text-xs text-rose-400 font-bold uppercase">KYC Rejection</span>
                <h3 className="text-lg font-black text-white">Log Formal Rejection Reason</h3>
              </div>
              <button onClick={() => setRejectModalMechId(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-gray-300 font-bold">Reason for Rejection *</label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white"
              />
              <p className="text-[11px] text-gray-500">
                This reason is delivered to the mechanic for document resubmission.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalMechId(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

