import {
  phoneSchema,
  otpSchema,
  customerSignupSchema,
  vehicleSchema,
  breakdownRequestSchema,
} from '../../src/schemas/authSchemas';

describe('MECHFIND Form & Validation Schemas', () => {
  describe('Phone Number Validation', () => {
    it('accepts valid 10-digit phone numbers', () => {
      const res = phoneSchema.safeParse('9876543210');
      expect(res.success).toBe(true);
    });

    it('rejects short phone numbers under 10 digits', () => {
      const res = phoneSchema.safeParse('12345');
      expect(res.success).toBe(false);
    });

    it('rejects letters in phone numbers', () => {
      const res = phoneSchema.safeParse('98765ABCDE');
      expect(res.success).toBe(false);
    });
  });

  describe('OTP Code Validation', () => {
    it('accepts exact 6 digit codes', () => {
      const res = otpSchema.safeParse('123456');
      expect(res.success).toBe(true);
    });

    it('rejects codes shorter or longer than 6 digits', () => {
      expect(otpSchema.safeParse('12345').success).toBe(false);
      expect(otpSchema.safeParse('1234567').success).toBe(false);
    });

    it('rejects non-numeric characters', () => {
      expect(otpSchema.safeParse('12A456').success).toBe(false);
    });
  });

  describe('Customer Sign Up Validation', () => {
    it('validates a correct motorist profile payload', () => {
      const res = customerSignupSchema.safeParse({
        fullName: 'Arjun Kapoor',
        phoneNumber: '9876543210',
        email: 'arjun@example.com',
        password: 'Password123!',
      });
      expect(res.success).toBe(true);
    });

    it('fails when email is malformed', () => {
      const res = customerSignupSchema.safeParse({
        fullName: 'Arjun Kapoor',
        phoneNumber: '9876543210',
        email: 'not-an-email',
        password: 'Password123!',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('Vehicle Schema Validation', () => {
    it('validates a car entry properly', () => {
      const res = vehicleSchema.safeParse({
        type: 'car',
        make: 'Hyundai',
        model: 'Creta SX',
        year: 2022,
        licensePlate: 'MH 02 EE 4092',
        fuelType: 'petrol',
        color: 'White',
      });
      expect(res.success).toBe(true);
    });

    it('fails when year is unrealistic', () => {
      const res = vehicleSchema.safeParse({
        type: 'car',
        make: 'Hyundai',
        model: 'Creta SX',
        year: 1950,
        licensePlate: 'MH 02 EE 4092',
        fuelType: 'petrol',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('Breakdown Request Validation', () => {
    it('validates breakdown request with proper landmark', () => {
      const res = breakdownRequestSchema.safeParse({
        vehicleId: 'veh_01',
        category: 'flat_tyre',
        description: 'Punctured rear tyre after hitting a pothole near toll plaza',
        landmark: 'Near Sea Link Toll Plaza Entry',
        urgency: 'high',
      });
      expect(res.success).toBe(true);
    });

    it('rejects too short description under 10 chars', () => {
      const res = breakdownRequestSchema.safeParse({
        vehicleId: 'veh_01',
        category: 'flat_tyre',
        description: 'flat',
        landmark: 'Highway',
        urgency: 'high',
      });
      expect(res.success).toBe(false);
    });
  });
});

