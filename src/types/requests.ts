import { Vehicle } from './customer';
import { NearbyMechanic } from './mechanic';

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

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  address?: string;
  landmark?: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  type: 'labour' | 'part';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  bookingId: string;
  mechanicId: string;
  items: QuoteItem[];
  subtotal: number;
  labourTotal: number;
  partsTotal: number;
  tax: number;
  grandTotal: number;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  rejectedAt?: string;
  customerRejectionReason?: string;
  createdAt: string;
}

export interface BreakdownRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicle: Vehicle;
  category: ProblemCategory;
  categoryName: string;
  description: string;
  photos: string[];
  location: LocationCoordinates;
  status: JobStatus;
  urgency: 'high' | 'critical' | 'standard';
  estimatedCost: number;
  finalCost?: number;
  mechanicId?: string;
  mechanic?: NearbyMechanic;
  assignedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  etaMinutes?: number;
  rating?: number;
  reviewComment?: string;
  bookingType?: BookingType;
  deliveryMode?: ServiceDeliveryMode;
  scheduledAt?: string;
  quote?: Quote;
}

