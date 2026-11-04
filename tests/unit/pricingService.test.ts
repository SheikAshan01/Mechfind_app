import { pricingService, OFFICIAL_LAUNCH_PRICING } from '../../src/services/pricing/pricingService';

describe('MECHFIND Official Pricing Service', () => {
  it('should load all 49 official launch service records', () => {
    const all = pricingService.getAllPricing();
    expect(all.length).toBe(49);
    expect(OFFICIAL_LAUNCH_PRICING.length).toBe(49);
  });

  it('should have exactly 22 services for 2W and 27 services for 4W', () => {
    const twoWheelers = pricingService.getPricingByVehicle('2W');
    const fourWheelers = pricingService.getPricingByVehicle('4W');

    expect(twoWheelers.length).toBe(22);
    expect(fourWheelers.length).toBe(27);
  });

  it('should match official Launch Price List for sample 2W services', () => {
    // 2W Basic diagnosis: ₹199 customer, ₹149 payout, ₹50 margin
    const basicDiag = pricingService.getServiceById('2w_basic_diagnosis_inspection');
    expect(basicDiag).toBeDefined();
    expect(basicDiag?.customerPrice).toBe(199);
    expect(basicDiag?.mechanicPayout).toBe(149);
    expect(basicDiag?.platformMargin).toBe(50);

    // 2W Battery jumpstart: ₹299 customer, ₹229 payout, ₹70 margin
    const jumpstart2W = pricingService.getServiceById('2w_battery_jumpstart');
    expect(jumpstart2W).toBeDefined();
    expect(jumpstart2W?.customerPrice).toBe(299);
    expect(jumpstart2W?.mechanicPayout).toBe(229);
    expect(jumpstart2W?.platformMargin).toBe(70);

    // 2W Tubeless puncture: ₹249 customer, ₹189 payout, ₹60 margin
    const tubeless2W = pricingService.getServiceById('2w_tubeless_puncture_repair');
    expect(tubeless2W).toBeDefined();
    expect(tubeless2W?.customerPrice).toBe(249);
    expect(tubeless2W?.mechanicPayout).toBe(189);
    expect(tubeless2W?.platformMargin).toBe(60);
  });

  it('should match official Launch Price List for sample 4W services', () => {
    // 4W Basic visual diagnosis: ₹399 customer, ₹299 payout, ₹100 margin
    const basicVisual4W = pricingService.getServiceById('4w_basic_visual_diagnosis');
    expect(basicVisual4W).toBeDefined();
    expect(basicVisual4W?.customerPrice).toBe(399);
    expect(basicVisual4W?.mechanicPayout).toBe(299);
    expect(basicVisual4W?.platformMargin).toBe(100);

    // 4W Battery jumpstart: ₹499 customer, ₹389 payout, ₹110 margin
    const jumpstart4W = pricingService.getServiceById('4w_battery_jumpstart');
    expect(jumpstart4W).toBeDefined();
    expect(jumpstart4W?.customerPrice).toBe(499);
    expect(jumpstart4W?.mechanicPayout).toBe(389);
    expect(jumpstart4W?.platformMargin).toBe(110);

    // 4W AC Refrigerant refill: ₹2499 customer, ₹1999 payout, ₹500 margin
    const acRefill = pricingService.getServiceById('4w_ac_refrigerant_refill_gas_labour_confirm_gas_ty');
    expect(acRefill).toBeDefined();
    expect(acRefill?.customerPrice).toBe(2499);
    expect(acRefill?.mechanicPayout).toBe(1999);
    expect(acRefill?.platformMargin).toBe(500);
  });

  it('should calculate distance fees according to Pricing Rules (0-5km free, beyond 5km ₹15/km)', () => {
    // Within 5km -> no distance fee
    const estimateClose = pricingService.calculateEstimate({
      serviceId: '4w_battery_jumpstart',
      vehicleType: '4W',
      distanceKm: 3.5,
    });
    expect(estimateClose.distanceFee).toBe(0);
    expect(estimateClose.totalCustomerPrice).toBe(499);

    // 8km -> 3km billable * ₹15 = ₹45
    const estimateFar = pricingService.calculateEstimate({
      serviceId: '4w_battery_jumpstart',
      vehicleType: '4W',
      distanceKm: 8.0,
    });
    expect(estimateFar.distanceFee).toBe(45);
    expect(estimateFar.totalCustomerPrice).toBe(499 + 45);
  });

  it('should apply peak (+15%) and late night (+25%) surcharges transparently', () => {
    // Peak surcharge
    const peakEstimate = pricingService.calculateEstimate({
      serviceId: '2w_battery_jumpstart',
      vehicleType: '2W',
      distanceKm: 2.0,
      isPeak: true,
    });
    // 299 * 0.15 = 44.85 -> 45
    expect(peakEstimate.surchargeType).toBe('peak');
    expect(peakEstimate.customerSurchargeAmount).toBe(45);
    expect(peakEstimate.totalCustomerPrice).toBe(299 + 45);

    // Late night surcharge
    const nightEstimate = pricingService.calculateEstimate({
      serviceId: '2w_battery_jumpstart',
      vehicleType: '2W',
      distanceKm: 2.0,
      isLateNight: true,
    });
    // 299 * 0.25 = 74.75 -> 75
    expect(nightEstimate.surchargeType).toBe('late_night');
    expect(nightEstimate.customerSurchargeAmount).toBe(75);
    expect(nightEstimate.totalCustomerPrice).toBe(299 + 75);
  });

  it('should provide mechanic payout without exposing platform margin to mechanic', () => {
    const payoutNormal = pricingService.getMechanicPayout('4w_battery_jumpstart', '4W');
    expect(payoutNormal).toBe(389);

    const payoutPeak = pricingService.getMechanicPayout('4w_battery_jumpstart', '4W', { isPeak: true });
    // 389 * 1.15 = 447.35 -> 447
    expect(payoutPeak).toBe(447);

    const payoutLateNight = pricingService.getMechanicPayout('4w_battery_jumpstart', '4W', { isLateNight: true });
    // 389 * 1.25 = 486.25 -> 486
    expect(payoutLateNight).toBe(486);
  });

  it('should calculate admin overview with accurate margin aggregates', () => {
    const adminOverview = pricingService.getAdminPricingOverview();
    expect(adminOverview.totalServices).toBe(49);
    expect(adminOverview.twoWheelersCount).toBe(22);
    expect(adminOverview.fourWheelersCount).toBe(27);
    expect(adminOverview.avg2WMargin).toBeGreaterThan(0);
    expect(adminOverview.avg4WMargin).toBeGreaterThan(adminOverview.avg2WMargin);
  });
});
