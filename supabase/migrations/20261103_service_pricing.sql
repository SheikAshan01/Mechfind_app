-- ====================================================================
-- MECHFIND Official Launch Pricing Migration
-- Source of Truth: Launch Price List (MechFind_Combined_Pricing_and_Research.xlsx)
-- Contains 49 verified services (22 for 2W, 27 for 4W)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.service_pricing (
  id VARCHAR(64) PRIMARY KEY,
  vehicle_type VARCHAR(10) NOT NULL CHECK (vehicle_type IN ('2W', '4W')),
  service_name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  customer_price NUMERIC(10, 2) NOT NULL CHECK (customer_price >= 0),
  mechanic_payout NUMERIC(10, 2) NOT NULL CHECK (mechanic_payout >= 0),
  platform_margin NUMERIC(10, 2) GENERATED ALWAYS AS (customer_price - mechanic_payout) STORED,
  standard_labor_duration_min INTEGER NOT NULL DEFAULT 30,
  is_quote_first BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_pricing_vehicle ON public.service_pricing(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_service_pricing_category ON public.service_pricing(category);

-- Enable RLS
ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;

-- Customers / Public view policy: customer_price is transparently visible
CREATE POLICY "Allow public read of active services"
  ON public.service_pricing FOR SELECT
  TO authenticated, anon
  USING (true);

-- Seed 49 Official Launch Services
INSERT INTO public.service_pricing (id, vehicle_type, service_name, category, customer_price, mechanic_payout, standard_labor_duration_min, is_quote_first, notes)
VALUES
  ('2w_basic_diagnosis_inspection', '2W', 'Basic diagnosis / inspection', 'diagnosis', 199, 149, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_advanced_diagnosis', '2W', 'Advanced diagnosis', 'diagnosis', 349, 269, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_scanner_diagnosis_supported_models', '2W', 'Scanner diagnosis (supported models)', 'diagnosis', 399, 309, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_battery_jumpstart', '2W', 'Battery jumpstart', 'battery', 299, 229, 15, FALSE, 'Standard 15 min roadside labor'),
  ('2w_battery_health_test', '2W', 'Battery health test', 'battery', 199, 149, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_breakdown_visit_roadside_inspection', '2W', 'Breakdown visit / roadside inspection', 'diagnosis', 399, 309, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_minor_on_site_repair_labour_up_to_30_min', '2W', 'Minor on-site repair labour (up to 30 min)', 'general', 449, 349, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_extended_troubleshooting_up_to_60_min', '2W', 'Extended troubleshooting (up to 60 min)', 'diagnosis', 699, 539, 60, FALSE, 'Standard 60 min roadside labor'),
  ('2w_electrical_inspection', '2W', 'Electrical inspection', 'electrical', 249, 189, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_wiring_fuse_relay_minor_repair_labour', '2W', 'Wiring / fuse / relay minor repair labour', 'electrical', 399, 309, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_starter_charging_system_diagnosis', '2W', 'Starter / charging system diagnosis', 'electrical', 349, 269, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_tyre_puncture_repair_tube_type', '2W', 'Tyre puncture repair (tube type)', 'tyre', 199, 149, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_tubeless_puncture_repair', '2W', 'Tubeless puncture repair', 'tyre', 249, 189, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_spare_wheel_tyre_change_labour', '2W', 'Spare wheel / tyre change labour', 'tyre', 249, 189, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_tyre_replacement_labour', '2W', 'Tyre replacement labour', 'tyre', 349, 269, 45, FALSE, 'Standard 45 min roadside labor'),
  ('2w_ecu_fi_error_scan', '2W', 'ECU / FI error scan', 'ecu', 399, 309, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_sensor_ecu_troubleshooting', '2W', 'Sensor / ECU troubleshooting', 'ecu', 599, 459, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_ecu_reset_adaptation_if_supported', '2W', 'ECU reset / adaptation (if supported)', 'ecu', 499, 389, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_ecu_repair_labour_specialist_quote_first', '2W', 'ECU repair labour (specialist; quote first)', 'ecu', 1499, 1199, 30, TRUE, 'Specialist procedure; requires quote-first'),
  ('2w_basic_water_wash', '2W', 'Basic water wash', 'wash', 199, 149, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_premium_wash', '2W', 'Premium wash', 'wash', 349, 269, 30, FALSE, 'Standard 30 min roadside labor'),
  ('2w_dry_waterless_wash', '2W', 'Dry / waterless wash', 'wash', 249, 189, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_basic_visual_diagnosis', '4W', 'Basic visual diagnosis', 'diagnosis', 399, 299, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_obd_scan_basic_diagnostics', '4W', 'OBD scan / basic diagnostics', 'diagnosis', 699, 549, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_advanced_diagnostics', '4W', 'Advanced diagnostics', 'general', 1199, 949, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_battery_jumpstart', '4W', 'Battery jumpstart', 'battery', 499, 389, 15, FALSE, 'Standard 15 min roadside labor'),
  ('4w_battery_health_test', '4W', 'Battery health test', 'battery', 299, 229, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_breakdown_visit_roadside_inspection', '4W', 'Breakdown visit / roadside inspection', 'diagnosis', 699, 549, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_minor_on_site_repair_labour_up_to_30_min', '4W', 'Minor on-site repair labour (up to 30 min)', 'general', 799, 629, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_extended_troubleshooting_up_to_60_min', '4W', 'Extended troubleshooting (up to 60 min)', 'diagnosis', 1299, 1029, 60, FALSE, 'Standard 60 min roadside labor'),
  ('4w_electrical_inspection', '4W', 'Electrical inspection', 'electrical', 599, 469, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_fuse_relay_minor_wiring_labour', '4W', 'Fuse / relay / minor wiring labour', 'electrical', 699, 549, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_starter_alternator_diagnosis', '4W', 'Starter / alternator diagnosis', 'electrical', 899, 699, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_tyre_puncture_repair', '4W', 'Tyre puncture repair', 'tyre', 299, 229, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_spare_tyre_change_labour', '4W', 'Spare tyre change labour', 'tyre', 399, 309, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_tyre_replacement_labour_per_tyre', '4W', 'Tyre replacement labour (per tyre)', 'tyre', 599, 469, 45, FALSE, 'Standard 45 min roadside labor'),
  ('4w_ac_inspection_cooling_diagnosis', '4W', 'AC inspection / cooling diagnosis', 'ac', 699, 549, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_ac_leak_detection_basic_equipment_dependent', '4W', 'AC leak detection (basic; equipment dependent)', 'ac', 1199, 949, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_ac_service_labour_excluding_gas_parts', '4W', 'AC service labour (excluding gas/parts)', 'ac', 1499, 1199, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_ac_refrigerant_refill_gas_labour_confirm_gas_ty', '4W', 'AC refrigerant refill (gas + labour; confirm gas type)', 'ecu', 2499, 1999, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_ac_compressor_diagnosis', '4W', 'AC compressor diagnosis', 'ac', 1299, 1029, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_ecu_obd_scan', '4W', 'ECU / OBD scan', 'ecu', 999, 779, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_ecu_troubleshooting_sensor_diagnosis', '4W', 'ECU troubleshooting / sensor diagnosis', 'ecu', 1499, 1199, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_ecu_reset_adaptation_supported_models', '4W', 'ECU reset / adaptation (supported models)', 'ecu', 1199, 949, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_ecu_specialist_repair_labour_quote_first', '4W', 'ECU specialist repair labour (quote first)', 'ecu', 3499, 2799, 30, TRUE, 'Specialist procedure; requires quote-first'),
  ('4w_exterior_water_wash', '4W', 'Exterior water wash', 'wash', 299, 229, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_interior_exterior_wash', '4W', 'Interior + exterior wash', 'wash', 699, 549, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_premium_wash_wax', '4W', 'Premium wash / wax', 'wash', 1299, 1029, 30, FALSE, 'Standard 30 min roadside labor'),
  ('4w_interior_deep_clean_starting_price', '4W', 'Interior deep clean (starting price)', 'wash', 1999, 1599, 90, FALSE, 'Standard 90 min roadside labor')
ON CONFLICT (id) DO UPDATE SET
  customer_price = EXCLUDED.customer_price,
  mechanic_payout = EXCLUDED.mechanic_payout,
  service_name = EXCLUDED.service_name,
  standard_labor_duration_min = EXCLUDED.standard_labor_duration_min,
  is_quote_first = EXCLUDED.is_quote_first,
  updated_at = NOW();
