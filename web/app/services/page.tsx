import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  Clock,
  CheckCircle,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  Fuel,
  Battery,
  Disc,
  Truck,
  Key,
  Thermometer,
  AlertOctagon,
  Scan,
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '@/lib/constants';

const SERVICE_DETAILS: Record<
  string,
  {
    icon: any;
    included: string[];
    responseTime: string;
    warranty: string;
  }
> = {
  flat_tyre: {
    icon: Disc,
    responseTime: '15 - 20 Mins',
    warranty: '30-Day Puncture Seal Warranty',
    included: [
      'On-site puncture inspection and plug',
      'Tubeless mushroom patch repair',
      'Spare wheel mounting and torque check',
      'Digital tyre pressure inflation (all 4 tyres)',
    ],
  },
  battery_jumpstart: {
    icon: Battery,
    responseTime: '12 - 18 Mins',
    warranty: 'Alternator Health Verification',
    included: [
      'Heavy-duty 12V/24V jump-pack boost',
      'Battery terminal corrosion cleanup',
      'Alternator charging voltage diagnostic',
      'Parasitic battery drain testing',
    ],
  },
  engine_overheating: {
    icon: Thermometer,
    responseTime: '20 - 25 Mins',
    warranty: 'Safe Temperature Run Guarantee',
    included: [
      'Radiator hose and clamp leak diagnosis',
      'Emergency coolant / distilled water top-up',
      'Radiator fan relay and fuse verification',
      'Thermostat inspection and cool-down protocol',
    ],
  },
  fuel_delivery: {
    icon: Fuel,
    responseTime: '20 - 30 Mins',
    warranty: 'Certified Fuel Guarantee',
    included: [
      '2 to 5 Litres of pure Petrol or Diesel delivered',
      'Spill-free automotive funnel pouring',
      'Fuel line air purging for diesel engines',
      'Nearest petrol pump navigation guidance',
    ],
  },
  brake_failure: {
    icon: AlertOctagon,
    responseTime: '20 - 30 Mins',
    warranty: 'Safety-First Inspection',
    included: [
      'Emergency brake lock release',
      'Brake fluid level inspection and top-up',
      'Master cylinder leak check',
      'Caliper pin lubrication & safety triage',
    ],
  },
  towing_service: {
    icon: Truck,
    responseTime: '25 - 40 Mins',
    warranty: 'Zero-Scratch Flatbed Transit',
    included: [
      'Hydraulic tilting flatbed or wheel-lift crane',
      'Heavy-duty wheel straps & chassis harness',
      'Safe transport to authorized garage or home',
      'Real-time vehicle transit tracking',
    ],
  },
  lockout: {
    icon: Key,
    responseTime: '15 - 25 Mins',
    warranty: '100% Damage-Free Guarantee',
    included: [
      'Automotive air wedge & safe lock pick',
      'Damage-free weather-strip opening',
      'Remote key battery testing',
      'Boot / trunk lockout access',
    ],
  },
  general_diagnostics: {
    icon: Scan,
    responseTime: '20 - 30 Mins',
    warranty: 'Full Diagnostic Code Report',
    included: [
      'OBD-II computer fault code scanning',
      'Sensor readings (O2, MAF, Throttle)',
      'Electrical fuse box troubleshooting',
      'Clear explanation of vehicle drivability',
    ],
  },
};

export default function ServicesPage() {
  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#FFD400] uppercase tracking-wider">
          Transparent Rates • 24/7 Availability
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          On-Demand Roadside Assistance Services
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          Fixed pricing, zero hidden surge fees, and background-verified technicians.
          Whether you ride a 100cc scooter or drive a luxury SUV, help is 15 minutes away.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICE_CATEGORIES.map((cat) => {
          const detail = SERVICE_DETAILS[cat.id] || {
            icon: Wrench,
            responseTime: '20 Mins',
            warranty: 'Standard Guarantee',
            included: ['On-site breakdown diagnosis', 'Immediate roadside triage'],
          };
          const IconComp = detail.icon;

          return (
            <div
              key={cat.id}
              className="bg-[#121212] border border-[#262626] hover:border-[#FFD400]/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all group shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#FFD400]/15 text-[#FFD400] border border-[#FFD400]/30 flex items-center justify-center">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white group-hover:text-[#FFD400] transition-colors">
                        {cat.name}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-[#FFD400]" />
                        <span>Avg ETA: {detail.responseTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Starting at</span>
                    <span className="text-2xl font-black text-[#FFD400]">
                      ₹{cat.estimatedPrice}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  {cat.description}
                </p>

                {/* What's Included */}
                <div className="space-y-2 mb-6">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
                    What&apos;s Included:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                    {detail.included.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#222222] flex items-center justify-between gap-4">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#FFD400]" />
                  {detail.warranty}
                </span>

                <Link
                  href={`/customer/book?service=${cat.id}`}
                  className="px-5 py-2.5 rounded-xl bg-[#FFD400] hover:bg-[#E5BE00] text-black text-xs font-black flex items-center gap-1.5 transition-transform active:scale-95 shadow-brand"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency CTA Banner */}
      <div className="bg-[#171717] border border-[#2F2F2F] rounded-2xl p-8 text-center space-y-4 shadow-2xl">
        <h3 className="text-2xl font-black text-white">
          Not Sure What Went Wrong With Your Vehicle?
        </h3>
        <p className="text-sm text-gray-400 max-w-xl mx-auto">
          Our rapid response mechanics carry OBD scanners and battery diagnostics. 
          Book an On-Spot Inspection or speak directly to a technical supervisor.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/customer/book?service=general_diagnostics"
            className="px-6 py-3 rounded-xl bg-[#FFD400] text-black font-extrabold text-sm hover:bg-[#E5BE00] shadow-brand"
          >
            Book Quick Inspection (₹400)
          </Link>
          <a
            href="tel:18006324346"
            className="px-6 py-3 rounded-xl bg-[#262626] text-white font-bold text-sm hover:bg-[#333333] border border-gray-700 flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-[#FFD400]" />
            Call Technical Dispatch (1800-MECH-FIND)
          </a>
        </div>
      </div>
    </div>
  );
}
