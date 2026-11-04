import { supabase, isSupabaseConfigured } from './supabase';
import {
  INITIAL_MECHANICS,
  SERVICE_CATEGORIES,
  DEFAULT_SUBSCRIPTION_PLANS,
  DEFAULT_INCENTIVE_RULES,
  DEFAULT_SERVICEABILITY_ZONES,
  DEFAULT_SUPPORT_TICKETS,
  DEFAULT_COUPONS,
} from './constants';
import {
  AuditLogEntry,
  BookingType,
  BreakdownRequest,
  ChatMessage,
  Coupon,
  ExperienceTier,
  Invoice,
  IncentiveRule,
  JobStatus,
  MechanicLoyalty,
  MechanicProfile,
  MechanicSubscription,
  PaymentMethod,
  PaymentRecord,
  PayoutRecord,
  ProblemCategory,
  Profile,
  Quote,
  QuoteItem,
  QuoteStatus,
  RefundRecord,
  RewardLedgerItem,
  ServiceabilityZone,
  ServiceDeliveryMode,
  ServiceReminder,
  SubscriptionPlan,
  SupportTicket,
  TicketMessage,
  UserRole,
  Vehicle,
  VehicleType,
} from './types';

export * from './types';

// ==========================================
// 1. HAVERSINE GEODISTANCE CALCULATION
// ==========================================
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Local storage keys
const STORAGE_KEYS = {
  REQUESTS: 'mechfind_requests',
  VEHICLES: 'mechfind_vehicles',
  CURRENT_USER: 'mechfind_auth_user',
  MECHANICS: 'mechfind_mechanics',
  PLANS: 'mechfind_subscription_plans',
  SUBSCRIPTIONS: 'mechfind_mechanic_subscriptions',
  INCENTIVE_RULES: 'mechfind_incentive_rules',
  REWARD_LEDGER: 'mechfind_reward_ledger',
  TICKETS: 'mechfind_support_tickets',
  TICKET_MESSAGES: 'mechfind_ticket_messages',
  CHAT_MESSAGES: 'mechfind_chat_messages',
  REMINDERS: 'mechfind_service_reminders',
  ZONES: 'mechfind_serviceability_zones',
  INVOICES: 'mechfind_invoices',
  PAYMENTS: 'mechfind_payments',
  REFUNDS: 'mechfind_refunds',
  PAYOUTS: 'mechfind_payouts',
  AUDIT_LOGS: 'mechfind_audit_logs',
};

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Storage write failed', err);
  }
}

// Initial Demo Data
const INITIAL_DEMO_VEHICLES: Vehicle[] = [
  {
    id: 'veh_01',
    userId: 'cust_01',
    type: 'car',
    make: 'Hyundai',
    model: 'Creta SX (O)',
    year: 2022,
    licensePlate: 'MH 02 EE 4092',
    fuelType: 'petrol',
    color: 'Polar White',
    isDefault: true,
  },
  {
    id: 'veh_02',
    userId: 'cust_01',
    type: 'bike',
    make: 'Royal Enfield',
    model: 'Classic 350',
    year: 2023,
    licensePlate: 'MH 02 BM 8821',
    fuelType: 'petrol',
    color: 'Stealth Black',
    isDefault: false,
  },
];

const INITIAL_DEMO_REQUESTS: BreakdownRequest[] = [
  {
    id: 'req_live_01',
    customerId: 'cust_01',
    customerName: 'Rahul Verma',
    customerPhone: '+91 98765 43210',
    vehicleId: 'veh_01',
    vehicleDetails: {
      make: 'Hyundai',
      model: 'Creta SX (O)',
      licensePlate: 'MH 02 EE 4092',
      type: 'car',
    },
    bookingType: 'emergency_roadside',
    deliveryMode: 'doorstep',
    category: 'flat_tyre',
    description: 'Left rear tyre went flat suddenly while approaching toll gate.',
    location: {
      lat: 19.0657,
      lng: 72.8342,
    },
    addressText: 'Near Bandra-Worli Sea Link Toll Plaza, Bandra West, Mumbai',
    landmark: 'Toll Plaza Lane 4',
    status: 'heading_to_customer',
    urgency: 'high',
    estimatedCost: 350,
    mechanicId: 'mech_01',
    mechanicName: 'Rajesh Sharma',
    mechanicPhone: '+91 98201 12345',
    shopName: 'Apex Speed Garage & Roadside Care',
    assignedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    quote: {
      id: 'q_01',
      bookingId: 'req_live_01',
      mechanicId: 'mech_01',
      customerId: 'cust_01',
      status: 'approved',
      items: [
        { id: 'qi_1', itemType: 'labour', description: 'Tubeless tyre puncture repair & balance', quantity: 1, unitPrice: 300, totalPrice: 300 },
        { id: 'qi_2', itemType: 'part', description: 'Heavy duty rubber plug & sealant', quantity: 1, unitPrice: 50, totalPrice: 50 },
      ],
      totalLabour: 300,
      totalParts: 50,
      taxAmount: 63,
      grandTotal: 413,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      approvedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    },
  },
  {
    id: 'req_past_01',
    customerId: 'cust_01',
    customerName: 'Rahul Verma',
    customerPhone: '+91 98765 43210',
    vehicleId: 'veh_02',
    vehicleDetails: {
      make: 'Royal Enfield',
      model: 'Classic 350',
      licensePlate: 'MH 02 BM 8821',
      type: 'bike',
    },
    bookingType: 'scheduled',
    deliveryMode: 'doorstep',
    category: 'battery_jumpstart',
    description: 'Bike did not start in the morning after being parked for 2 weeks.',
    location: {
      lat: 19.076,
      lng: 72.8777,
    },
    addressText: 'Silver Sands Apartments, Santacruz East, Mumbai',
    landmark: 'Opposite Railway Colony Gate',
    status: 'paid',
    urgency: 'standard',
    estimatedCost: 400,
    finalCost: 400,
    mechanicId: 'mech_02',
    mechanicName: 'Vikram Joshi',
    mechanicPhone: '+91 98202 54321',
    shopName: 'Metro 24/7 Breakdown Masters',
    assignedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 40 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    rating: 5,
    reviewComment: 'Arrived in 12 mins with jumpstart booster kit. Great guy!',
  },
];

// Initial Service Reminders
const INITIAL_DEMO_REMINDERS: ServiceReminder[] = [
  {
    id: 'rem_01',
    customerId: 'cust_01',
    vehicleId: 'veh_01',
    vehicleName: 'Hyundai Creta SX (O) [MH 02 EE 4092]',
    reminderType: 'general_service',
    dueDate: '2026-04-15',
    status: 'pending',
    notes: 'Scheduled 15,000 km periodic engine oil & filter service',
  },
  {
    id: 'rem_02',
    customerId: 'cust_01',
    vehicleId: 'veh_01',
    vehicleName: 'Hyundai Creta SX (O) [MH 02 EE 4092]',
    reminderType: 'insurance_expiry',
    dueDate: '2026-05-20',
    status: 'pending',
    notes: 'Comprehensive motor insurance renewal reminder',
  },
  {
    id: 'rem_03',
    customerId: 'cust_01',
    vehicleId: 'veh_02',
    vehicleName: 'Royal Enfield Classic 350 [MH 02 BM 8821]',
    reminderType: 'puc_expiry',
    dueDate: '2026-03-30',
    status: 'pending',
    notes: '6-Month Pollution Under Control (PUC) test renewal',
  },
];

// ==========================================
// 2. MECHANIC DISCOVERY & MULTI-FILTER SEARCH
// ==========================================
export interface MechanicFilterOptions {
  radiusKm?: number;
  vehicleType?: VehicleType;
  category?: ProblemCategory;
  minRating?: number;
  experienceTier?: ExperienceTier;
  deliveryMode?: ServiceDeliveryMode;
  availableNow?: boolean;
  searchQuery?: string;
  sortBy?: 'distance' | 'rating' | 'experience' | 'price';
}

export async function findNearbyMechanics(
  userLat: number,
  userLng: number,
  radiusKm = 25,
  vehicleFilter?: VehicleType,
  options?: MechanicFilterOptions
) {
  // Try Supabase PostGIS RPC first if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('find_nearby_mechanics_v2', {
        user_lat: userLat,
        user_lng: userLng,
        radius_km: radiusKm,
        vehicle_filter: vehicleFilter || null,
        min_rating: options?.minRating || 0.0,
        experience_filter: options?.experienceTier || null,
        delivery_mode: options?.deliveryMode || null,
      });

      if (!error && data && data.length > 0) {
        return data.map((m: any) => ({
          userId: m.mechanic_id,
          shopName: m.shop_name,
          shopAddress: m.shop_address,
          rating: Number(m.rating) || 5.0,
          reviewCount: m.review_count || 0,
          yearsOfExperience: m.years_of_experience || 5,
          experienceTier: m.experience_tier || 'standard',
          isVerified: m.is_verified ?? true,
          distanceKm: m.distance_km,
          lat: m.lat,
          lng: m.lng,
          estimatedMinutes: Math.max(5, Math.round(m.distance_km * 3.5 + 4)),
          startingPrice: 350,
          doorstepEnabled: m.doorstep_enabled ?? true,
          workshopVisitEnabled: m.workshop_visit_enabled ?? true,
          subscriptionWeight: m.subscription_weight || 1,
        }));
      }
    } catch (err) {
      console.warn('Supabase PostGIS query fallback to local calculation:', err);
    }
  }

  // Local PostGIS-Parity Distance Engine with Subscription Weighting
  const mechanics: any[] = getStorage(STORAGE_KEYS.MECHANICS, INITIAL_MECHANICS);
  const minRating = options?.minRating || 0;

  return mechanics
    .filter((m) => {
      if (options?.availableNow !== false && !m.isOnline) return false;
      if (vehicleFilter && !m.supportedVehicles.includes(vehicleFilter)) return false;
      if (options?.experienceTier && m.experienceTier !== options.experienceTier) return false;
      if (m.rating < minRating) return false;
      if (options?.deliveryMode === 'doorstep' && m.doorstepEnabled === false) return false;
      if (options?.deliveryMode === 'workshop_visit' && m.workshopVisitEnabled === false) return false;
      if (options?.searchQuery) {
        const q = options.searchQuery.toLowerCase();
        const matchName = m.shopName.toLowerCase().includes(q);
        const matchAddress = m.shopAddress.toLowerCase().includes(q);
        const matchSpecs = m.specializations?.some((s: string) => s.toLowerCase().includes(q));
        if (!matchName && !matchAddress && !matchSpecs) return false;
      }
      return true;
    })
    .map((m) => {
      const dist = calculateDistanceKm(userLat, userLng, m.lat, m.lng);
      return {
        ...m,
        distanceKm: dist,
        estimatedMinutes: Math.max(5, Math.round(dist * 3.5 + 4)),
        startingPrice: 350,
      };
    })
    .filter((m) => m.distanceKm <= radiusKm)
    .sort((a, b) => {
      // Prioritize by selected sorting option
      if (options?.sortBy === 'rating') return b.rating - a.rating;
      if (options?.sortBy === 'experience') return b.yearsOfExperience - a.yearsOfExperience;
      if (options?.sortBy === 'price') return a.startingPrice - b.startingPrice;
      // Default: Subscription Weight first, then distance
      const weightDiff = (b.subscriptionWeight || 1) - (a.subscriptionWeight || 1);
      if (weightDiff !== 0) return weightDiff;
      return a.distanceKm - b.distanceKm;
    });
}

// ==========================================
// 3. BOOKINGS & ASSISTANCE LIFECYCLE
// ==========================================
export async function createBreakdownRequest(data: {
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicle: Vehicle;
  category: ProblemCategory;
  description: string;
  location: { lat: number; lng: number };
  addressText: string;
  landmark: string;
  urgency: 'standard' | 'high' | 'critical';
  bookingType?: BookingType;
  deliveryMode?: ServiceDeliveryMode;
  scheduledAt?: string;
  pickupDrop?: boolean;
  voiceNoteUrl?: string;
  preferredMechanicId?: string;
}): Promise<BreakdownRequest> {
  const categoryMeta = SERVICE_CATEGORIES.find((c) => c.id === data.category);
  const cost = categoryMeta ? categoryMeta.estimatedPrice : 400;

  const newRequest: BreakdownRequest = {
    id: 'req_' + Math.random().toString(36).substr(2, 9),
    customerId: data.customerId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    vehicleId: data.vehicle.id,
    vehicleDetails: {
      make: data.vehicle.make,
      model: data.vehicle.model,
      licensePlate: data.vehicle.licensePlate,
      type: data.vehicle.type,
    },
    bookingType: data.bookingType || 'emergency_roadside',
    deliveryMode: data.deliveryMode || 'doorstep',
    scheduledAt: data.scheduledAt,
    pickupDrop: data.pickupDrop,
    voiceNoteUrl: data.voiceNoteUrl,
    category: data.category,
    description: data.description,
    location: data.location,
    addressText: data.addressText,
    landmark: data.landmark,
    status: data.preferredMechanicId ? 'accepted' : 'submitted',
    urgency: data.urgency,
    estimatedCost: cost,
    mechanicId: data.preferredMechanicId,
    mechanicName: data.preferredMechanicId ? 'Apex Speed Garage & Roadside Care' : undefined,
    mechanicPhone: data.preferredMechanicId ? '+91 98201 12345' : undefined,
    shopName: data.preferredMechanicId ? 'Apex Speed Garage & Roadside Care' : undefined,
    assignedAt: data.preferredMechanicId ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // If Supabase is connected, insert record
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('breakdown_requests').insert({
        id: newRequest.id,
        customer_id: newRequest.customerId,
        vehicle_id: newRequest.vehicleId,
        category: newRequest.category,
        description: newRequest.description,
        location: `POINT(${data.location.lng} ${data.location.lat})`,
        address_text: newRequest.addressText,
        landmark: newRequest.landmark,
        status: newRequest.status,
        urgency: newRequest.urgency,
        estimated_cost: newRequest.estimatedCost,
        mechanic_id: newRequest.mechanicId || null,
      });
    } catch (err) {
      console.warn('Supabase write fallback to local store:', err);
    }
  }

  // Deduct lead quota if mechanic was assigned
  if (newRequest.mechanicId) {
    deductLeadQuota(newRequest.mechanicId);
  }

  const current = getStorage<BreakdownRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_DEMO_REQUESTS);
  setStorage(STORAGE_KEYS.REQUESTS, [newRequest, ...current]);
  logAudit(data.customerId, 'CREATE_BOOKING', 'booking', newRequest.id, `Created ${newRequest.bookingType} booking`);

  return newRequest;
}

export const createBooking = createBreakdownRequest;
export const getBookings = getBreakdownRequests;
export const updateBookingStatus = updateRequestStatus;

export async function getBreakdownRequests(
  userId?: string,
  role?: 'customer' | 'mechanic' | 'admin' | 'support_agent'
): Promise<BreakdownRequest[]> {
  const all = getStorage<BreakdownRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_DEMO_REQUESTS);
  if (!userId || role === 'admin' || role === 'support_agent') return all;
  if (role === 'mechanic') {
    return all.filter((r) => r.mechanicId === userId || (!r.mechanicId && r.status === 'submitted'));
  }
  return all.filter((r) => r.customerId === userId);
}

export async function updateRequestStatus(
  requestId: string,
  newStatus: JobStatus,
  mechanicDetails?: { mechanicId: string; mechanicName: string; shopName: string; phone: string }
): Promise<BreakdownRequest | null> {
  const all = getStorage<BreakdownRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_DEMO_REQUESTS);
  const idx = all.findIndex((r) => r.id === requestId);
  if (idx === -1) return null;

  const updated: BreakdownRequest = {
    ...all[idx],
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  if (mechanicDetails) {
    updated.mechanicId = mechanicDetails.mechanicId;
    updated.mechanicName = mechanicDetails.mechanicName;
    updated.shopName = mechanicDetails.shopName;
    updated.mechanicPhone = mechanicDetails.phone;
    if (!updated.assignedAt) updated.assignedAt = new Date().toISOString();
  }

  if (newStatus === 'completed') {
    updated.completedAt = new Date().toISOString();
    updated.finalCost = updated.quote ? updated.quote.grandTotal : updated.estimatedCost;
    // Check and trigger mechanic incentive reward eligibility
    if (updated.mechanicId) {
      checkAndAwardMilestones(updated.mechanicId, requestId);
    }
  } else if (newStatus === 'cancelled') {
    updated.cancelledAt = new Date().toISOString();
  }

  all[idx] = updated;
  setStorage(STORAGE_KEYS.REQUESTS, all);
  logAudit(mechanicDetails?.mechanicId || 'system', 'UPDATE_BOOKING_STATUS', 'booking', requestId, `Status moved to ${newStatus}`);

  return updated;
}

// ==========================================
// 4. QUOTES & ITEMIZATION (Approval Engine)
// ==========================================
export async function submitQuote(
  bookingId: string,
  mechanicId: string,
  items: Omit<QuoteItem, 'id'>[],
  notes?: string
): Promise<Quote> {
  const totalLabour = items
    .filter((i) => i.itemType === 'labour')
    .reduce((sum, i) => sum + i.totalPrice, 0);
  const totalParts = items
    .filter((i) => i.itemType === 'part')
    .reduce((sum, i) => sum + i.totalPrice, 0);
  // Dynamic GST calculation based on item categorization:
  // - Labour & Towing Services: 18% (SAC 9987)
  // - Battery & Heavy Electrical Components: 28% (HSN 8507)
  // - Standard Mechanical Replacement Parts & Fluids: 18% (HSN 8708 / 2710)
  const taxAmount = items.reduce((sum, item) => {
    const isHeavyElectrical =
      item.itemType === 'part' &&
      (item.description.toLowerCase().includes('battery') ||
        item.description.toLowerCase().includes('relay') ||
        item.description.toLowerCase().includes('starter motor'));
    const rate = isHeavyElectrical ? 0.28 : 0.18;
    return sum + Math.round(item.totalPrice * rate);
  }, 0);
  const grandTotal = totalLabour + totalParts + taxAmount;

  const all = getStorage<BreakdownRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_DEMO_REQUESTS);
  const booking = all.find((b) => b.id === bookingId);

  const newQuote: Quote = {
    id: 'q_' + Math.random().toString(36).substr(2, 8),
    bookingId,
    mechanicId,
    customerId: booking?.customerId || 'cust_01',
    status: 'submitted',
    items: items.map((i) => ({ ...i, id: 'qi_' + Math.random().toString(36).substr(2, 6) })),
    totalLabour,
    totalParts,
    taxAmount,
    grandTotal,
    notes,
    createdAt: new Date().toISOString(),
  };

  if (booking) {
    booking.quote = newQuote;
    booking.status = 'quote_submitted';
    setStorage(STORAGE_KEYS.REQUESTS, all);
  }

  logAudit(mechanicId, 'SUBMIT_QUOTE', 'quote', newQuote.id, `Submitted quote of ₹${grandTotal}`);
  return newQuote;
}

export async function respondToQuote(
  bookingId: string,
  decision: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<BreakdownRequest | null> {
  const all = getStorage<BreakdownRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_DEMO_REQUESTS);
  const booking = all.find((b) => b.id === bookingId);
  if (!booking || !booking.quote) return null;

  booking.quote.status = decision;
  if (decision === 'approved') {
    booking.quote.approvedAt = new Date().toISOString();
    booking.status = 'work_in_progress';
  } else {
    booking.quote.rejectedAt = new Date().toISOString();
    booking.quote.customerRejectionReason = rejectionReason;
    booking.status = 'inspection';
  }

  setStorage(STORAGE_KEYS.REQUESTS, all);
  logAudit(booking.customerId, 'RESPOND_QUOTE', 'quote', booking.quote.id, `Customer ${decision} quote`);
  return booking;
}

// ==========================================
// 5. INVOICES, PAYMENTS & REFUNDS
// ==========================================
export async function generateInvoice(bookingId: string): Promise<Invoice> {
  const all = getStorage<BreakdownRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_DEMO_REQUESTS);
  const booking = all.find((b) => b.id === bookingId);
  const subtotal = booking?.quote ? booking.quote.totalLabour + booking.quote.totalParts : (booking?.estimatedCost || 400);
  const taxAmount = booking?.quote?.taxAmount ?? Math.round(subtotal * 0.18);
  const taxRate = Math.round((taxAmount / (subtotal || 1)) * 100);
  const grandTotal = subtotal + taxAmount;

  const invoice: Invoice = {
    id: 'inv_' + Math.random().toString(36).substr(2, 8),
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    bookingId,
    customerId: booking?.customerId || 'cust_01',
    customerName: booking?.customerName || 'Rahul Verma',
    mechanicId: booking?.mechanicId || 'mech_01',
    mechanicShopName: booking?.shopName || 'Apex Speed Garage',
    items: booking?.quote?.items || [
      { id: 'item_1', itemType: 'labour', description: 'Roadside Diagnostic & Service', quantity: 1, unitPrice: subtotal, totalPrice: subtotal }
    ],
    subtotal,
    taxRate,
    taxAmount,
    discountAmount: 0,
    grandTotal,
    gstNumber: '27AABCM8821M1Z5',
    status: 'issued',
    createdAt: new Date().toISOString(),
  };

  const invoices = getStorage<Invoice[]>(STORAGE_KEYS.INVOICES, []);
  setStorage(STORAGE_KEYS.INVOICES, [invoice, ...invoices]);
  return invoice;
}

export async function processPayment(
  bookingId: string,
  amount: number,
  method: PaymentMethod,
  transactionRef?: string
): Promise<PaymentRecord> {
  const newPayment: PaymentRecord = {
    id: 'pay_' + Math.random().toString(36).substr(2, 8),
    bookingId,
    customerId: 'cust_01',
    amount,
    currency: 'INR',
    method,
    status: 'success',
    transactionRef: transactionRef || 'TXN_' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  const payments = getStorage<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, []);
  setStorage(STORAGE_KEYS.PAYMENTS, [newPayment, ...payments]);

  await updateRequestStatus(bookingId, 'paid');
  logAudit(newPayment.customerId, 'PROCESS_PAYMENT', 'payment', newPayment.id, `Paid ₹${amount} via ${method}`);
  return newPayment;
}

export async function requestRefund(
  bookingId: string,
  amount: number,
  reason: string
): Promise<RefundRecord> {
  const newRefund: RefundRecord = {
    id: 'ref_' + Math.random().toString(36).substr(2, 8),
    paymentId: 'pay_init',
    bookingId,
    customerId: 'cust_01',
    amount,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const refunds = getStorage<RefundRecord[]>(STORAGE_KEYS.REFUNDS, []);
  setStorage(STORAGE_KEYS.REFUNDS, [newRefund, ...refunds]);
  logAudit(newRefund.customerId, 'REQUEST_REFUND', 'refund', newRefund.id, `Refund requested for ₹${amount}`);
  return newRefund;
}

export async function approveRefund(refundId: string, adminId: string): Promise<void> {
  const refunds = getStorage<RefundRecord[]>(STORAGE_KEYS.REFUNDS, []);
  const ref = refunds.find((r) => r.id === refundId);
  if (ref) {
    ref.status = 'approved';
    ref.approvedBy = adminId;
    ref.processedAt = new Date().toISOString();
    setStorage(STORAGE_KEYS.REFUNDS, refunds);
    logAudit(adminId, 'APPROVE_REFUND', 'refund', refundId, `Approved refund of ₹${ref.amount}`);
  }
}

// ==========================================
// 6. MECHANIC SUBSCRIPTION ENGINE
// ==========================================
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return getStorage<SubscriptionPlan[]>(STORAGE_KEYS.PLANS, DEFAULT_SUBSCRIPTION_PLANS);
}

export async function saveSubscriptionPlan(plan: SubscriptionPlan): Promise<void> {
  const plans = getStorage<SubscriptionPlan[]>(STORAGE_KEYS.PLANS, DEFAULT_SUBSCRIPTION_PLANS);
  const idx = plans.findIndex((p) => p.id === plan.id);
  if (idx !== -1) {
    plans[idx] = plan;
  } else {
    plans.push(plan);
  }
  setStorage(STORAGE_KEYS.PLANS, plans);
}

export async function getMechanicSubscription(mechanicId: string): Promise<MechanicSubscription> {
  const subs = getStorage<MechanicSubscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
  const found = subs.find((s) => s.mechanicId === mechanicId);
  if (found) return found;

  // Default to Pro plan for demo mechanic
  return {
    id: 'sub_' + mechanicId,
    mechanicId,
    planId: 'plan_pro',
    billingCycle: 'monthly',
    currentPeriodStart: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString(),
    autoRenew: true,
    status: 'active',
    leadQuotaRemaining: 68,
  };
}

export async function purchaseSubscription(
  mechanicId: string,
  planId: string,
  billingCycle: 'monthly' | 'quarterly' | 'yearly'
): Promise<MechanicSubscription> {
  const plans = await getSubscriptionPlans();
  const plan = plans.find((p) => p.id === planId) || plans[0];
  const days = billingCycle === 'yearly' ? 365 : billingCycle === 'quarterly' ? 90 : 30;

  const newSub: MechanicSubscription = {
    id: 'sub_' + Math.random().toString(36).substr(2, 8),
    mechanicId,
    planId,
    billingCycle,
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + days * 24 * 3600 * 1000).toISOString(),
    autoRenew: true,
    status: 'active',
    leadQuotaRemaining: plan.leadQuotaMonthly,
  };

  const subs = getStorage<MechanicSubscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
  const filtered = subs.filter((s) => s.mechanicId !== mechanicId);
  setStorage(STORAGE_KEYS.SUBSCRIPTIONS, [newSub, ...filtered]);

  // Update mechanic profile with plan tier
  const mechanics = getStorage<any[]>(STORAGE_KEYS.MECHANICS, INITIAL_MECHANICS);
  const mech = mechanics.find((m) => m.userId === mechanicId);
  if (mech) {
    mech.subscriptionTier = plan.tier;
    mech.subscriptionWeight = plan.searchRankingWeight;
    setStorage(STORAGE_KEYS.MECHANICS, mechanics);
  }

  logAudit(mechanicId, 'PURCHASE_SUBSCRIPTION', 'subscription', newSub.id, `Upgraded to ${plan.name}`);
  return newSub;
}

export function deductLeadQuota(mechanicId: string): void {
  const subs = getStorage<MechanicSubscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
  const sub = subs.find((s) => s.mechanicId === mechanicId);
  if (sub && sub.leadQuotaRemaining > 0) {
    sub.leadQuotaRemaining -= 1;
    setStorage(STORAGE_KEYS.SUBSCRIPTIONS, subs);
  }
}

// ==========================================
// 7. INCENTIVES, REWARDS & LOYALTY ENGINE
// ==========================================
export async function getIncentiveRules(): Promise<IncentiveRule[]> {
  return getStorage<IncentiveRule[]>(STORAGE_KEYS.INCENTIVE_RULES, DEFAULT_INCENTIVE_RULES);
}

export async function saveIncentiveRule(rule: IncentiveRule): Promise<void> {
  const rules = getStorage<IncentiveRule[]>(STORAGE_KEYS.INCENTIVE_RULES, DEFAULT_INCENTIVE_RULES);
  const idx = rules.findIndex((r) => r.id === rule.id);
  if (idx !== -1) {
    rules[idx] = rule;
  } else {
    rules.push(rule);
  }
  setStorage(STORAGE_KEYS.INCENTIVE_RULES, rules);
}

export async function getRewardLedger(mechanicId?: string): Promise<RewardLedgerItem[]> {
  const ledger = getStorage<RewardLedgerItem[]>(STORAGE_KEYS.REWARD_LEDGER, [
    {
      id: 'rw_01',
      mechanicId: 'mech_01',
      mechanicName: 'Rajesh Sharma',
      ruleCode: 'MILESTONE_10',
      rewardAmount: 500,
      status: 'credited',
      notes: 'Completed 10 breakdown assistance jobs this week',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'rw_02',
      mechanicId: 'mech_01',
      mechanicName: 'Rajesh Sharma',
      ruleCode: 'RATING_4_5_BONUS',
      rewardAmount: 1000,
      status: 'credited',
      notes: 'Maintained 4.9 rating across 25 verified completed jobs',
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    },
  ]);
  if (!mechanicId) return ledger;
  return ledger.filter((r) => r.mechanicId === mechanicId);
}

export async function creditReward(
  mechanicId: string,
  ruleCode: string,
  rewardAmount: number,
  notes: string,
  bookingId?: string
): Promise<RewardLedgerItem> {
  const newReward: RewardLedgerItem = {
    id: 'rw_' + Math.random().toString(36).substr(2, 8),
    mechanicId,
    ruleCode,
    rewardAmount,
    status: 'credited',
    notes,
    createdAt: new Date().toISOString(),
  };

  const ledger = getStorage<RewardLedgerItem[]>(STORAGE_KEYS.REWARD_LEDGER, []);
  setStorage(STORAGE_KEYS.REWARD_LEDGER, [newReward, ...ledger]);
  logAudit('system', 'CREDIT_REWARD', 'reward', newReward.id, `Credited ₹${rewardAmount} to mechanic ${mechanicId}`);
  return newReward;
}

export function checkAndAwardMilestones(mechanicId: string, bookingId: string): void {
  // Fraud detection check: ensure no duplicate reward in the last hour
  const ledger = getStorage<RewardLedgerItem[]>(STORAGE_KEYS.REWARD_LEDGER, []);
  const recentMilestone = ledger.find(
    (l) => l.mechanicId === mechanicId && l.ruleCode === 'PEAK_NIGHT_BONUS' &&
    Date.now() - new Date(l.createdAt).getTime() < 3600 * 1000
  );

  const currentHour = new Date().getHours();
  if (!recentMilestone && (currentHour >= 23 || currentHour <= 5)) {
    creditReward(mechanicId, 'PEAK_NIGHT_BONUS', 200, 'Night emergency highway bonus', bookingId);
  }
}

export async function getMechanicLoyalty(mechanicId: string): Promise<MechanicLoyalty> {
  return {
    mechanic_id: mechanicId,
    tier: 'platinum',
    total_points: 1480,
    lifetime_jobs: 480,
    maintained_rating: 4.9,
    commission_discount_pct: 5.0,
    updated_at: new Date().toISOString(),
  };
}

// ==========================================
// 8. SUPPORT AGENT TICKETING & SLA TRACKER
// ==========================================
export async function getSupportTickets(
  status?: string,
  category?: string
): Promise<SupportTicket[]> {
  const tickets = getStorage<SupportTicket[]>(STORAGE_KEYS.TICKETS, DEFAULT_SUPPORT_TICKETS);
  return tickets.filter((t) => {
    if (status && status !== 'all' && t.status !== status) return false;
    if (category && category !== 'all' && t.category !== category) return false;
    return true;
  });
}

export async function getSupportTicketById(ticketId: string): Promise<SupportTicket | null> {
  const tickets = await getSupportTickets();
  return tickets.find((t) => t.id === ticketId) || null;
}

export async function updateTicketStatus(
  ticketId: string,
  newStatus: any,
  agentId?: string
): Promise<SupportTicket | null> {
  const tickets = getStorage<SupportTicket[]>(STORAGE_KEYS.TICKETS, DEFAULT_SUPPORT_TICKETS);
  const t = tickets.find((tk) => tk.id === ticketId);
  if (!t) return null;

  t.status = newStatus;
  t.updatedAt = new Date().toISOString();
  if (agentId) t.assignedAgentId = agentId;
  if (newStatus === 'resolved' || newStatus === 'closed') {
    t.resolvedAt = new Date().toISOString();
  }
  setStorage(STORAGE_KEYS.TICKETS, tickets);
  logAudit(agentId || 'support', 'UPDATE_TICKET', 'ticket', ticketId, `Ticket moved to ${newStatus}`);
  return t;
}

export async function addTicketNote(
  ticketId: string,
  agentId: string,
  agentName: string,
  noteText: string
): Promise<void> {
  const tickets = getStorage<SupportTicket[]>(STORAGE_KEYS.TICKETS, DEFAULT_SUPPORT_TICKETS);
  const t = tickets.find((tk) => tk.id === ticketId);
  if (t) {
    if (!t.internalNotes) t.internalNotes = [];
    t.internalNotes.push(`[${new Date().toLocaleTimeString()} by ${agentName}]: ${noteText}`);
    setStorage(STORAGE_KEYS.TICKETS, tickets);
    logAudit(agentId, 'ADD_TICKET_NOTE', 'ticket', ticketId, `Added note to ticket ${t.ticketNumber}`);
  }
}

// ==========================================
// 9. IN-APP REALTIME CHAT MESSAGING
// ==========================================
export async function getChatMessages(bookingId: string): Promise<ChatMessage[]> {
  const all = getStorage<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, [
    {
      id: 'm1',
      bookingId: 'req_live_01',
      senderId: 'mech_01',
      senderRole: 'mechanic',
      senderName: 'Rajesh Sharma',
      message: 'Hello Rahul ji! I have taken the Bandra flyover, ETA 8 minutes with tyre patch kit.',
      createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    },
    {
      id: 'm2',
      bookingId: 'req_live_01',
      senderId: 'cust_01',
      senderRole: 'customer',
      senderName: 'Rahul Verma',
      message: 'Thanks Rajesh! I am parked right next to lane 4 toll booth with hazard lights on.',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  ]);
  return all.filter((m) => m.bookingId === bookingId);
}

export async function sendChatMessage(
  bookingId: string,
  senderId: string,
  senderRole: UserRole,
  senderName: string,
  message: string
): Promise<ChatMessage> {
  const newMsg: ChatMessage = {
    id: 'm_' + Math.random().toString(36).substr(2, 8),
    bookingId,
    senderId,
    senderRole,
    senderName,
    message,
    createdAt: new Date().toISOString(),
  };

  const all = getStorage<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, []);
  setStorage(STORAGE_KEYS.CHAT_MESSAGES, [...all, newMsg]);
  return newMsg;
}

// ==========================================
// 10. SERVICE REMINDERS (PUC, Insurance, Oil)
// ==========================================
export async function getServiceReminders(customerId: string): Promise<ServiceReminder[]> {
  const reminders = getStorage<ServiceReminder[]>(STORAGE_KEYS.REMINDERS, INITIAL_DEMO_REMINDERS);
  return reminders.filter((r) => r.customerId === customerId);
}

export async function addServiceReminder(
  reminder: Omit<ServiceReminder, 'id' | 'status'>
): Promise<ServiceReminder> {
  const newRem: ServiceReminder = {
    ...reminder,
    id: 'rem_' + Math.random().toString(36).substr(2, 8),
    status: 'pending',
  };
  const reminders = getStorage<ServiceReminder[]>(STORAGE_KEYS.REMINDERS, INITIAL_DEMO_REMINDERS);
  setStorage(STORAGE_KEYS.REMINDERS, [newRem, ...reminders]);
  return newRem;
}

// ==========================================
// 11. SERVICEABILITY ZONES & COUPONS
// ==========================================
export async function getServiceabilityZones(): Promise<ServiceabilityZone[]> {
  return getStorage<ServiceabilityZone[]>(STORAGE_KEYS.ZONES, DEFAULT_SERVICEABILITY_ZONES);
}

export async function saveServiceabilityZone(zone: ServiceabilityZone): Promise<void> {
  const zones = getStorage<ServiceabilityZone[]>(STORAGE_KEYS.ZONES, DEFAULT_SERVICEABILITY_ZONES);
  const idx = zones.findIndex((z) => z.id === zone.id);
  if (idx !== -1) {
    zones[idx] = zone;
  } else {
    zones.push(zone);
  }
  setStorage(STORAGE_KEYS.ZONES, zones);
}

export async function getCoupons(): Promise<Coupon[]> {
  return DEFAULT_COUPONS;
}

// ==========================================
// 12. ADMIN PLATFORM METRICS & AUDIT LOGS
// ==========================================
export interface AdminMetrics {
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  activeMechanics: number;
  activeCustomers: number;
  cancellationRatePct: number;
  averageRating: number;
  subscriptionRevenue: number;
  commissionRevenue: number;
  pendingDisputes: number;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const requests = getStorage<BreakdownRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_DEMO_REQUESTS);
  const mechanics = getStorage<any[]>(STORAGE_KEYS.MECHANICS, INITIAL_MECHANICS);

  const completed = requests.filter((r) => r.status === 'completed' || r.status === 'paid');
  const revenue = completed.reduce((sum, r) => sum + (r.finalCost || r.estimatedCost), 0);

  return {
    totalBookings: requests.length,
    activeBookings: requests.filter((r) => r.status !== 'completed' && r.status !== 'cancelled' && r.status !== 'paid').length,
    totalRevenue: revenue,
    activeMechanics: mechanics.filter((m) => m.isOnline).length,
    activeCustomers: 1250,
    cancellationRatePct: 4.2,
    averageRating: 4.88,
    subscriptionRevenue: 48900,
    commissionRevenue: Math.round(revenue * 0.12),
    pendingDisputes: 2,
  };
}

export async function getAllMechanics(): Promise<any[]> {
  return getStorage<any[]>(STORAGE_KEYS.MECHANICS, INITIAL_MECHANICS);
}

export async function updateMechanicVerification(
  mechanicId: string,
  status: any,
  reason?: string
): Promise<void> {
  const mechanics = getStorage<any[]>(STORAGE_KEYS.MECHANICS, INITIAL_MECHANICS);
  const mech = mechanics.find((m) => m.userId === mechanicId);
  if (mech) {
    mech.verificationStatus = status;
    mech.verificationReason = reason;
    setStorage(STORAGE_KEYS.MECHANICS, mechanics);
    logAudit('admin_ops', 'UPDATE_KYC', 'mechanic', mechanicId, `Verification status set to ${status}`);
  }
}

export function logAudit(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: string
): void {
  const logs = getStorage<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  const newEntry: AuditLogEntry = {
    id: 'aud_' + Math.random().toString(36).substr(2, 8),
    userId,
    action,
    entityType,
    entityId,
    details,
    createdAt: new Date().toISOString(),
  };
  setStorage(STORAGE_KEYS.AUDIT_LOGS, [newEntry, ...logs.slice(0, 100)]);
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  return getStorage<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
}

// ==========================================
// 13. VEHICLES & GARAGE
// ==========================================
export async function getVehicles(userId: string): Promise<Vehicle[]> {
  const all = getStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_DEMO_VEHICLES);
  return all.filter((v) => v.userId === userId || !v.userId);
}

export async function addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
  const newVehicle: Vehicle = {
    ...vehicle,
    id: 'veh_' + Math.random().toString(36).substr(2, 9),
  };
  const current = getStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_DEMO_VEHICLES);
  setStorage(STORAGE_KEYS.VEHICLES, [newVehicle, ...current]);
  return newVehicle;
}

export async function submitReview(
  requestId: string,
  rating: number,
  comment: string
): Promise<void> {
  const all = getStorage<BreakdownRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_DEMO_REQUESTS);
  const req = all.find((r) => r.id === requestId);
  if (req) {
    req.rating = rating;
    req.reviewComment = comment;
    setStorage(STORAGE_KEYS.REQUESTS, all);
  }
}

// ==========================================
// 14. AUTH & SESSION STATE
// ==========================================
export interface AuthSession {
  user: Profile | null;
  role: UserRole | null;
}

export const DEMO_CUSTOMER: Profile = {
  id: 'cust_01',
  fullName: 'Rahul Verma',
  phoneNumber: '+91 98765 43210',
  email: 'rahul.verma@example.com',
  role: 'customer',
  createdAt: '2025-01-10T09:00:00Z',
};

export const DEMO_MECHANIC: Profile = {
  id: 'mech_01',
  fullName: 'Rajesh Sharma',
  phoneNumber: '+91 98201 12345',
  email: 'rajesh.sharma@apexgarage.com',
  role: 'mechanic',
  createdAt: '2024-11-05T08:30:00Z',
};

export const DEMO_ADMIN: Profile = {
  id: 'admin_01',
  fullName: 'Vikramaditya Rao',
  phoneNumber: '+91 98000 11111',
  email: 'admin@mechfind.com',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00Z',
};

export const DEMO_SUPPORT_AGENT: Profile = {
  id: 'agent_01',
  fullName: 'Pooja Iyer (Support Ops)',
  phoneNumber: '+91 98000 22222',
  email: 'pooja.support@mechfind.com',
  role: 'support_agent',
  createdAt: '2024-06-01T00:00:00Z',
};

export function getCurrentSession(): AuthSession {
  if (typeof window === 'undefined') {
    return { user: DEMO_CUSTOMER, role: 'customer' };
  }
  const user = getStorage<Profile | null>(STORAGE_KEYS.CURRENT_USER, DEMO_CUSTOMER);
  return {
    user,
    role: user ? user.role : null,
  };
}

export function setSessionUser(user: Profile | null): void {
  setStorage(STORAGE_KEYS.CURRENT_USER, user);
}
