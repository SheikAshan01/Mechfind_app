-- ====================================================================
-- MECHFIND – Production PostgreSQL & PostGIS Database Schema
-- Architecture: Supabase / PostgreSQL with Row Level Security (RLS)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enumerations
CREATE TYPE user_role AS ENUM ('customer', 'mechanic', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE vehicle_type AS ENUM ('car', 'bike', 'truck', 'heavy');
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'cng', 'hybrid');
CREATE TYPE problem_category AS ENUM (
  'flat_tyre',
  'battery_jumpstart',
  'engine_overheating',
  'fuel_delivery',
  'towing_service',
  'brake_failure',
  'lockout',
  'general_diagnostics'
);
CREATE TYPE job_status AS ENUM (
  'submitted',
  'accepted',
  'heading_to_customer',
  'arrived',
  'inspection',
  'work_in_progress',
  'completed',
  'cancelled'
);
CREATE TYPE urgency_level AS ENUM ('standard', 'high', 'critical');

-- 3. Base Users & Auth Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Customer Profiles
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  emergency_contact VARCHAR(20),
  preferred_payment_method VARCHAR(50) DEFAULT 'cash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Mechanic / Workshop Profiles (with PostGIS Spatial Coordinates)
CREATE TABLE IF NOT EXISTS public.mechanic_profiles (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  shop_name VARCHAR(200) NOT NULL,
  shop_address TEXT NOT NULL,
  years_of_experience INT NOT NULL DEFAULT 1,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  verification_reason TEXT,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  service_radius_km NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
  supported_vehicles vehicle_type[] NOT NULL DEFAULT '{"car", "bike"}',
  specializations TEXT[] NOT NULL DEFAULT '{"Flat Tyre & Puncture", "Battery Jumpstart"}',
  current_location GEOGRAPHY(Point, 4326),
  last_location_update TIMESTAMPTZ,
  id_document_url TEXT,
  trade_license_url TEXT,
  workshop_photo_url TEXT,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
  review_count INT NOT NULL DEFAULT 0,
  completed_jobs_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Customer Vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type vehicle_type NOT NULL DEFAULT 'car',
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  license_plate VARCHAR(30) NOT NULL,
  fuel_type fuel_type NOT NULL DEFAULT 'petrol',
  color VARCHAR(50),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Breakdown Service Requests
CREATE TABLE IF NOT EXISTS public.breakdown_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) NOT NULL,
  category problem_category NOT NULL,
  description TEXT NOT NULL,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  address_text TEXT,
  landmark TEXT NOT NULL,
  status job_status NOT NULL DEFAULT 'submitted',
  urgency urgency_level NOT NULL DEFAULT 'high',
  estimated_cost NUMERIC(10, 2) NOT NULL,
  final_cost NUMERIC(10, 2),
  mechanic_id UUID REFERENCES public.mechanic_profiles(user_id),
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Request Photos
CREATE TABLE IF NOT EXISTS public.request_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES public.breakdown_requests(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Mechanic Customer Reviews
CREATE TABLE IF NOT EXISTS public.mechanic_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.breakdown_requests(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) NOT NULL,
  mechanic_id UUID REFERENCES public.mechanic_profiles(user_id) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- Performance Indexes & Spatial GIST Indexes
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_mechanic_location ON public.mechanic_profiles USING GIST (current_location);
CREATE INDEX IF NOT EXISTS idx_breakdown_location ON public.breakdown_requests USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_breakdown_status ON public.breakdown_requests(status);
CREATE INDEX IF NOT EXISTS idx_breakdown_customer ON public.breakdown_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_breakdown_mechanic ON public.breakdown_requests(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_user ON public.vehicles(user_id);

-- ====================================================================
-- Spatial Discovery Function (PostGIS)
-- ====================================================================

CREATE OR REPLACE FUNCTION public.find_nearby_mechanics(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 15.0,
  vehicle_filter vehicle_type DEFAULT NULL
)
RETURNS TABLE (
  mechanic_id UUID,
  shop_name VARCHAR,
  shop_address TEXT,
  rating NUMERIC,
  review_count INT,
  years_of_experience INT,
  is_verified BOOLEAN,
  distance_km DOUBLE PRECISION,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
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
    (m.verification_status = 'approved') AS is_verified,
    ROUND((ST_Distance(m.current_location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) / 1000)::numeric, 2)::double precision AS distance_km,
    ST_Y(m.current_location::geometry) AS lat,
    ST_X(m.current_location::geometry) AS lng
  FROM public.mechanic_profiles m
  WHERE
    m.is_online = TRUE
    AND m.verification_status = 'approved'
    AND ST_DWithin(
      m.current_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
    AND (vehicle_filter IS NULL OR vehicle_filter = ANY(m.supported_vehicles))
  ORDER BY distance_km ASC;
END;
$$;

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breakdown_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view all profiles, but only update their own
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Vehicles: Customers only access their own vehicles
CREATE POLICY "Customers manage their own vehicles"
  ON public.vehicles FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Breakdown Requests:
-- 1. Customers can create and read their own requests
CREATE POLICY "Customers view own requests"
  ON public.breakdown_requests FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR auth.uid() = mechanic_id);

CREATE POLICY "Customers insert own requests"
  ON public.breakdown_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);

-- 2. Approved Mechanics can see available unassigned requests in their area
CREATE POLICY "Mechanics read assigned or submitted requests"
  ON public.breakdown_requests FOR SELECT TO authenticated
  USING (
    status = 'submitted'
    OR mechanic_id = auth.uid()
  );

-- 3. Mechanics can update status only on jobs assigned to them
CREATE POLICY "Mechanics update assigned jobs"
  ON public.breakdown_requests FOR UPDATE TO authenticated
  USING (
    (mechanic_id IS NULL AND status = 'submitted')
    OR mechanic_id = auth.uid()
  );

-- Reviews: Customers can post reviews for completed jobs
CREATE POLICY "Customers create reviews"
  ON public.mechanic_reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Anyone can read mechanic reviews"
  ON public.mechanic_reviews FOR SELECT TO authenticated USING (true);

-- ====================================================================
-- Part 10: Enterprise Marketplace Schema (V1.0 Software Requirements)
-- ====================================================================

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

-- Quotes
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

-- GST Invoices
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

-- Subscription Plans & Mechanic Subscriptions
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

-- Support Tickets
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



