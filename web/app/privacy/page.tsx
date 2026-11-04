import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-gray-300">
      <div className="border-b border-gray-800 pb-6">
        <span className="text-xs font-bold text-[#FFD400] uppercase tracking-wider">
          Legal & Compliance
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
          MECHFIND Privacy Policy
        </h1>
        <p className="text-xs text-gray-500 mt-2">
          Last Updated: February 2026 • Effective for Web & Mobile Platforms
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">1. Introduction</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          MECHFIND Technologies India Private Limited (&ldquo;MECHFIND&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;)
          operates the on-demand roadside assistance platform across web and mobile applications.
          This Privacy Policy outlines how we collect, store, process, and safeguard your personal
          information, including real-time geolocation coordinates.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">2. Real-Time Geolocation & PostGIS Data</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          Because MECHFIND is an emergency location-based roadside service, we collect high-precision
          geographic coordinates (latitude and longitude) through browser HTML5 Geolocation or device
          GPS sensors when you initiate a breakdown request. This location is used exclusively to:
        </p>
        <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 pl-2">
          <li>Calculate proximity to the nearest verified mechanic via PostGIS spatial functions.</li>
          <li>Provide turn-by-turn navigation coordinates to the responding technician.</li>
          <li>Display live ETA updates and emergency tracking.</li>
        </ul>
        <p className="text-xs sm:text-sm leading-relaxed">
          We never track your background location when you are not actively seeking breakdown assistance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">3. Information We Collect</h2>
        <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 pl-2">
          <li><strong className="text-white">Profile Details:</strong> Name, verified telephone number, email address.</li>
          <li><strong className="text-white">Vehicle Information:</strong> Make, model, year, registration license plate number, fuel type.</li>
          <li><strong className="text-white">Breakdown Media:</strong> Photos or descriptions submitted by you to explain vehicle symptoms.</li>
          <li><strong className="text-white">Payment Records:</strong> Transaction IDs, invoice totals, and payment modes (card/UPI details are handled securely via PCI-DSS compliant gateways).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">4. Data Sharing & Security</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          Your phone number and vehicle location are shared only with the specific mechanic assigned
          to your active breakdown job. We never sell, rent, or trade your personal data to third-party
          advertisers. All database transmissions to our Supabase PostgreSQL cluster are encrypted
          using TLS 1.3 and industry-standard AES-256 at rest.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">5. Your Data Rights</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          You may request deletion or export of your account, vehicle garage, and service history
          at any time by contacting privacy@mechfind.com or via your Customer Dashboard settings.
        </p>
      </section>
    </div>
  );
}

