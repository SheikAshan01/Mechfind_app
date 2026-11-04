/**
 * MECHFIND Official Service Pricing Service
 * Source of Truth: Launch Price List (MechFind_Combined_Pricing_and_Research.xlsx)
 * 
 * Rules:
 * - 49 official services (22 for 2W, 27 for 4W)
 * - Base service radius: 5 km (beyond 5 km: +disclosed distance fee, standard ₹15/km)
 * - Surcharges: Peak +15%, Late Night (10pm-6am) +25%
 * - Diagnosis / Inspection fee payable even if repair declined
 * - EV high-voltage / ECU specialist jobs require quote-first workflow
 * - Parts and consumables extra with customer in-app approval
 */

export interface ServicePricingItem {
  id: string;
  vehicleType: '2W' | '4W';
  serviceName: string;
  category: 'diagnosis' | 'battery' | 'tyre' | 'electrical' | 'ecu' | 'ac' | 'wash' | 'general';
  customerPrice: number;
  mechanicPayout: number;
  platformMargin: number;
  standardLaborDurationMin: number;
  isQuoteFirst?: boolean;
  notes?: string;
}

export interface PricingCalculationInput {
  serviceId: string;
  vehicleType: '2W' | '4W';
  distanceKm?: number;
  isPeak?: boolean;
  isLateNight?: boolean;
  partsCost?: number;
}

export interface PricingCalculationResult {
  serviceId: string;
  serviceName: string;
  vehicleType: '2W' | '4W';
  category: string;
  baseCustomerPrice: number;
  baseMechanicPayout: number;
  distanceKm: number;
  distanceFee: number;
  surchargeType: 'none' | 'peak' | 'late_night';
  surchargePercent: number;
  customerSurchargeAmount: number;
  mechanicSurchargeAmount: number;
  partsCost: number;
  totalCustomerPrice: number;
  totalMechanicPayout: number;
  platformMargin: number;
  isQuoteFirst: boolean;
  notes: string;
}

export const OFFICIAL_LAUNCH_PRICING: ServicePricingItem[] = [
  {
    id: '2w_basic_diagnosis_inspection',
    vehicleType: '2W',
    serviceName: "Basic diagnosis / inspection",
    category: 'diagnosis',
    customerPrice: 199,
    mechanicPayout: 149,
    platformMargin: 50,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '2w_advanced_diagnosis',
    vehicleType: '2W',
    serviceName: "Advanced diagnosis",
    category: 'diagnosis',
    customerPrice: 349,
    mechanicPayout: 269,
    platformMargin: 80,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '2w_scanner_diagnosis_supported_models',
    vehicleType: '2W',
    serviceName: "Scanner diagnosis (supported models)",
    category: 'diagnosis',
    customerPrice: 399,
    mechanicPayout: 309,
    platformMargin: 90,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '2w_battery_jumpstart',
    vehicleType: '2W',
    serviceName: "Battery jumpstart",
    category: 'battery',
    customerPrice: 299,
    mechanicPayout: 229,
    platformMargin: 70,
    standardLaborDurationMin: 15,
    isQuoteFirst: false,
    notes: "Standard 15 min roadside labor.",
  },
  {
    id: '2w_battery_health_test',
    vehicleType: '2W',
    serviceName: "Battery health test",
    category: 'battery',
    customerPrice: 199,
    mechanicPayout: 149,
    platformMargin: 50,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '2w_breakdown_visit_roadside_inspection',
    vehicleType: '2W',
    serviceName: "Breakdown visit / roadside inspection",
    category: 'diagnosis',
    customerPrice: 399,
    mechanicPayout: 309,
    platformMargin: 90,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '2w_minor_on_site_repair_labour_up_to_30_min',
    vehicleType: '2W',
    serviceName: "Minor on-site repair labour (up to 30 min)",
    category: 'general',
    customerPrice: 449,
    mechanicPayout: 349,
    platformMargin: 100,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '2w_extended_troubleshooting_up_to_60_min',
    vehicleType: '2W',
    serviceName: "Extended troubleshooting (up to 60 min)",
    category: 'diagnosis',
    customerPrice: 699,
    mechanicPayout: 539,
    platformMargin: 160,
    standardLaborDurationMin: 60,
    isQuoteFirst: false,
    notes: "Standard 60 min roadside labor.",
  },
  {
    id: '2w_electrical_inspection',
    vehicleType: '2W',
    serviceName: "Electrical inspection",
    category: 'electrical',
    customerPrice: 249,
    mechanicPayout: 189,
    platformMargin: 60,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '2w_wiring_fuse_relay_minor_repair_labour',
    vehicleType: '2W',
    serviceName: "Wiring / fuse / relay minor repair labour",
    category: 'electrical',
    customerPrice: 399,
    mechanicPayout: 309,
    platformMargin: 90,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '2w_starter_charging_system_diagnosis',
    vehicleType: '2W',
    serviceName: "Starter / charging system diagnosis",
    category: 'electrical',
    customerPrice: 349,
    mechanicPayout: 269,
    platformMargin: 80,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '2w_tyre_puncture_repair_tube_type',
    vehicleType: '2W',
    serviceName: "Tyre puncture repair (tube type)",
    category: 'tyre',
    customerPrice: 199,
    mechanicPayout: 149,
    platformMargin: 50,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "On-site puncture inspection and repair.",
  },
  {
    id: '2w_tubeless_puncture_repair',
    vehicleType: '2W',
    serviceName: "Tubeless puncture repair",
    category: 'tyre',
    customerPrice: 249,
    mechanicPayout: 189,
    platformMargin: 60,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "On-site puncture inspection and repair.",
  },
  {
    id: '2w_spare_wheel_tyre_change_labour',
    vehicleType: '2W',
    serviceName: "Spare wheel / tyre change labour",
    category: 'tyre',
    customerPrice: 249,
    mechanicPayout: 189,
    platformMargin: 60,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '2w_tyre_replacement_labour',
    vehicleType: '2W',
    serviceName: "Tyre replacement labour",
    category: 'tyre',
    customerPrice: 349,
    mechanicPayout: 269,
    platformMargin: 80,
    standardLaborDurationMin: 45,
    isQuoteFirst: false,
    notes: "Standard 45 min roadside labor.",
  },
  {
    id: '2w_ecu_fi_error_scan',
    vehicleType: '2W',
    serviceName: "ECU / FI error scan",
    category: 'ecu',
    customerPrice: 399,
    mechanicPayout: 309,
    platformMargin: 90,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '2w_sensor_ecu_troubleshooting',
    vehicleType: '2W',
    serviceName: "Sensor / ECU troubleshooting",
    category: 'ecu',
    customerPrice: 599,
    mechanicPayout: 459,
    platformMargin: 140,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '2w_ecu_reset_adaptation_if_supported',
    vehicleType: '2W',
    serviceName: "ECU reset / adaptation (if supported)",
    category: 'ecu',
    customerPrice: 499,
    mechanicPayout: 389,
    platformMargin: 110,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '2w_ecu_repair_labour_specialist_quote_first',
    vehicleType: '2W',
    serviceName: "ECU repair labour (specialist; quote first)",
    category: 'ecu',
    customerPrice: 1499,
    mechanicPayout: 1199,
    platformMargin: 300,
    standardLaborDurationMin: 30,
    isQuoteFirst: true,
    notes: "Specialist procedure; requires in-app quote approval before commencing.",
  },
  {
    id: '2w_basic_water_wash',
    vehicleType: '2W',
    serviceName: "Basic water wash",
    category: 'wash',
    customerPrice: 199,
    mechanicPayout: 149,
    platformMargin: 50,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "On-site doorstep water/wash service.",
  },
  {
    id: '2w_premium_wash',
    vehicleType: '2W',
    serviceName: "Premium wash",
    category: 'wash',
    customerPrice: 349,
    mechanicPayout: 269,
    platformMargin: 80,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "On-site doorstep water/wash service.",
  },
  {
    id: '2w_dry_waterless_wash',
    vehicleType: '2W',
    serviceName: "Dry / waterless wash",
    category: 'wash',
    customerPrice: 249,
    mechanicPayout: 189,
    platformMargin: 60,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "On-site doorstep water/wash service.",
  },
  {
    id: '4w_basic_visual_diagnosis',
    vehicleType: '4W',
    serviceName: "Basic visual diagnosis",
    category: 'diagnosis',
    customerPrice: 399,
    mechanicPayout: 299,
    platformMargin: 100,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_obd_scan_basic_diagnostics',
    vehicleType: '4W',
    serviceName: "OBD scan / basic diagnostics",
    category: 'diagnosis',
    customerPrice: 699,
    mechanicPayout: 549,
    platformMargin: 150,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_advanced_diagnostics',
    vehicleType: '4W',
    serviceName: "Advanced diagnostics",
    category: 'general',
    customerPrice: 1199,
    mechanicPayout: 949,
    platformMargin: 250,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_battery_jumpstart',
    vehicleType: '4W',
    serviceName: "Battery jumpstart",
    category: 'battery',
    customerPrice: 499,
    mechanicPayout: 389,
    platformMargin: 110,
    standardLaborDurationMin: 15,
    isQuoteFirst: false,
    notes: "Standard 15 min roadside labor.",
  },
  {
    id: '4w_battery_health_test',
    vehicleType: '4W',
    serviceName: "Battery health test",
    category: 'battery',
    customerPrice: 299,
    mechanicPayout: 229,
    platformMargin: 70,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_breakdown_visit_roadside_inspection',
    vehicleType: '4W',
    serviceName: "Breakdown visit / roadside inspection",
    category: 'diagnosis',
    customerPrice: 699,
    mechanicPayout: 549,
    platformMargin: 150,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_minor_on_site_repair_labour_up_to_30_min',
    vehicleType: '4W',
    serviceName: "Minor on-site repair labour (up to 30 min)",
    category: 'general',
    customerPrice: 799,
    mechanicPayout: 629,
    platformMargin: 170,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_extended_troubleshooting_up_to_60_min',
    vehicleType: '4W',
    serviceName: "Extended troubleshooting (up to 60 min)",
    category: 'diagnosis',
    customerPrice: 1299,
    mechanicPayout: 1029,
    platformMargin: 270,
    standardLaborDurationMin: 60,
    isQuoteFirst: false,
    notes: "Standard 60 min roadside labor.",
  },
  {
    id: '4w_electrical_inspection',
    vehicleType: '4W',
    serviceName: "Electrical inspection",
    category: 'electrical',
    customerPrice: 599,
    mechanicPayout: 469,
    platformMargin: 130,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_fuse_relay_minor_wiring_labour',
    vehicleType: '4W',
    serviceName: "Fuse / relay / minor wiring labour",
    category: 'electrical',
    customerPrice: 699,
    mechanicPayout: 549,
    platformMargin: 150,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_starter_alternator_diagnosis',
    vehicleType: '4W',
    serviceName: "Starter / alternator diagnosis",
    category: 'electrical',
    customerPrice: 899,
    mechanicPayout: 699,
    platformMargin: 200,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_tyre_puncture_repair',
    vehicleType: '4W',
    serviceName: "Tyre puncture repair",
    category: 'tyre',
    customerPrice: 299,
    mechanicPayout: 229,
    platformMargin: 70,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "On-site puncture inspection and repair.",
  },
  {
    id: '4w_spare_tyre_change_labour',
    vehicleType: '4W',
    serviceName: "Spare tyre change labour",
    category: 'tyre',
    customerPrice: 399,
    mechanicPayout: 309,
    platformMargin: 90,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_tyre_replacement_labour_per_tyre',
    vehicleType: '4W',
    serviceName: "Tyre replacement labour (per tyre)",
    category: 'tyre',
    customerPrice: 599,
    mechanicPayout: 469,
    platformMargin: 130,
    standardLaborDurationMin: 45,
    isQuoteFirst: false,
    notes: "Standard 45 min roadside labor.",
  },
  {
    id: '4w_ac_inspection_cooling_diagnosis',
    vehicleType: '4W',
    serviceName: "AC inspection / cooling diagnosis",
    category: 'ac',
    customerPrice: 699,
    mechanicPayout: 549,
    platformMargin: 150,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_ac_leak_detection_basic_equipment_dependent',
    vehicleType: '4W',
    serviceName: "AC leak detection (basic; equipment dependent)",
    category: 'ac',
    customerPrice: 1199,
    mechanicPayout: 949,
    platformMargin: 250,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_ac_service_labour_excluding_gas_parts',
    vehicleType: '4W',
    serviceName: "AC service labour (excluding gas/parts)",
    category: 'ac',
    customerPrice: 1499,
    mechanicPayout: 1199,
    platformMargin: 300,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_ac_refrigerant_refill_gas_labour_confirm_gas_ty',
    vehicleType: '4W',
    serviceName: "AC refrigerant refill (gas + labour; confirm gas type)",
    category: 'ecu',
    customerPrice: 2499,
    mechanicPayout: 1999,
    platformMargin: 500,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_ac_compressor_diagnosis',
    vehicleType: '4W',
    serviceName: "AC compressor diagnosis",
    category: 'ac',
    customerPrice: 1299,
    mechanicPayout: 1029,
    platformMargin: 270,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_ecu_obd_scan',
    vehicleType: '4W',
    serviceName: "ECU / OBD scan",
    category: 'ecu',
    customerPrice: 999,
    mechanicPayout: 779,
    platformMargin: 220,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_ecu_troubleshooting_sensor_diagnosis',
    vehicleType: '4W',
    serviceName: "ECU troubleshooting / sensor diagnosis",
    category: 'ecu',
    customerPrice: 1499,
    mechanicPayout: 1199,
    platformMargin: 300,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_ecu_reset_adaptation_supported_models',
    vehicleType: '4W',
    serviceName: "ECU reset / adaptation (supported models)",
    category: 'ecu',
    customerPrice: 1199,
    mechanicPayout: 949,
    platformMargin: 250,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "Standard 30 min roadside labor.",
  },
  {
    id: '4w_ecu_specialist_repair_labour_quote_first',
    vehicleType: '4W',
    serviceName: "ECU specialist repair labour (quote first)",
    category: 'ecu',
    customerPrice: 3499,
    mechanicPayout: 2799,
    platformMargin: 700,
    standardLaborDurationMin: 30,
    isQuoteFirst: true,
    notes: "Specialist procedure; requires in-app quote approval before commencing.",
  },
  {
    id: '4w_exterior_water_wash',
    vehicleType: '4W',
    serviceName: "Exterior water wash",
    category: 'wash',
    customerPrice: 299,
    mechanicPayout: 229,
    platformMargin: 70,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "On-site doorstep water/wash service.",
  },
  {
    id: '4w_interior_exterior_wash',
    vehicleType: '4W',
    serviceName: "Interior + exterior wash",
    category: 'wash',
    customerPrice: 699,
    mechanicPayout: 549,
    platformMargin: 150,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "On-site doorstep water/wash service.",
  },
  {
    id: '4w_premium_wash_wax',
    vehicleType: '4W',
    serviceName: "Premium wash / wax",
    category: 'wash',
    customerPrice: 1299,
    mechanicPayout: 1029,
    platformMargin: 270,
    standardLaborDurationMin: 30,
    isQuoteFirst: false,
    notes: "On-site doorstep water/wash service.",
  },
  {
    id: '4w_interior_deep_clean_starting_price',
    vehicleType: '4W',
    serviceName: "Interior deep clean (starting price)",
    category: 'wash',
    customerPrice: 1999,
    mechanicPayout: 1599,
    platformMargin: 400,
    standardLaborDurationMin: 90,
    isQuoteFirst: false,
    notes: "On-site doorstep water/wash service.",
  },
];

class PricingService {
  private readonly items: ServicePricingItem[] = OFFICIAL_LAUNCH_PRICING;

  /**
   * Get all official services
   */
  getAllPricing(): ServicePricingItem[] {
    return [...this.items];
  }

  /**
   * Filter services by vehicle type (2W or 4W)
   */
  getPricingByVehicle(vehicleType: '2W' | '4W'): ServicePricingItem[] {
    return this.items.filter((item) => item.vehicleType === vehicleType);
  }

  /**
   * Filter services by vehicle type and category
   */
  getPricingByCategory(
    vehicleType: '2W' | '4W',
    category: string
  ): ServicePricingItem[] {
    return this.items.filter(
      (item) => item.vehicleType === vehicleType && item.category === category
    );
  }

  /**
   * Find a specific service by ID
   */
  getServiceById(id: string): ServicePricingItem | undefined {
    return this.items.find((item) => item.id === id);
  }

  /**
   * Find a service matching name or category query
   */
  findService(vehicleType: '2W' | '4W', query: string): ServicePricingItem | undefined {
    const q = query.toLowerCase();
    return this.items.find(
      (item) =>
        item.vehicleType === vehicleType &&
        (item.id.toLowerCase().includes(q) || item.serviceName.toLowerCase().includes(q))
    );
  }

  /**
   * Get customer price for a service (never exposes margin or internal payout)
   */
  getCustomerPrice(serviceId: string, vehicleType: '2W' | '4W'): number {
    const service = this.items.find(
      (s) => s.id === serviceId && s.vehicleType === vehicleType
    );
    return service ? service.customerPrice : 0;
  }

  /**
   * Get mechanic payout for a service (never exposes platform margin)
   */
  getMechanicPayout(
    serviceId: string,
    vehicleType: '2W' | '4W',
    options?: { isPeak?: boolean; isLateNight?: boolean }
  ): number {
    const service = this.items.find(
      (s) => s.id === serviceId && s.vehicleType === vehicleType
    );
    if (!service) return 0;

    let payout = service.mechanicPayout;
    if (options?.isLateNight) {
      payout = Math.round(payout * 1.25); // +25% Late night rule
    } else if (options?.isPeak) {
      payout = Math.round(payout * 1.15); // +15% Peak surcharge rule
    }
    return payout;
  }

  /**
   * Calculate complete, transparent breakdown for bookings
   * Enforces all official rules:
   * - Base 0-5 km included; beyond 5 km: ₹15/km
   * - Surcharges: Peak +15%, Late Night +25%
   * - Parts extra with in-app customer approval
   */
  calculateEstimate(input: PricingCalculationInput): PricingCalculationResult {
    let service = this.items.find(
      (s) => s.id === input.serviceId && s.vehicleType === input.vehicleType
    );

    if (!service) {
      service = this.items.find((s) => s.vehicleType === input.vehicleType) || this.items[0];
    }

    const distanceKm = Math.max(0, input.distanceKm ?? 2.5);
    // Base included within 0-5 km; ₹15/km for each km beyond 5 km
    const billableExtraKm = Math.max(0, distanceKm - 5.0);
    const distanceFee = Math.round(billableExtraKm * 15);

    let surchargeType: 'none' | 'peak' | 'late_night' = 'none';
    let surchargePercent = 0;

    if (input.isLateNight) {
      surchargeType = 'late_night';
      surchargePercent = 25;
    } else if (input.isPeak) {
      surchargeType = 'peak';
      surchargePercent = 15;
    }

    const customerSurchargeAmount = Math.round((service.customerPrice * surchargePercent) / 100);
    const mechanicSurchargeAmount = Math.round((service.mechanicPayout * surchargePercent) / 100);
    const partsCost = Math.max(0, input.partsCost ?? 0);

    const totalCustomerPrice = service.customerPrice + distanceFee + customerSurchargeAmount + partsCost;
    const totalMechanicPayout =
      service.mechanicPayout + (billableExtraKm > 0 ? Math.round(distanceFee * 0.8) : 0) + mechanicSurchargeAmount + partsCost;

    const platformMargin = totalCustomerPrice - totalMechanicPayout;

    return {
      serviceId: service.id,
      serviceName: service.serviceName,
      vehicleType: service.vehicleType,
      category: service.category,
      baseCustomerPrice: service.customerPrice,
      baseMechanicPayout: service.mechanicPayout,
      distanceKm,
      distanceFee,
      surchargeType,
      surchargePercent,
      customerSurchargeAmount,
      mechanicSurchargeAmount,
      partsCost,
      totalCustomerPrice,
      totalMechanicPayout,
      platformMargin,
      isQuoteFirst: Boolean(service.isQuoteFirst),
      notes: service.notes || '',
    };
  }

  /**
   * Helper for Admin Console: full overview with margins
   */
  getAdminPricingOverview() {
    const twoWheelers = this.getPricingByVehicle('2W');
    const fourWheelers = this.getPricingByVehicle('4W');

    const total2WMargin = twoWheelers.reduce((acc, cur) => acc + cur.platformMargin, 0);
    const avg2WMargin = Math.round(total2WMargin / (twoWheelers.length || 1));

    const total4WMargin = fourWheelers.reduce((acc, cur) => acc + cur.platformMargin, 0);
    const avg4WMargin = Math.round(total4WMargin / (fourWheelers.length || 1));

    return {
      totalServices: this.items.length,
      twoWheelersCount: twoWheelers.length,
      fourWheelersCount: fourWheelers.length,
      avg2WMargin,
      avg4WMargin,
      services: this.items,
    };
  }
}

export const pricingService = new PricingService();
