'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Headphones,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  LogOut,
  MessageSquare,
  FileText,
  User,
  Shield,
  Send,
  Plus,
} from 'lucide-react';
import {
  getSupportTickets,
  updateTicketStatus,
  addTicketNote,
  getCurrentSession,
  setSessionUser,
  DEMO_SUPPORT_AGENT,
} from '@/lib/api';
import { SupportTicket, TicketStatus } from '@/lib/types';

export default function SupportDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(getCurrentSession());
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = async () => {
    setIsLoading(true);
    const sess = getCurrentSession();
    setSession(sess);
    const list = await getSupportTickets(statusFilter);
    setTickets(list);
    if (!selectedTicket && list.length > 0) {
      setSelectedTicket(list[0]);
    } else if (selectedTicket) {
      const updated = list.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const handleUpdateStatus = async (ticketId: string, newStatus: TicketStatus) => {
    const updated = await updateTicketStatus(
      ticketId,
      newStatus,
      session.user?.id || DEMO_SUPPORT_AGENT.id
    );
    if (updated) {
      setSelectedTicket(updated);
      loadTickets();
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newNote.trim()) return;
    await addTicketNote(
      selectedTicket.id,
      session.user?.id || DEMO_SUPPORT_AGENT.id,
      session.user?.fullName || DEMO_SUPPORT_AGENT.fullName,
      newNote.trim()
    );
    setNewNote('');
    loadTickets();
  };

  const handleLogout = () => {
    setSessionUser(null);
    router.push('/support/login');
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-white">
      {/* Top Bar */}
      <div className="bg-[#121212] border border-[#2B2B2B] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              MECHFIND Customer Care & Triage
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-extrabold uppercase">
              Support Agent Desk
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">
            {session.user?.fullName || 'Pooja Iyer'} • Incident Resolution Terminal
          </h1>
          <p className="text-xs text-gray-400">
            SLA standard: Critical emergencies under 15m • Complaints under 2 hours
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="px-3.5 py-2 rounded-xl bg-[#222222] hover:bg-[#2C2C2C] text-xs font-bold text-gray-300 border border-gray-700"
          >
            Admin Panel
          </Link>
          <button
            onClick={loadTickets}
            className="p-2.5 rounded-xl bg-[#1C1C1C] border border-gray-700 text-gray-300 hover:text-white"
            title="Refresh Tickets"
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

      {/* Ticket Filters Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {['all', 'open', 'in_progress', 'resolved'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              statusFilter === s
                ? 'bg-emerald-500 text-black shadow-sm font-extrabold'
                : 'bg-[#1C1C1C] text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {s.replace('_', ' ')} Tickets
          </button>
        ))}
      </div>

      {/* Master-Detail Ticket Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ticket Queue */}
        <div className="lg:col-span-5 bg-[#121212] border border-[#262626] rounded-2xl p-4 space-y-3 max-h-[680px] overflow-y-auto">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-gray-400 uppercase">Incoming Queue ({tickets.length})</span>
            <span className="text-[11px] text-emerald-400 font-semibold">Live SLA Active</span>
          </div>

          {tickets.length === 0 ? (
            <p className="text-xs text-gray-500 py-12 text-center">No tickets in this view.</p>
          ) : (
            tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500'
                      : 'bg-[#181818] border-[#2A2A2A] hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[#FFD400] font-bold">{t.ticketNumber}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                        t.priority === 'critical' || t.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-white line-clamp-1">{t.subject}</h4>
                  <p className="text-gray-400 text-[11px] line-clamp-2">{t.description}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-800 text-[10px] text-gray-400">
                    <span>{t.customerName}</span>
                    <span className="capitalize">{t.status.replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Ticket Inspection & Internal Notes Thread */}
        <div className="lg:col-span-7 bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-6">
          {selectedTicket ? (
            <>
              {/* Header details */}
              <div className="border-b border-[#262626] pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[#FFD400]">
                    {selectedTicket.ticketNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                      Category: {selectedTicket.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>
                <h2 className="text-lg font-black text-white">{selectedTicket.subject}</h2>
                <p className="text-xs text-gray-300 leading-relaxed bg-[#1A1A1A] p-3 rounded-xl border border-gray-800">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Stakeholders info */}
              <div className="grid grid-cols-2 text-xs bg-[#1A1A1A] p-3 rounded-xl border border-gray-800 gap-2">
                <div>
                  <span className="text-gray-500 block">Customer:</span>
                  <span className="font-bold text-white">{selectedTicket.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Assigned Workshop:</span>
                  <span className="font-bold text-white">{selectedTicket.mechanicName || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Target SLA Deadline:</span>
                  <span className="text-rose-400 font-bold">{new Date(selectedTicket.slaDeadline).toLocaleTimeString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Case Handler:</span>
                  <span className="text-emerald-400 font-bold">{selectedTicket.assignedAgentName || 'Pooja Iyer'}</span>
                </div>
              </div>

              {/* Status Actions Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-gray-400">Change Status:</span>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')}
                  className="px-3 py-1 rounded-lg bg-[#242424] hover:bg-[#2C2C2C] text-xs font-bold text-white border border-gray-700"
                >
                  Mark In Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
                >
                  Resolve Ticket
                </button>
                <button
                  type="button"
                  onClick={() => alert('Escalated to Operations Admin for financial refund approval.')}
                  className="px-3 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-800"
                >
                  Escalate to Admin
                </button>
              </div>

              {/* Internal Notes Thread */}
              <div className="space-y-3 pt-2 border-t border-[#262626]">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Internal Agent Notes (Private to Team)
                </h3>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedTicket.internalNotes && selectedTicket.internalNotes.length > 0 ? (
                    selectedTicket.internalNotes.map((note, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#181818] border border-gray-800 text-xs text-gray-300">
                        {note}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 italic">No internal notes added yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddInternalNote} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add internal note or call summary..."
                    className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Note
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-gray-500 text-xs">
              Select a ticket from the queue to view full case history and take actions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

