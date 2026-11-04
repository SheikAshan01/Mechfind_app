import { VerificationStatus } from './auth';

export interface MechanicReview {
  id: string;
  jobId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface NearbyMechanic {
  id: string;
  fullName: string;
  shopName: string;
  shopAddress: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  completedJobsCount: number;
  yearsOfExperience: number;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  isOnline: boolean;
  distanceKm: number;
  estimatedArrivalMinutes: number;
  latitude: number;
  longitude: number;
  vehicleTypes: ('bike' | 'car' | 'truck')[];
  specializations: string[];
  pricingStartingAt: number;
  phoneNumber: string;
  workingHours: string;
  reviews?: MechanicReview[];
  experienceTier?: 'standard' | 'experienced' | 'expert';
  subscriptionTier?: 'free' | 'pro' | 'premium';
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  doorstepEnabled?: boolean;
  workshopVisitEnabled?: boolean;
}

