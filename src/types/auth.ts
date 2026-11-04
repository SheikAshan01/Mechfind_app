export type UserRole = 'customer' | 'mechanic';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface BaseUser {
  id: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerUser extends BaseUser {
  role: 'customer';
  defaultVehicleId?: string;
  emergencyContact?: string;
}

export interface MechanicUser extends BaseUser {
  role: 'mechanic';
  shopName: string;
  shopAddress: string;
  yearsOfExperience: number;
  verificationStatus: VerificationStatus;
  verificationReason?: string;
  isOnline: boolean;
  serviceRadiusKm: number;
  vehicleTypes: ('bike' | 'car' | 'truck' | 'heavy')[];
  specializations: string[];
  documents: {
    idProofUrl?: string;
    tradeLicenseUrl?: string;
    workshopPhotoUrl?: string;
  };
  rating: number;
  reviewCount: number;
  completedJobsCount: number;
  currentLatitude?: number;
  currentLongitude?: number;
}

export type AuthUser = CustomerUser | MechanicUser;

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

export interface LoginCredentials {
  phoneNumber: string;
  password?: string;
  otp?: string;
}

