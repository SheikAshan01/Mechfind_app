'use client';

import React, { useState } from 'react';
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    topic: 'breakdown_query',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 text-white">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#FFD400] uppercase tracking-wider">
          24/7 Human Dispatch & Support
        </span>
        <h1 className="text-3xl sm:text-5xl font-black">
          We&apos;re Always By Your Side
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          Experiencing a roadside emergency right now? Call our 24/7 toll-free helpline.
          For partnership queries, corporate fleet inquiries, or feedback, reach out below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Emergency Card */}
          <div className="bg-[#1A1A1A] border-2 border-[#FFD400] rounded-2xl p-6 sm:p-8 space-y-4 shadow-brand">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FFD400] text-black flex items-center justify-center font-bold">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold text-[#FFD400] tracking-wider">
                  24/7 Emergency SOS Line
                </span>
                <h3 className="text-2xl font-black text-white">1800-MECH-FIND</h3>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Toll-free across all Indian operators. Direct connection to emergency field
              coordinators with average pickup time under 8 seconds.
            </p>
            <a
              href="tel:18006324346"
              className="w-full py-3 rounded-xl bg-[#FFD400] text-black font-black text-sm flex items-center justify-center gap-2 hover:bg-[#E5BE00] transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              Call Emergency Helpline Now
            </a>
          </div>

          {/* Quick Channels */}
          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1F1F1F] text-[#FFD400] flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-semibold">Email Support</span>
                <a
                  href="mailto:support@mechfind.com"
                  className="text-sm font-bold text-white hover:text-[#FFD400]"
                >
                  support@mechfind.com
                </a>
                <p className="text-[11px] text-gray-500 mt-0.5">Average reply in 2 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1F1F1F] text-[#FFD400] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-semibold">
                  Central Operations & Dispatch Hub
                </span>
                <p className="text-sm font-bold text-white">
                  Tower 4, Bandra Kurla Complex (BKC), Mumbai, MH 400051
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Regional dispatch cells in 7 major metros
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1F1F1F] text-[#FFD400] flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block font-semibold">Operations Hours</span>
                <p className="text-sm font-bold text-white">24 Hours / 7 Days a Week / 365 Days</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Active field recovery network</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="lg:col-span-7 bg-[#141414] border border-[#262626] rounded-2xl p-6 sm:p-8">
          {submitted ? (
            <div className="py-16 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white">Message Received!</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Thank you for reaching out, {formData.name}. Our dispatch supervisor has logged
                your ticket and will contact you via {formData.phone || formData.email} shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-[#262626] text-xs font-bold text-gray-300 hover:text-white"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1 mb-4">
                <h3 className="text-xl font-bold text-white">Send Us An Inquiry</h3>
                <p className="text-xs text-gray-400">
                  Fill in your details and our team will get back to you promptly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD400]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD400]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ramesh@example.com"
                    className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD400]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Subject / Department
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFD400]"
                  >
                    <option value="breakdown_query">Roadside Breakdown Support</option>
                    <option value="partner_onboarding">Mechanic / Workshop Partnership</option>
                    <option value="corporate_fleet">Corporate Fleet Roadside Contract</option>
                    <option value="billing_feedback">Billing or Service Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Message / Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your requirements, breakdown query, or workshop location..."
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#FFD400]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#FFD400] text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-[#E5BE00] transition-colors shadow-brand"
              >
                <Send className="w-4 h-4" />
                Submit Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

