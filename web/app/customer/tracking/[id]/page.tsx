'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Navigation,
  Clock,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Star,
  MapPin,
  CheckCircle,
  AlertTriangle,
  FileText,
  X,
  Send,
  ArrowLeft,
  Wrench,
  Bike,
  User,
} from 'lucide-react';
import CustomerNav from '@/components/CustomerNav';
import InteractiveMap from '@/components/InteractiveMap';
import {
  getBreakdownRequests,
  updateRequestStatus,
  respondToQuote,
  getChatMessages,
  sendChatMessage,
  DEMO_CUSTOMER,
} from '@/lib/api';
import { BreakdownRequest, ChatMessage, Quote } from '@/lib/types';

export default function LiveTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const requestId = resolvedParams.id;

  const [request, setRequest] = useState<BreakdownRequest | null>(null);
  const [eta, setEta] = useState(10);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatText, setNewChatText] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    getBreakdownRequests(DEMO_CUSTOMER.id, 'customer').then((list) => {
      const match = list.find((r) => r.id === requestId) || list[0];
      if (match) {
        setRequest(match);
        setEta(match.etaMinutes || 10);
      }
    });
  }, [requestId]);

  // ETA countdown simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setEta((prev) => Math.max(1, prev - 1));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const mech = (request as any)?.mechanic;
  const mechanicPhone = mech?.phoneNumber || '+91 98201 12345';

  const handleCall = () => {
    window.location.href = `tel:${mechanicPhone}`;
  };

  const handleWhatsApp = () => {
    const phone = mechanicPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=Hello%20Rajesh%2C%20regarding%20my%20breakdown%20dispatch`, '_blank');
  };

  const handleOpenChat = async () => {
    setShowChat(true);
    if (request) {
      const msgs = await getChatMessages(request.id);
      setChatMessages(msgs);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim() || !request) return;
    const sent = await sendChatMessage(request.id, 'cust_01', 'customer', 'Arjun Kapoor', newChatText);
    setChatMessages((prev) => [...prev, sent]);
    setNewChatText('');
  };

  const handleQuoteDecision = async (decision: 'approved' | 'rejected') => {
    if (!request) return;
    await respondToQuote(request.id, decision);
    const updated = {
      ...request,
      status: decision === 'approved' ? ('work_in_progress' as const) : ('cancelled' as const),
    };
    setRequest(updated);
  };

  const handleConfirmCancel = async () => {
    if (!request) return;
    await updateRequestStatus(request.id, 'cancelled');
    setShowCancelModal(false);
    router.push('/customer/bookings');
  };

  const mechanicName = mech?.fullName || 'Rajesh Kumar';
  const shopName = mech?.shopName || 'Apex Speed Garage';
  const rating = mech?.rating || 4.9;
  const distance = mech?.distanceKm || 1.2;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111E] flex flex-col">
      <CustomerNav />

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-5">
        {/* Top Header & ETA Banner (Matching Mobile Screen 4) */}
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#172338] dark:text-[#F8FAFC]">
            Mechanic is on the way
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            ETA: ~{eta} mins ({distance} km)
          </p>
        </div>

        {/* Large Vector Interactive Route Map */}
        <div className="h-80 sm:h-96 w-full rounded-3xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm">
          <InteractiveMap
            userLocation={{ latitude: 19.076, longitude: 72.8777 }}
            mechanicLocation={{ latitude: 19.085, longitude: 72.885 }}
            showRoute={true}
            etaMinutes={eta}
            distanceKm={distance}
            height="100%"
          />
        </div>

        {/* Quotation Review Card (if quote submitted) */}
        {request?.status === 'quote_submitted' && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold text-xs sm:text-sm">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Quotation Received: ₹{(request as any).estimatedCost || 400}</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Mechanic has inspected the vehicle and submitted an itemized quote for your sign-off before commencing repair.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleQuoteDecision('approved')}
                className="flex-1 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold shadow-sm"
              >
                Approve & Start Work
              </button>
              <button
                onClick={() => handleQuoteDecision('rejected')}
                className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
              >
                Reject Quote
              </button>
            </div>
          </div>
        )}

        {/* Bottom Mechanic Card (Matching Mobile Screen 4) */}
        <div className="bg-white dark:bg-[#131D2E] p-5 rounded-3xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            {/* Driver Avatar & Info */}
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-[#1769E8] shadow-sm">
                <User className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                  {mechanicName}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold">{rating}</span>
                  <span>•</span>
                  <span>{shopName}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions: Call, WhatsApp & Chat */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCall}
                className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#16A34A] border border-emerald-200 dark:border-emerald-800 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                title="Call Mechanic"
              >
                <PhoneCall className="w-4 h-4" />
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#16A34A] border border-emerald-200 dark:border-emerald-800 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                title="WhatsApp Mechanic"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Sub-Pill at Bottom */}
          <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-[#172338] dark:text-[#F8FAFC]">
            <Bike className="w-4 h-4 text-[#1769E8]" />
            <span>On the way to your location</span>
          </div>
        </div>

        {/* Cancellation Option */}
        <div className="text-center pt-2">
          <button
            onClick={() => setShowCancelModal(true)}
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            Cancel Assistance
          </button>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#131D2E] p-6 rounded-3xl max-w-sm w-full space-y-4 text-center border border-slate-200 dark:border-slate-800 shadow-xl">
              <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-[#172338] dark:text-[#F8FAFC]">
                Cancel Breakdown Request?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The dispatched mechanic is already en-route. Are you sure you wish to cancel assistance?
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Keep Dispatch
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
