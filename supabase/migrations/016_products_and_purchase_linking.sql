-- =====================================================
-- Phase 3: Products catalog + purchase-linking trigger
-- Products table maps Stripe prices to access grants.
-- DB trigger auto-links purchases when users sign up.
-- =====================================================

-- =====================================================
-- FIX: Add unique constraint on enrollments for
-- ON CONFLICT and upsert support
-- =====================================================
ALTER TABLE enrollments
  ADD CONSTRAINT enrollments_user_course_unique UNIQUE (user_id, course_id);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL,
  stripe_price_id text NOT NULL,
  product_type text NOT NULL DEFAULT 'one-time'
    CHECK (product_type IN ('one-time', 'subscription')),
  access_grants jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read active, public products (for product pages)
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = true AND is_public = true);

-- Admins can read all products (including inactive/private)
CREATE POLICY "products_admin_read" ON products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can write products
CREATE POLICY "products_admin_write" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Service role bypasses RLS by default, no explicit policy needed.

-- =====================================================
-- SEED PRODUCTS
-- =====================================================

DO $$
DECLARE
  course_uuid uuid;
BEGIN
  SELECT id INTO course_uuid FROM courses WHERE slug = 'healing-hearts-journey' LIMIT 1;

  IF course_uuid IS NULL THEN
    RAISE WARNING 'Course healing-hearts-journey not found. Full-course product will have null course_id.';
  END IF;

  INSERT INTO products (slug, name, description, price_cents, stripe_price_id, product_type, access_grants, is_active, is_public) VALUES
    (
      'rescue-kit',
      'Conflict Rescue Kit',
      'SPARK Method frameworks, Critter Brain guide, reflection prompts and more',
      3900,
      'price_1TKRunLBP5IHGcpKVJhMbgpU',
      'one-time',
      '{"type": "download", "download_slug": "rescue-kit"}'::jsonb,
      true,
      true
    ),
    (
      'card-pack',
      'Healing Hearts Card Pack',
      'Printable conversation cards for couples',
      3500,
      'price_1TKRv1LBP5IHGcpKicaivpHM',
      'one-time',
      '{"type": "download", "download_slug": "card-pack"}'::jsonb,
      true,
      true
    ),
    (
      'full-course',
      'Healing Hearts Journey Program',
      'Complete 8-module couples healing program',
      1299700,
      'price_1TKRvFLBP5IHGcpKquLCpOC6',
      'one-time',
      jsonb_build_object('type', 'enrollment', 'course_id', course_uuid::text),
      true,
      false
    );
END $$;

-- =====================================================
-- PURCHASE-LINKING TRIGGER
-- When a new user signs up, link any existing purchases
-- to their account and grant access.
-- =====================================================
CREATE OR REPLACE FUNCTION link_purchases_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  contact_record RECORD;
  order_record RECORD;
BEGIN
  -- Find matching CRM contact by email
  SELECT * INTO contact_record
  FROM crm_contacts
  WHERE email = NEW.email;

  IF contact_record IS NULL THEN
    RETURN NEW;
  END IF;

  -- Link auth user to CRM contact
  UPDATE crm_contacts
  SET auth_user_id = NEW.id
  WHERE id = contact_record.id;

  -- Process each completed order for this contact
  FOR order_record IN
    SELECT o.*, p.access_grants
    FROM orders o
    JOIN products p ON p.slug = o.product_slug
    WHERE o.contact_id = contact_record.id
      AND o.status = 'completed'
  LOOP
    -- Link order to auth user
    UPDATE orders SET auth_user_id = NEW.id WHERE id = order_record.id;

    -- Process enrollment grants
    IF (order_record.access_grants->>'type') = 'enrollment' THEN
      INSERT INTO enrollments (user_id, course_id, status, stripe_payment_id)
      VALUES (
        NEW.id,
        (order_record.access_grants->>'course_id')::uuid,
        'active',
        order_record.stripe_payment_intent
      )
      ON CONFLICT DO NOTHING;
    END IF;
    -- 'download' type: no enrollment row needed, Downloads page queries orders + products
  END LOOP;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block signup due to purchase-linking failure.
  -- Log the error but let the user sign up.
  DECLARE err_msg text;
  BEGIN
    GET STACKED DIAGNOSTICS err_msg = MESSAGE_TEXT;
    RAISE WARNING 'link_purchases_on_signup failed: %', err_msg;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_link_purchases
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION link_purchases_on_signup();
