'use client';

import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Layers,
  Wrench,
  CheckCircle,
  Star,
} from 'lucide-react';

export interface MapPoint {
  latitude: number;
  longitude: number;
  label?: string;
}

export interface MechanicMarker {
  id: string;
  name: string;
  rating: number;
  distanceKm: number;
  pricingStartingAt?: number;
  latitude: number;
  longitude: number;
  isOnline?: boolean;
}

interface InteractiveMapProps {
  userLocation?: MapPoint;
  mechanicLocation?: MapPoint;
  mechanics?: MechanicMarker[];
  selectedMechanicId?: string;
  onSelectMechanic?: (id: string) => void;
  showRoute?: boolean;
  etaMinutes?: number;
  distanceKm?: number;
  height?: string | number;
  className?: string;
}

export default function InteractiveMap({
  userLocation = { latitude: 19.076, longitude: 72.8777, label: 'Your Breakdown Spot' },
  mechanicLocation,
  mechanics = [],
  selectedMechanicId,
  onSelectMechanic,
  showRoute = false,
  etaMinutes,
  distanceKm,
  height = '100%',
  className = '',
}: InteractiveMapProps) {
  const [zoom, setZoom] = useState(1);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(selectedMechanicId || null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 1.8));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.7));
  const handleRecenter = () => setZoom(1);

  // SVG dimensions
  const viewBoxWidth = 800;
  const viewBoxHeight = 600;

  // Coordinates
  const cxUser = 320;
  const cyUser = 410;
  const cxMech = 560;
  const cyMech = 190;

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl select-none ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {/* SVG Vector Map Canvas */}
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full object-cover transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoom})` }}
      >
        <defs>
          <linearGradient id="routeBlueGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1769E8" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <filter id="markerShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Base Map Roads Background */}
        <rect width={viewBoxWidth} height={viewBoxHeight} fill="currentColor" className="text-[#F1F5F9] dark:text-[#0B111E]" />

        {/* Major Arterial Roads / Grid Lines */}
        <line x1="0" y1="160" x2="800" y2="160" stroke="currentColor" strokeWidth="24" className="text-[#E2E8F0] dark:text-[#1E293B]" />
        <line x1="0" y1="380" x2="800" y2="380" stroke="currentColor" strokeWidth="32" className="text-[#E2E8F0] dark:text-[#1E293B]" />
        <line x1="0" y1="520" x2="800" y2="520" stroke="currentColor" strokeWidth="18" className="text-[#E2E8F0] dark:text-[#1E293B]" />

        <line x1="220" y1="0" x2="220" y2="600" stroke="currentColor" strokeWidth="26" className="text-[#E2E8F0] dark:text-[#1E293B]" />
        <line x1="480" y1="0" x2="480" y2="600" stroke="currentColor" strokeWidth="36" className="text-[#E2E8F0] dark:text-[#1E293B]" />
        <line x1="680" y1="0" x2="680" y2="600" stroke="currentColor" strokeWidth="20" className="text-[#E2E8F0] dark:text-[#1E293B]" />

        {/* Diagonal Arterial Expressway */}
        <line x1="0" y1="600" x2="800" y2="100" stroke="currentColor" strokeWidth="14" className="text-[#CBD5E1] dark:text-[#334155]" strokeDasharray="16,8" />

        {/* Green Parks / Coastal Bay Features */}
        <path
          d="M 0 0 L 160 0 Q 140 120 0 160 Z"
          className="fill-emerald-500/10 dark:fill-emerald-500/15"
        />
        <path
          d="M 640 600 Q 720 460 800 480 L 800 600 Z"
          className="fill-emerald-500/10 dark:fill-emerald-500/15"
        />

        {/* Concentric Radar Circles around User (Radar Mode) */}
        {!showRoute && (
          <g>
            <circle cx={cxUser} cy={cyUser} r="80" stroke="#1769E8" strokeWidth="1.5" strokeDasharray="6,4" fill="none" opacity="0.3" />
            <circle cx={cxUser} cy={cyUser} r="160" stroke="#1769E8" strokeWidth="1" strokeDasharray="8,6" fill="none" opacity="0.2" />
            <circle cx={cxUser} cy={cyUser} r="250" stroke="#1769E8" strokeWidth="0.8" fill="none" opacity="0.1" />
          </g>
        )}

        {/* Active Route Curve Line */}
        {showRoute && (
          <g>
            <path
              d={`M ${cxUser} ${cyUser} C ${cxUser + 60} ${cyUser - 90}, ${cxMech - 90} ${cyMech + 100}, ${cxMech} ${cyMech}`}
              stroke="url(#routeBlueGradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Nearby Mechanics Markers */}
        {mechanics.map((m, idx) => {
          const angles = [0.8, 2.4, 4.1, 5.3, 1.6];
          const distances = [90, 150, 200, 130, 220];
          const angle = angles[idx % angles.length];
          const dist = distances[idx % distances.length];
          const mx = cxUser + Math.cos(angle) * dist;
          const my = cyUser + Math.sin(angle) * dist;
          const isSelected = (selectedMechanicId === m.id) || (activeMarkerId === m.id);

          return (
            <g
              key={m.id}
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => {
                setActiveMarkerId(m.id);
                if (onSelectMechanic) onSelectMechanic(m.id);
              }}
            >
              <circle
                cx={mx}
                cy={my}
                r={isSelected ? '22' : '18'}
                fill={isSelected ? '#1769E8' : '#172338'}
                stroke="#FFFFFF"
                strokeWidth="2.5"
                filter="url(#markerShadow)"
              />
              <circle cx={mx} cy={my} r={isSelected ? '8' : '6'} fill="#16A34A" />

              {/* Marker Label Badge */}
              <rect
                x={mx - 45}
                y={my + 22}
                width="90"
                height="22"
                rx="6"
                fill="#FFFFFF"
                stroke="#E2E8F0"
                className="dark:fill-[#1E293B] dark:stroke-[#334155]"
                strokeWidth="1"
                filter="url(#markerShadow)"
              />
              <text
                x={mx}
                y={my + 36}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="currentColor"
                className="text-[#172338] dark:text-[#F8FAFC]"
              >
                ★ {m.rating} • {m.distanceKm}km
              </text>
            </g>
          );
        })}

        {/* Customer Breakdown Spot Pin */}
        <g>
          <circle cx={cxUser} cy={cyUser} r="32" fill="#1769E8" opacity="0.18" className="animate-ping" />
          <circle cx={cxUser} cy={cyUser} r="18" fill="#1769E8" opacity="0.25" />
          <circle cx={cxUser} cy={cyUser} r="10" fill="#1769E8" stroke="#FFFFFF" strokeWidth="2.5" />
        </g>

        {/* Dispatched Mechanic Bike Pin */}
        {showRoute && (
          <g>
            <circle cx={cxMech} cy={cyMech} r="36" fill="#16A34A" opacity="0.2" />
            <circle cx={cxMech} cy={cyMech} r="16" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx={cxMech} cy={cyMech} r="5" fill="#FFFFFF" />
          </g>
        )}
      </svg>

      {/* Floating Map Controls (Top Right) */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-white dark:bg-[#1E293B] p-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-md z-10">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleRecenter}
          title="Recenter Map"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[#1769E8] transition-colors"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Top Floating ETA Badge (when tracking) */}
      {(etaMinutes || distanceKm) && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#172338]/95 backdrop-blur text-white px-3.5 py-1.5 rounded-full border border-slate-700 shadow-lg text-xs font-semibold z-10">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>ETA: ~{etaMinutes || 10} mins</span>
          {distanceKm && <span className="text-slate-400">({distanceKm} km away)</span>}
        </div>
      )}

      {/* Bottom Map Status Pill */}
      <div className="absolute bottom-3 left-4 flex items-center gap-1.5 bg-white/90 dark:bg-[#131D2E]/90 backdrop-blur px-2.5 py-1 rounded-md border border-[#E2E8F0] dark:border-[#1E293B] text-[11px] text-slate-500 dark:text-slate-400 font-medium z-10">
        <Navigation className="w-3 h-3 text-[#1769E8]" />
        <span>Vector GPS Engine • Live PostGIS Coordinates</span>
      </div>
    </div>
  );
}
