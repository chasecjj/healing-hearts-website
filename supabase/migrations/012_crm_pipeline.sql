-- =====================================================
-- Phase 3: CRM Pipeline + Orders
-- Adds contact tracking and order management for
-- Stripe checkout flow (Rescue Kit, future products)
-- =====================================================

-- CRM contact stages (value ladder progression)
CREATE TYPE crm_stage AS ENUM (
  'visitor',        -- landed on site
  'lead',           -- signed up for Spark / webinar / freebie
  'customer',       -- purchased Rescue Kit or similar
  'enrolled',       -- enrolled in Journey Program (flagship)
  'vip'             -- private coaching / high-touch
);

-- Order status tracking
CREATE TYPE order_status AS ENUM (
  'pending',        -- checkout started, not yet paid
  'completed',      -- payment confirmed
  'refunded',       -- full refund issued
  'failed'          -- payment failed or expired
);

-- =====================================================
-- CRM Contacts — unified contact record across funnel
-- =====================================================
CREATE TABLE crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  stage crm_stage NOT NULL DEFAULT 'visitor',
  source text,                          -- e.g. 'spark', 'webinar', 'rescue-kit', 'organic'
  stripe_customer_id text UNIQUE,
  tags jsonb DEFAULT '[]'::jsonb,       -- flexible tagging: ["physician", "repeat-buyer"]
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_seen_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- Orders — Stripe payment records
-- =====================================================
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_session_id text UNIQUE,
  stripe_payment_intent text,
  product_slug text NOT NULL,           -- e.g. 'rescue-kit', 'journey-program'
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status order_status NOT NULL DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,   -- flexible: coupon codes, utm params, etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- Rescue Kit onboarding drip tracking
-- (reuses existing cron — no new cron job needed)
-- =====================================================
CREATE TABLE rescue_kit_drip (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  purchased_at timestamptz NOT NULL DEFAULT now(),
  current_day integer NOT NULL DEFAULT 0,
  unsubscribed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_rescue_kit_drip_email ON rescue_kit_drip(email);

-- =====================================================
-- Indexes
-- =====================================================
CREATE INDEX idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX idx_crm_contacts_stage ON crm_contacts(stage);
CREATE INDEX idx_crm_contacts_stripe ON crm_contacts(stripe_customer_id);
CREATE INDEX idx_crm_contacts_auth ON crm_contacts(auth_user_id);
CREATE INDEX idx_orders_contact ON orders(contact_id);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX idx_orders_product ON orders(product_slug);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_rescue_kit_drip_day ON rescue_kit_drip(current_day) WHERE unsubscribed = false;

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_kit_drip ENABLE ROW LEVEL SECURITY;

-- CRM contacts: admins can read/write all; users can read own record
CREATE POLICY "crm_contacts_admin" ON crm_contacts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "crm_contacts_own_read" ON crm_contacts
  FOR SELECT USING (auth_user_id = auth.uid());

-- Service role can do everything (webhooks, crons)
CREATE POLICY "crm_contacts_service" ON crm_contacts
  FOR ALL USING (true) WITH CHECK (true);

-- Orders: admins see all; users see own orders
CREATE POLICY "orders_admin" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "orders_own_read" ON orders
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "orders_service_insert" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_service_update" ON orders
  FOR UPDATE USING (true);

-- Rescue kit drip: service role only (cron-driven)
CREATE POLICY "rescue_kit_drip_service" ON rescue_kit_drip
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crm_contacts_updated
  BEFORE UPDATE ON crm_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
