import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-gray-300">
      <div className="border-b border-gray-800 pb-6">
        <span className="text-xs font-bold text-[#FFD400] uppercase tracking-wider">
          Legal Agreement
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
          MECHFIND Terms of Service
        </h1>
        <p className="text-xs text-gray-500 mt-2">
          Effective Date: February 2026 • Roadside Assistance & Platform Terms
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">1. Service Scope</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          MECHFIND provides a digital coordination platform connecting vehicle owners (&ldquo;Customers&rdquo;)
          with independent licensed workshops and mobile technicians (&ldquo;Mechanic Partners&rdquo;).
          MECHFIND coordinates dispatch, navigation, and billing, while on-site mechanical work is
          carried out by independent automotive professionals.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">2. Transparent Pricing & Payments</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          Standard roadside service fees (e.g., puncture plug, battery boost, towing hookup) are
          displayed to you prior to booking confirmation. Any non-standard parts, batteries, or
          extensive mechanical teardowns must receive your verbal or written authorization before
          work commences.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">3. Road Safety & Triage</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          When stranded on highways, expressways, or busy roads, you agree to follow essential road
          safety practices: turn on hazard warning lights, position a reflective emergency triangle
          if available, and remain behind highway crash barriers while awaiting mechanic arrival.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">4. Cancellations & No-Shows</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          You may cancel a breakdown request free of charge before the mechanic has been dispatched.
          If cancellation occurs after the technician has traveled more than 5 kilometers towards
          your location, a modest dispatch compensation fee (₹150) may apply to cover the technician&apos;s
          fuel and travel expenditure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">5. Warranty & Limitation of Liability</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          Standard repairs carry a 30-day workmanship assurance. MECHFIND is not liable for
          pre-existing catastrophic vehicle engine failures, unapproved third-party parts, or
          incidents occurring outside the agreed repair scope.
        </p>
      </section>
    </div>
  );
}

