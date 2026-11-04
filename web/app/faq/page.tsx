'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, PhoneCall, ArrowRight } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Booking & Response',
    q: 'How fast will a mechanic reach my location?',
    a: 'Our spatial PostGIS matching engine dispatches the closest active technician within a 3 to 10 kilometer radius. Our average recorded arrival time across metropolitan cities is 14.8 minutes, and on expressways 18 to 25 minutes depending on traffic.',
  },
  {
    category: 'Booking & Response',
    q: 'Do I need to download the mobile app to book roadside assistance?',
    a: 'No! You can book directly from this website using your mobile or desktop browser. Our browser-based location picker accesses your GPS coordinates and dispatches a verified mechanic in seconds. However, our native mobile apps offer offline assistance modes and saved garage vehicles.',
  },
  {
    category: 'Pricing & Payments',
    q: 'Are the prices fixed, or can the mechanic ask for extra money on the road?',
    a: 'All standard service prices (such as Flat Tyre Puncture at ₹350, Battery Boost at ₹400, Emergency Fuel at ₹300) are transparent and standardized. The technician cannot alter standard labor charges. If spare parts (such as a new battery or replacement tube) are required, they will present an itemized bill before installation.',
  },
  {
    category: 'Pricing & Payments',
    q: 'What payment methods do you accept?',
    a: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm, BHIM), Net Banking, Debit/Credit Cards, and Direct Cash to the technician upon successful completion of repairs.',
  },
  {
    category: 'Safety & Trust',
    q: 'How do you verify the mechanics on MECHFIND?',
    a: 'Every technician and garage owner undergoes rigorous identity checks (Aadhaar & Police Background Verification), workshop physical audits, and proof of mechanical qualification. Only mechanics with at least 3 years of verified automotive experience are onboarded.',
  },
  {
    category: 'Safety & Trust',
    q: 'Is there a warranty on roadside puncture or repairs?',
    a: 'Yes, all roadside repairs, tubeless plugs, and battery boost services carry a 30-day MECHFIND Road Assurance guarantee. If the same issue recurs within 30 days under normal usage, we dispatch a complimentary inspection.',
  },
  {
    category: 'Towing & Heavy Assistance',
    q: 'Can MECHFIND tow my vehicle if it cannot be repaired on the spot?',
    a: 'Yes! We operate hydraulic flatbed recovery trucks and wheel-lift cranes for cars, SUVs, and commercial vehicles. When booking, select "Flatbed Towing" or tell your on-site mechanic to escalate to our towing fleet.',
  },
  {
    category: 'Mechanic Partners',
    q: 'How can independent garage owners or mobile mechanics join?',
    a: 'You can apply online via our "Mechanic Partner" portal. Registration takes under 5 minutes. Upload your ID and trade details, complete quick verification, and start receiving job dispatch requests with 0% commission during the introductory period.',
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Booking & Response', 'Pricing & Payments', 'Safety & Trust', 'Towing & Heavy Assistance', 'Mechanic Partners'];

  const filteredFaqs =
    activeCategory === 'All'
      ? FAQS
      : FAQS.filter((f) => f.category === activeCategory);

  return (
    <div className="py-12 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-white">
      {/* Title */}
      <div className="text-center space-y-4">
        <span className="text-xs font-bold text-[#FFD400] uppercase tracking-wider">
          Got Questions? We Have Answers
        </span>
        <h1 className="text-3xl sm:text-5xl font-black">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
          Everything you need to know about MECHFIND roadside dispatch, fixed pricing,
          and mechanic partner standards.
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === c
                  ? 'bg-[#FFD400] text-black shadow-brand'
                  : 'bg-[#171717] text-gray-300 hover:bg-[#222222] border border-gray-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-[#121212] border border-[#242424] rounded-2xl overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-[#181818] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-[#FFD400] flex-shrink-0" />
                  <span className="text-sm sm:text-base font-bold text-white">
                    {faq.q}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                    isOpen ? 'rotate-180 text-[#FFD400]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-gray-800/60 bg-[#161616]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Banner */}
      <div className="bg-[#171717] border border-[#2B2B2B] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white">Still have questions?</h3>
          <p className="text-xs text-gray-400">
            Our 24/7 technical assistance team is ready to help right now.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="tel:18006324346"
            className="px-5 py-2.5 rounded-xl bg-[#FFD400] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-brand hover:bg-[#E5BE00]"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            1800-MECH-FIND
          </a>
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-xl bg-[#262626] text-white font-bold text-xs hover:bg-[#333333] border border-gray-700"
          >
            Contact Team
          </Link>
        </div>
      </div>
    </div>
  );
}

