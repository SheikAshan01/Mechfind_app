import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must not exceed 15 digits')
  .regex(/^[0-9+\s\-()]+$/, 'Please enter a valid phone number');

export const otpSchema = z
  .string()
  .length(6, 'Verification code must be exactly 6 digits')
  .regex(/^\d{6}$/, 'Code must contain only digits');

export const customerLoginSchema = z.object({
  phoneNumber: phoneSchema,
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export const customerSignupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required (at least 2 characters)'),
  phoneNumber: phoneSchema,
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters with numbers and letters'),
});

export const mechanicSignupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: phoneSchema,
  email: z.string().email('Valid email is required'),
  shopName: z.string().min(2, 'Workshop or garage name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const mechanicRegistrationSchema = z.object({
  shopName: z.string().min(2, 'Shop name is required'),
  shopAddress: z.string().min(5, 'Complete workshop address is required'),
  yearsOfExperience: z.number().min(0, 'Experience must be 0 or more').max(60, 'Invalid experience'),
  serviceRadiusKm: z.number().min(1, 'Service radius must be at least 1 km').max(50, 'Max service radius is 50 km'),
  vehicleTypes: z.array(z.enum(['bike', 'car', 'truck', 'heavy'])).min(1, 'Select at least one vehicle category'),
  specializations: z.array(z.string()).min(1, 'Select at least one specialty'),
});

export const vehicleSchema = z.object({
  type: z.enum(['car', 'bike', 'commercial']),
  make: z.string().min(1, 'Vehicle make is required (e.g. Toyota, Honda)'),
  model: z.string().min(1, 'Model is required (e.g. Corolla, Activa)'),
  year: z.number().min(1980, 'Year must be 1980 or newer').max(new Date().getFullYear() + 1, 'Invalid future year'),
  licensePlate: z.string().min(3, 'Registration / license plate is required').max(15, 'License plate too long'),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'cng', 'hybrid']),
  color: z.string().optional(),
});

export const breakdownRequestSchema = z.object({
  vehicleId: z.string().min(1, 'Please select a vehicle'),
  category: z.enum([
    'flat_tyre',
    'battery_jumpstart',
    'engine_overheating',
    'fuel_delivery',
    'towing_service',
    'brake_failure',
    'lockout',
    'general_diagnostics',
  ]),
  description: z.string().min(10, 'Please describe what happened (at least 10 characters)'),
  landmark: z.string().min(2, 'Landmark is required to help mechanic locate you quickly'),
  urgency: z.enum(['standard', 'high', 'critical']),
});

