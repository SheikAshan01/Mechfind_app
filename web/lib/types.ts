export type UserRole = 'customer' | 'mechanic' | 'admin' | 'support_agent';
export type VerificationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'suspended';
export type VehicleType = 'car' | 'bike' | 'truck' | 'heavy';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'cng' | 'hybrid';

export type ProblemCategory =
  | 'flat_tyre'
  | 'battery_jumpstart'
  | 'engine_overheating'
  | 'fuel_delivery'
  | 'towing_service'
  | 'brake_failure'
  | 'lockout'
  | 'general_diagnostics'
  | 'ac_service'
  | 'oil_change'
  | 'custom_repair';

export type JobStatus =
  | 'requested'
  | 'submitted'
  | 'accepted'
  | 'heading_to_customer'
  | 'arrived'
  | 'inspection'
  | 'quote_submitted'
  | 'quote_approved'
  | 'work_in_progress'
  | 'completed'
  | 'paid'
  | 'disputed'
  | 'cancelled';

export type BookingType = 'instant' | 'scheduled' | 'emergency_roadside';
export type ServiceDeliveryMode = 'doorstep' | 'workshop_visit';
export type UrgencyLevel = 'standard' | 'high' | 'critical';
export type QuoteStatus = 'draft' | 'submitted' | 'approved' | 'rejected';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cash';
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type SubscriptionTier = 'free' | 'pro' | 'premium';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed';
export type ExperienceTier = 'standard' | 'experienced' | 'expert';

export interface Profile {
  id: string;
  phoneNumber: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface CustomerProfile {
  userId: string;
  emergencyContact?: string;
  preferredPaymentMethod: 'cash' | 'upi' | 'card';
  favouriteMechanicIds?: string[];
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: string;
  addressText: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface MechanicProfile {
  userId: string;
  shopName: string;
  shopAddress: string;
  yearsOfExperience: number;
  experienceTier: ExperienceTier;
  verificationStatus: VerificationStatus;
  verificationReason?: string;
  isOnline: boolean;
  serviceRadiusKm: number;
  supportedVehicles: VehicleType[];
  specializations: string[];
  currentLocation?: {
    lat: number;
    lng: number;
  };
  workingHoursStart?: string;
  workingHoursEnd?: string;
  doorstepEnabled?: boolean;
  workshopVisitEnabled?: boolean;
  rating: number;
  reviewCount: number;
  completedJobsCount: number;
  phoneNumber?: string;
  subscriptionTier?: SubscriptionTier;
  subscriptionWeight?: number;
  loyaltyTier?: LoyaltyTier;
  bankAccount?: string;
  upiVpa?: string;
  workshopPhotos?: string[];
  certifications?: string[];
}

export interface Vehicle {
  id: string;
  userId: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  fuelType: FuelType;
  color?: string;
  isDefault: boolean;
}

export interface QuoteItem {
  id: string;
  quoteId?: string;
  itemType: 'labour' | 'part';
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quote {
  id: string;
  bookingId: string;
  mechanicId: string;
  customerId: string;
  status: QuoteStatus;
  items: QuoteItem[];
  totalLabour: number;
  totalParts: number;
  taxAmount: number;
  grandTotal: number;
  notes?: string;
  customerRejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
}

export interface BreakdownRequest {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  vehicleId: string;
  vehicleDetails?: {
    make: string;
    model: string;
    licensePlate: string;
    type: VehicleType;
  };
  bookingType: BookingType;
  deliveryMode: ServiceDeliveryMode;
  scheduledAt?: string;
  pickupDrop?: boolean;
  voiceNoteUrl?: string;
  category: ProblemCategory;
  categoryName?: string;
  vehicle?: Vehicle;
  mechanic?: any;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  addressText: string;
  landmark: string;
  status: JobStatus;
  urgency: UrgencyLevel;
  estimatedCost: number;
  finalCost?: number;
  etaMinutes?: number;
  estimatedMinutes?: number;
  quote?: Quote;
  invoiceId?: string;
  mechanicId?: string;
  mechanicName?: string;
  mechanicPhone?: string;
  shopName?: string;
  assignedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  reviewComment?: string;
  disputeReason?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  mechanicId: string;
  mechanicShopName: string;
  items: QuoteItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  gstNumber?: string;
  pdfUrl?: string;
  status: 'issued' | 'paid' | 'void';
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  invoiceId?: string;
  customerId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef: string;
  createdAt: string;
}

export interface RefundRecord {
  id: string;
  paymentId: string;
  bookingId: string;
  customerId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  approvedBy?: string;
  processedAt?: string;
  createdAt: string;
}

export interface PayoutRecord {
  id: string;
  mechanicId: string;
  amount: number;
  status: PayoutStatus;
  payoutMethod: 'bank_transfer' | 'upi';
  referenceId: string;
  processedAt?: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  tier: SubscriptionTier;
  monthlyPrice: number;
  quarterlyPrice: number;
  yearlyPrice: number;
  leadQuotaMonthly: number;
  searchRankingWeight: number;
  commissionRatePct: number;
  instantBookingEligible: boolean;
  priorityDispatch: boolean;
  isActive: boolean;
}

export interface MechanicSubscription {
  id: string;
  mechanicId: string;
  planId: string;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
  status: 'active' | 'grace_period' | 'cancelled' | 'expired';
  leadQuotaRemaining: number;
}

export interface IncentiveRule {
  id: string;
  name: string;
  code: string;
  rewardType: 'milestone' | 'rating_bonus' | 'peak_hour' | 'emergency' | 'referral';
  rewardAmount: number;
  criteriaDescription: string;
  startDate: string;
  endDate: string;
  maxRewardCap?: number;
  isActive: boolean;
}

export interface RewardLedgerItem {
  id: string;
  mechanicId: string;
  mechanicName?: string;
  ruleCode: string;
  rewardAmount: number;
  status: 'pending' | 'credited' | 'reversed' | 'flagged_fraud';
  notes: string;
  createdAt: string;
}

export interface MechanicLoyalty {
  mechanic_id: string;
  tier: LoyaltyTier;
  total_points: number;
  lifetime_jobs: number;
  maintained_rating: number;
  commission_discount_pct: number;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerId?: string;
  customerName?: string;
  mechanicId?: string;
  mechanicName?: string;
  bookingId?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  category: 'booking_complaint' | 'refund_request' | 'dispute' | 'payment_issue' | 'kyc_document';
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  slaDeadline: string;
  resolvedAt?: string;
  internalNotes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  isInternalNote: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  message: string;
  mediaUrl?: string;
  readAt?: string;
  createdAt: string;
}

export interface ServiceReminder {
  id: string;
  customerId: string;
  vehicleId: string;
  vehicleName: string;
  reminderType: 'general_service' | 'insurance_expiry' | 'puc_expiry' | 'oil_change';
  dueDate: string;
  status: 'pending' | 'notified' | 'dismissed';
  notes?: string;
}

export interface ServiceabilityZone {
  id: string;
  cityName: string;
  stateName: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minBookingValue: number;
  maxDiscount?: number;
  maxUses: number;
  usesCount: number;
  validUntil: string;
  isActive: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress?: string;
  details: string;
  createdAt: string;
}

export interface ServiceCategoryMeta {
  id: ProblemCategory;
  name: string;
  description: string;
  estimatedPrice: number;
  estimatedTimeMin: number;
  icon: string;
  popular?: boolean;
}
