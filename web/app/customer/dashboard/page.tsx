'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Car,
  Wrench,
  Star,
  Plus,
  Shield,
  ArrowRight,
  RefreshCw,
  LogOut,
  Navigation,
  MessageSquare,
  FileText,
  AlertOctagon,
  Calendar,
  Send,
  X,
  Printer,
  Check,
} from 'lucide-react';
import {
  getCurrentSession,
  getBreakdownRequests,
  getVehicles,
  updateRequestStatus,
  submitReview,
  setSessionUser,
  respondToQuote,
  getChatMessages,
  sendChatMessage,
  getServiceReminders,
  generateInvoice,
  requestRefund,
  DEMO_CUSTOMER,
} from '@/lib/api';
import {
  BreakdownRequest,
  ChatMessage,
  Invoice,
  JobStatus,
  ServiceReminder,
  Vehicle,
} from '@/lib/types';
import { SERVICE_CATEGORIES } from '@/lib/constants';

const STATUS_STEPS: { id: JobStatus; label: string }[] = [
  { id: 'submitted', label: 'Submitted' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'heading_to_customer', label: 'Heading To You' },
  { id: 'arrived', label: 'Arrived On-Site' },
  { id: 'quote_submitted', label: 'Quote Review' },
  { id: 'work_in_progress', label: 'Repairing' },
  { id: 'completed', label: 'Completed' },
];

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(getCurrentSession());
  const [requests, setRequests] = useState<BreakdownRequest[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review modal state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // In-App Chat Modal
  const [activeChatJobId, setActiveChatJobId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatText, setNewChatText] = useState('');

  // Digital Invoice Modal
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  // Dispute Modal
  const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeAmount, setDisputeAmount] = useState(350);
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const sess = getCurrentSession();
    setSession(sess);
    const userId = sess.user ? sess.user.id : DEMO_CUSTOMER.id;
    const reqs = await getBreakdownRequests(userId, 'customer');
    const vehs = await getVehicles(userId);
    const rems = await getServiceReminders(userId);
    setRequests(reqs);
    setVehicles(vehs);
    setReminders(rems);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const activeRequest = requests.find(
    (r) => r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'paid'
  );
  const pastRequests = requests.filter(
    (r) => r.status === 'completed' || r.status === 'cancelled' || r.status === 'paid'
  );

  // Handle Quote Response
  const handleQuoteDecision = async (bookingId: string, decision: 'approved' | 'rejected') => {
    await respondToQuote(bookingId, decision);
    loadData();
  };

  // Chat handling
  const openChat = async (bookingId: string) => {
    setActiveChatJobId(bookingId);
    const msgs = await getChatMessages(bookingId);
    setChatMessages(msgs);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim() || !activeChatJobId) return;
    const msg = await sendChatMessage(
      activeChatJobId,
      session.user?.id || DEMO_CUSTOMER.id,
      'customer',
      session.user?.fullName || DEMO_CUSTOMER.fullName,
      newChatText.trim()
    );
    setChatMessages([...chatMessages, msg]);
    setNewChatText('');
  };

  // View Invoice
  const handleViewInvoice = async (bookingId: string) => {
    const inv = await generateInvoice(bookingId);
    setActiveInvoice(inv);
  };

  // Submit Dispute
  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeBookingId) return;
    await requestRefund(disputeBookingId, disputeAmount, disputeReason);
    setDisputeSubmitted(true);
    setTimeout(() => {
      setDisputeSubmitted(false);
      setDisputeBookingId(null);
      setDisputeReason('');
    }, 2000);
  };

  const handleCancelRequest = async (id: string) => {
    if (confirm('Are you sure you want to cancel this breakdown request?')) {
      await updateRequestStatus(id, 'cancelled');
      loadData();
    }
  };

  const handleReviewSubmit = async (requestId: string) => {
    await submitReview(requestId, reviewRating, reviewComment);
    loadData();
  };

  const handleLogout = () => {
    setSessionUser(null);
    router.push('/customer/login');
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] border border-[#2B2B2B] rounded-2xl p-6 shadow-xl">
        <div>
          <span className="text-xs font-bold text-[#FFD400] uppercase tracking-wider">
            Customer Marketplace Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome, {session.user?.fullName || 'Rahul Verma'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Registered Mobile: {session.user?.phoneNumber || '+91 98765 43210'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/customer/book"
            className="px-4 py-2.5 rounded-xl bg-[#FFD400] text-black font-extrabold text-xs flex items-center gap-2 shadow-brand hover:bg-[#E5BE00]"
          >
            <Plus className="w-4 h-4" />
            <span>New Assistance Request</span>
          </Link>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-[#1C1C1C] border border-gray-700 text-gray-300 hover:text-white"
            title="Refresh Status"
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

      {/* Active Breakdown Job Card (Live Dispatch & Quote Review) */}
      {activeRequest ? (
        <div className="bg-[#141414] border-2 border-[#FFD400] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black uppercase text-[#FFD400] tracking-wider">
                  Live Dispatch (Job #{activeRequest.id.slice(-6)}) • {activeRequest.bookingType?.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">
                {SERVICE_CATEGORIES.find((c) => c.id === activeRequest.category)?.name ||
                  activeRequest.category}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openChat(activeRequest.id)}
                className="px-3.5 py-2.5 rounded-xl bg-[#222222] hover:bg-[#2C2C2C] text-white font-bold text-xs flex items-center gap-1.5 border border-gray-700 shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-[#FFD400]" />
                <span>Chat with Mechanic</span>
              </button>

              <a
                href={`tel:${activeRequest.mechanicPhone || '18006324346'}`}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call ({activeRequest.mechanicName || 'Technician'})</span>
              </a>

              <button
                onClick={() => handleCancelRequest(activeRequest.id)}
                className="px-3 py-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 hover:bg-rose-900 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Status Progression Pipeline */}
          <div className="py-2">
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const currentIdx = STATUS_STEPS.findIndex((s) => s.id === activeRequest.status);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step.id} className="flex flex-col items-center text-center space-y-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        isCurrent
                          ? 'bg-[#FFD400] text-black ring-4 ring-[#FFD400]/30 scale-110'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#222222] text-gray-500'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        isCurrent
                          ? 'text-[#FFD400]'
                          : isPassed
                          ? 'text-gray-300'
                          : 'text-gray-600'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MANDATORY CLIENT REQUIREMENT: Quote Review & Approval Box */}
          {activeRequest.quote && activeRequest.quote.status === 'submitted' && (
            <div className="p-5 rounded-2xl bg-[#1C1600] border-2 border-[#FFD400] space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-[#FFD400]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Mechanic Submitted Quotation — Customer Approval Required
                  </h3>
                </div>
                <span className="text-xs bg-[#FFD400] text-black font-extrabold px-2 py-0.5 rounded">
                  Pending Your Approval
                </span>
              </div>

              <p className="text-xs text-gray-300">
                The technician has inspected your vehicle and provided an itemized breakdown.
                Work will only commence upon your approval.
              </p>

              {/* Itemized Table */}
              <div className="bg-black/60 rounded-xl p-3 border border-yellow-500/30 text-xs space-y-2">
                <div className="grid grid-cols-12 text-gray-400 font-bold border-b border-gray-800 pb-1">
                  <span className="col-span-6">Item / Work Description</span>
                  <span className="col-span-2 text-center">Type</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Price</span>
                </div>
                {activeRequest.quote.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 text-white py-0.5">
                    <span className="col-span-6 font-medium">{item.description}</span>
                    <span className="col-span-2 text-center uppercase text-[10px] text-gray-400">
                      {item.itemType}
                    </span>
                    <span className="col-span-2 text-center">{item.quantity}</span>
                    <span className="col-span-2 text-right font-bold">₹{item.totalPrice}</span>
                  </div>
                ))}
                <div className="border-t border-gray-800 pt-2 flex justify-between font-bold text-gray-300">
                  <span>Labour: ₹{activeRequest.quote.totalLabour} • Parts: ₹{activeRequest.quote.totalParts} • GST (18%): ₹{activeRequest.quote.taxAmount}</span>
                  <span className="text-base font-black text-[#FFD400]">
                    Total: ₹{activeRequest.quote.grandTotal}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuoteDecision(activeRequest.id, 'rejected')}
                  className="px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-xs font-bold text-gray-300 hover:text-white"
                >
                  Reject & Discuss with Mechanic
                </button>
                <button
                  type="button"
                  onClick={() => handleQuoteDecision(activeRequest.id, 'approved')}
                  className="px-6 py-2.5 rounded-xl bg-[#FFD400] text-black font-black text-xs hover:bg-[#E5BE00] flex items-center gap-1.5 shadow-brand"
                >
                  <Check className="w-4 h-4" />
                  Approve Quotation & Start Repair
                </button>
              </div>
            </div>
          )}

          {/* Assigned Workshop & Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-2xl p-4 space-y-1.5">
              <span className="text-xs text-gray-400 uppercase font-semibold">Assigned Workshop</span>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#FFD400]" />
                {activeRequest.shopName || 'Apex Speed Garage & Roadside Care'}
              </div>
              <p className="text-xs text-gray-400">
                Technician: {activeRequest.mechanicName || 'Rajesh Sharma'}
              </p>
              <div className="text-xs font-semibold text-emerald-400">ETA: ~12-15 Minutes</div>
            </div>

            <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-2xl p-4 space-y-1.5">
              <span className="text-xs text-gray-400 uppercase font-semibold">Breakdown Spot</span>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FFD400] flex-shrink-0" />
                <span className="line-clamp-2">{activeRequest.addressText}</span>
              </div>
              <p className="text-xs text-gray-400">Landmark: {activeRequest.landmark || 'Highway Milepost'}</p>
            </div>

            <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-2xl p-4 space-y-1.5">
              <span className="text-xs text-gray-400 uppercase font-semibold">Vehicle & Cost</span>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-[#FFD400]" />
                <span>
                  {activeRequest.vehicleDetails?.make} {activeRequest.vehicleDetails?.model} (
                  {activeRequest.vehicleDetails?.licensePlate})
                </span>
              </div>
              <div className="text-xs text-gray-300">
                Amount:{' '}
                <span className="font-extrabold text-[#FFD400]">
                  ₹{activeRequest.quote?.grandTotal || activeRequest.estimatedCost}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-8 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Breakdown Requests</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            You are all clear! Need maintenance, battery boost, or roadside assistance? Book now.
          </p>
          <div className="pt-2">
            <Link
              href="/customer/book"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFD400] text-black font-extrabold text-xs shadow-brand hover:bg-[#E5BE00]"
            >
              <Plus className="w-4 h-4" />
              <span>Book Immediate Assistance</span>
            </Link>
          </div>
        </div>
      )}

      {/* Two Column Layout: Garage/Reminders & Service History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Saved Garage + Vehicle Reminders */}
        <div className="lg:col-span-5 space-y-6">
          {/* My Garage */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#FFD400]" />
                <h3 className="text-base font-bold text-white">My Saved Garage</h3>
              </div>
              <Link href="/customer/vehicles" className="text-xs font-bold text-[#FFD400] hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-2.5">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{v.make} {v.model}</span>
                      {v.isDefault && (
                        <span className="text-[10px] bg-[#FFD400]/20 text-[#FFD400] px-1.5 py-0.5 rounded font-bold">
                          Primary
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 uppercase font-mono">
                      {v.licensePlate} • {v.fuelType}
                    </span>
                  </div>
                  <span className="text-xs uppercase px-2 py-1 bg-black rounded text-gray-300 font-bold">
                    {v.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Service Reminders Widget */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Service & Compliance Alerts</h3>
              </div>
              <span className="text-xs text-gray-400">Automated</span>
            </div>

            <div className="space-y-2.5">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="p-3 rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#FFD400] capitalize">
                      {rem.reminderType.replace('_', ' ')}
                    </span>
                    <span className="text-gray-400">Due: {rem.dueDate}</span>
                  </div>
                  <p className="text-gray-300">{rem.notes}</p>
                  <span className="text-[10px] text-gray-500 font-mono">{rem.vehicleName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Past Service Requests, Invoices & Disputes */}
        <div className="lg:col-span-7 bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Service History & GST Invoices</h3>
            <span className="text-xs text-gray-400">{pastRequests.length} completed records</span>
          </div>

          {pastRequests.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">
              No completed roadside services on record yet.
            </p>
          ) : (
            <div className="space-y-3">
              {pastRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-[#181818] border border-[#282828] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                          req.status === 'completed' || req.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {req.status}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {SERVICE_CATEGORIES.find((c) => c.id === req.category)?.name || req.category}
                      </h4>
                    </div>
                    <div className="text-sm font-extrabold text-[#FFD400]">
                      ₹{req.finalCost || req.estimatedCost}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>Workshop: {req.shopName || 'Apex Speed Garage'}</span>
                    <span>•</span>
                    <span>Date: {new Date(req.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>
                      {req.vehicleDetails?.make} {req.vehicleDetails?.model} ({req.vehicleDetails?.licensePlate})
                    </span>
                  </div>

                  {/* Action row: Invoice, Dispute, and Rating */}
                  <div className="pt-2 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewInvoice(req.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#242424] hover:bg-[#2C2C2C] text-xs font-bold text-gray-300 flex items-center gap-1 border border-gray-700"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#FFD400]" />
                        <span>GST Invoice</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDisputeBookingId(req.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#242424] hover:bg-rose-950 text-xs font-bold text-gray-300 hover:text-rose-400 flex items-center gap-1 border border-gray-700"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Dispute / Refund</span>
                      </button>
                    </div>

                    {req.rating ? (
                      <div className="flex items-center gap-1 text-xs text-yellow-400">
                        <Star className="w-3.5 h-3.5 fill-yellow-400" />
                        <span className="font-bold">{req.rating}★:</span>
                        <span className="text-gray-300 italic truncate max-w-[150px]">
                          &quot;{req.reviewComment}&quot;
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-400">Rate:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => {
                              setReviewRating(star);
                              handleReviewSubmit(req.id);
                            }}
                            className="text-gray-500 hover:text-yellow-400"
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* In-App Chat Modal */}
      {activeChatJobId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-3xl max-w-lg w-full h-[520px] flex flex-col overflow-hidden shadow-2xl animate-in fade-in">
            {/* Chat Header */}
            <div className="p-4 bg-[#1C1C1C] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#FFD400] text-black font-black flex items-center justify-center text-sm">
                  RS
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Rajesh Sharma (Mechanic)</h4>
                  <p className="text-[11px] text-emerald-400">En Route • Active Booking</p>
                </div>
              </div>
              <button onClick={() => setActiveChatJobId(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg) => {
                const isMe = msg.senderRole === 'customer';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-gray-500 mb-0.5">{msg.senderName}</span>
                    <div
                      className={`p-3 rounded-2xl max-w-[80%] ${
                        isMe
                          ? 'bg-[#FFD400] text-black font-medium rounded-tr-none'
                          : 'bg-[#222222] text-white rounded-tl-none border border-gray-700'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#1A1A1A] border-t border-gray-800 flex gap-2">
              <input
                type="text"
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                placeholder="Type a message to your mechanic..."
                className="flex-1 bg-[#121212] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFD400]"
              />
              <button
                type="submit"
                className="p-2.5 bg-[#FFD400] text-black rounded-xl hover:bg-[#E5BE00] flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GST Digital Invoice Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-3xl max-w-xl w-full p-6 text-white space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-start justify-between border-b border-gray-800 pb-3">
              <div>
                <span className="text-xs text-[#FFD400] font-bold uppercase">Digital GST Tax Invoice</span>
                <h3 className="text-lg font-black text-white">{activeInvoice.invoiceNumber}</h3>
              </div>
              <button onClick={() => setActiveInvoice(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 text-xs text-gray-300 gap-2 bg-[#1A1A1A] p-3 rounded-xl border border-gray-800">
              <div>
                <span className="text-gray-500 block">Customer:</span>
                <span className="font-bold text-white">{activeInvoice.customerName}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Workshop:</span>
                <span className="font-bold text-white">{activeInvoice.mechanicShopName}</span>
              </div>
              <div>
                <span className="text-gray-500 block">GSTIN:</span>
                <span className="font-mono text-gray-300">{activeInvoice.gstNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Date:</span>
                <span>{new Date(activeInvoice.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Line items */}
            <div className="border border-gray-800 rounded-xl p-3 text-xs space-y-2">
              <div className="flex justify-between text-gray-400 font-bold border-b border-gray-800 pb-1">
                <span>Description</span>
                <span>Amount</span>
              </div>
              {activeInvoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-gray-200">
                  <span>{item.description} (x{item.quantity})</span>
                  <span>₹{item.totalPrice}</span>
                </div>
              ))}
              <div className="border-t border-gray-800 pt-2 space-y-1">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal:</span>
                  <span>₹{activeInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>CGST (9%) + SGST (9%):</span>
                  <span>₹{activeInvoice.taxAmount}</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#FFD400] pt-1">
                  <span>Grand Total Paid:</span>
                  <span>₹{activeInvoice.grandTotal}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2C2C2C] text-xs font-bold text-white flex items-center gap-1.5 border border-gray-700"
              >
                <Printer className="w-4 h-4 text-[#FFD400]" />
                Print Invoice
              </button>
              <button
                type="button"
                onClick={() => setActiveInvoice(null)}
                className="px-5 py-2 rounded-xl bg-[#FFD400] text-black font-extrabold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute & Refund Modal */}
      {disputeBookingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#333333] rounded-3xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-start justify-between border-b border-gray-800 pb-2">
              <div>
                <span className="text-xs text-rose-400 font-bold uppercase">Customer Protection</span>
                <h3 className="text-lg font-black text-white">Submit Dispute / Refund Request</h3>
              </div>
              <button onClick={() => setDisputeBookingId(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {disputeSubmitted ? (
              <div className="py-8 text-center space-y-2 animate-in fade-in">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Dispute Ticket Logged</h4>
                <p className="text-xs text-gray-400">
                  Our Level 2 Support Agent has received your complaint and will review within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDisputeSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Refund Claim Amount (₹)</label>
                  <input
                    type="number"
                    value={disputeAmount}
                    onChange={(e) => setDisputeAmount(Number(e.target.value))}
                    className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Reason for Dispute *</label>
                  <textarea
                    rows={3}
                    required
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Describe issue (e.g. overcharged for part, technician arrived 1 hr late, improper fix)..."
                    className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDisputeBookingId(null)}
                    className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                  >
                    Submit Dispute to Support
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
