-- ====================================================================
-- MECHFIND Enterprise Marketplace Migration: v1.0 Production Schema
-- Covers: Bookings, Quotes, Subscriptions, Incentives, Payments, Invoices,
-- Support Tickets, Serviceability Zones, Loyalty, i18n & Audit Logging
-- ====================================================================

-- 1. Additional ENUMs safely
DO $$ BEGIN
  CREATE TYPE booking_type AS ENUM ('instant', 'scheduled', 'emergency_roadside');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE service_delivery_mode AS ENUM ('doorstep', 'workshop_visit');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE quote_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('upi', 'card', 'netbanking', 'wallet', 'cash');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'success', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'rejected', 'processed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'premium');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'yearly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE loyalty_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE experience_tier AS ENUM ('standard', 'experienced', 'expert');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Enhance mechanic_profiles with experience_tier and working_hours
ALTER TABLE public.mechanic_profiles 
  ADD COLUMN IF NOT EXISTS experience_tier experience_tier NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS working_hours_start VARCHAR(10) DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS working_hours_end VARCHAR(10) DEFAULT '22:00',
  ADD COLUMN IF NOT EXISTS doorstep_service_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS workshop_visit_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS bank_ifsc VARCHAR(20),
  ADD COLUMN IF NOT EXISTS upi_vpa VARCHAR(100),
  ADD COLUMN IF NOT EXISTS gst_number VARCHAR(30);

-- 3. Customer Saved Addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  label VARCHAR(50) NOT NULL DEFAULT 'Home',
  address_text TEXT NOT NULL,
  landmark TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Customer Favourite / Saved Mechanics
CREATE TABLE IF NOT EXISTS public.saved_mechanics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mechanic_id UUID REFERENCES public.mechanic_profiles(user_id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, mechanic_id)
);

-- 5. Standard Catalog Services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category problem_category NOT NULL,
  default_price NUMERIC(10, 2) NOT NULL,
  estimated_duration_min INT NOT NULL DEFAULT 30,
  supported_vehicles vehicle_type[] NOT NULL DEFAULT '{"car", "bike"}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Mechanic Custom Service Offerings
CREATE TABLE IF NOT EXISTS public.mechanic_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mechanic_id UUID REFERENCES public.mechanic_profiles(user_id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  custom_price NUMERIC(10, 2) NOT NULL,
  doorstep_available BOOLEAN NOT NULL DEFAULT TRUE,
  workshop_visit_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mechanic_id, service_id)
);

-- 7. Quotes & Quote Items (Strict Customer Approval Before Work)
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.breakdown_requests(id) ON DELETE CASCADE NOT NULL,
  mechanic_id UUID REFERENCES public.mechanic_profiles(user_id) NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  status quote_status NOT NULL DEFAULT 'submitted',
  total_labour NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_parts NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  grand_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  customer_rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE NOT NULL,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('labour', 'part')),
  description VARCHAR(255) NOT NULL,
  quantity NUMERIC(6, 2) NOT NULL DEFAULT 1.00,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. GST Digital Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  booking_id UUID REFERENCES public.breakdown_requests(id) NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  mechanic_id UUID REFERENCES public.mechanic_profiles(user_id) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
  tax_amount NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  grand_total NUMERIC(10, 2) NOT NULL,
  gst_number VARCHAR(30),
  pdf_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'issued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Payments Ledger
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.breakdown_requests(id) NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id),
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  method payment_method NOT NULL DEFAULT 'cash',
  status payment_status NOT NULL DEFAULT 'pending',
  transaction_ref VARCHAR(100),
  gateway_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Refunds
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES public.payments(id) NOT NULL,
  booking_id UUID REFERENCES public.breakdown_requests(id) NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  status refund_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Mechanic Payouts Ledger
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mechanic_id UUID REFERENCES public.mechanic_profiles(user_id) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status payout_status NOT NULL DEFAULT 'pending',
  payout_method VARCHAR(30) NOT NULL DEFAULT 'bank_transfer',
  bank_account_last4 VARCHAR(4),
  upi_vpa VARCHAR(100),
  reference_id VARCHAR(100),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Mechanic Subscription Plans (Dynamic Admin Configuration)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  tier subscription_tier NOT NULL DEFAULT 'free',
  monthly_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  quarterly_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  yearly_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  lead_quota_monthly INT NOT NULL DEFAULT 20,
  search_ranking_weight INT NOT NULL DEFAULT 1,
  commission_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
  instant_booking_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  priority_dispatch BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Mechanic Subscriptions
CREATE TABLE IF NOT EXISTS public.mechanic_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mechanic_id UUID REFERENCES public.mechanic_profiles(user_id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  lead_quota_remaining INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Incentive Rules & Reward Ledger
CREATE TABLE IF NOT EXISTS public.incentive_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  reward_type VARCHAR(30) NOT NULL CHECK (reward_type IN ('milestone', 'rating_bonus', 'peak_hour', 'emergency', 'referral')),
  reward_amount NUMERIC(10, 2) NOT NULL,
  criteria_json JSONB NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_reward_cap NUMERIC(10, 2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reward_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mechanic_id UUID REFERENCES public.mechanic_profiles(user_id) ON DELETE CASCADE NOT NULL,
  rule_id UUID REFERENCES public.incentive_rules(id),
  booking_id UUID REFERENCES public.breakdown_requests(id),
  reward_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'credited' CHECK (status IN ('pending', 'credited', 'reversed', 'flagged_fraud')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Mechanic Loyalty Tiers
CREATE TABLE IF NOT EXISTS public.mechanic_loyalty (
  mechanic_id UUID REFERENCES public.mechanic_profiles(user_id) ON DELETE CASCADE PRIMARY KEY,
  tier loyalty_tier NOT NULL DEFAULT 'bronze',
  total_points INT NOT NULL DEFAULT 0,
  lifetime_jobs INT NOT NULL DEFAULT 0,
  maintained_rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
  commission_discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Support Tickets & Internal Notes
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id),
  mechanic_id UUID REFERENCES public.mechanic_profiles(user_id),
  booking_id UUID REFERENCES public.breakdown_requests(id),
  assigned_agent_id UUID REFERENCES public.profiles(id),
  category VARCHAR(50) NOT NULL,
  priority ticket_priority NOT NULL DEFAULT 'medium',
  status ticket_status NOT NULL DEFAULT 'open',
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  sla_deadline TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  sender_role user_role NOT NULL,
  message TEXT NOT NULL,
  is_internal_note BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. In-App Realtime Chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.breakdown_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  sender_role user_role NOT NULL,
  message TEXT NOT NULL,
  media_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Customer Vehicle Service Reminders (Insurance, PUC, Service)
CREATE TABLE IF NOT EXISTS public.service_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  reminder_type VARCHAR(50) NOT NULL CHECK (reminder_type IN ('general_service', 'insurance_expiry', 'puc_expiry', 'oil_change')),
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. City & Regional Serviceability Zones (PostGIS Spatial Polygon)
CREATE TABLE IF NOT EXISTS public.serviceability_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_name VARCHAR(100) NOT NULL,
  state_name VARCHAR(100) NOT NULL,
  boundary GEOGRAPHY(Polygon, 4326),
  center_lat DOUBLE PRECISION NOT NULL,
  center_lng DOUBLE PRECISION NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. Audit Logging
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  ip_address VARCHAR(50),
  details_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ENHANCED POSTGIS DISCOVERY FUNCTION (With Subscription Boost & Filters)
-- ====================================================================

CREATE OR REPLACE FUNCTION public.find_nearby_mechanics_v2(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 20.0,
  vehicle_filter vehicle_type DEFAULT NULL,
  min_rating NUMERIC DEFAULT 0.0,
  experience_filter experience_tier DEFAULT NULL,
  delivery_mode VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  mechanic_id UUID,
  shop_name VARCHAR,
  shop_address TEXT,
  rating NUMERIC,
  review_count INT,
  years_of_experience INT,
  experience_tier experience_tier,
  is_verified BOOLEAN,
  distance_km DOUBLE PRECISION,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  subscription_weight INT,
  doorstep_enabled BOOLEAN,
  workshop_visit_enabled BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.user_id AS mechanic_id,
    m.shop_name,
    m.shop_address,
    m.rating,
    m.review_count,
    m.years_of_experience,
    m.experience_tier,
    (m.verification_status = 'approved') AS is_verified,
    ROUND((ST_Distance(m.current_location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) / 1000)::numeric, 2)::double precision AS distance_km,
    ST_Y(m.current_location::geometry) AS lat,
    ST_X(m.current_location::geometry) AS lng,
    COALESCE(p.search_ranking_weight, 1) AS subscription_weight,
    m.doorstep_service_enabled,
    m.workshop_visit_enabled
  FROM public.mechanic_profiles m
  LEFT JOIN public.mechanic_subscriptions s ON s.mechanic_id = m.user_id AND s.status = 'active'
  LEFT JOIN public.subscription_plans p ON p.id = s.plan_id
  WHERE
    m.is_online = TRUE
    AND m.verification_status = 'approved'
    AND m.rating >= min_rating
    AND ST_DWithin(
      m.current_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
    AND (vehicle_filter IS NULL OR vehicle_filter = ANY(m.supported_vehicles))
    AND (experience_filter IS NULL OR m.experience_tier = experience_filter)
    AND (
      delivery_mode IS NULL OR
      (delivery_mode = 'doorstep' AND m.doorstep_service_enabled = TRUE) OR
      (delivery_mode = 'workshop_visit' AND m.workshop_visit_enabled = TRUE)
    )
  ORDER BY
    subscription_weight DESC,
    distance_km ASC;
END;
$$;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR ENTERPRISE TABLES
-- ====================================================================

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers and mechanics view own quotes"
  ON public.quotes FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR auth.uid() = mechanic_id);

CREATE POLICY "Mechanics insert quotes for assigned bookings"
  ON public.quotes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = mechanic_id);

CREATE POLICY "Customers or mechanics update quotes"
  ON public.quotes FOR UPDATE TO authenticated
  USING (auth.uid() = customer_id OR auth.uid() = mechanic_id);

CREATE POLICY "Quote items viewable by booking participants"
  ON public.quote_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quotes q
    WHERE q.id = quote_id AND (q.customer_id = auth.uid() OR q.mechanic_id = auth.uid())
  ));

CREATE POLICY "Invoices viewable by customer, mechanic or admin"
  ON public.invoices FOR SELECT TO authenticated
  USING (
    auth.uid() = customer_id OR 
    auth.uid() = mechanic_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
  );

CREATE POLICY "Payments viewable by customer or admin"
  ON public.payments FOR SELECT TO authenticated
  USING (
    auth.uid() = customer_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Refunds viewable by customer, support or admin"
  ON public.refunds FOR SELECT TO authenticated
  USING (
    auth.uid() = customer_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
  );

CREATE POLICY "Payouts viewable only by mechanic or admin"
  ON public.payouts FOR SELECT TO authenticated
  USING (
    auth.uid() = mechanic_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Tickets viewable by creator, assigned agent or staff"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (
    auth.uid() = customer_id OR 
    auth.uid() = mechanic_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
  );

CREATE POLICY "Ticket messages viewable by ticket participants"
  ON public.support_ticket_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t 
      WHERE t.id = ticket_id AND (
        t.customer_id = auth.uid() OR 
        t.mechanic_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
      )
    )
  );

CREATE POLICY "Audit logs strictly admin accessible"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Subscriptions viewable by mechanic owner or admin"
  ON public.mechanic_subscriptions FOR SELECT TO authenticated
  USING (
    auth.uid() = mechanic_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


