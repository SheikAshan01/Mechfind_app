export type VehicleType = 'car' | 'bike' | 'commercial';

export type FuelType = 'petrol' | 'diesel' | 'electric' | 'cng' | 'hybrid';

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
  createdAt: string;
}

