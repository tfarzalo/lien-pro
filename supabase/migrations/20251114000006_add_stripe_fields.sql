-- =====================================================
-- Add Stripe Integration Fields
-- Migration: 20251114000006
-- =====================================================

-- Add Stripe fields to lien_kits table
ALTER TABLE lien_kits
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_metadata JSONB DEFAULT '{}';

-- Add index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_lien_kits_stripe_price_id ON lien_kits(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_lien_kits_stripe_product_id ON lien_kits(stripe_product_id);

-- Add Stripe fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS payment_metadata JSONB DEFAULT '{}';

-- Add index for Stripe session lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);

-- Add comment explaining Stripe integration
COMMENT ON COLUMN lien_kits.stripe_product_id IS 'Stripe Product ID for this lien kit';
COMMENT ON COLUMN lien_kits.stripe_price_id IS 'Stripe Price ID for this lien kit';
COMMENT ON COLUMN orders.stripe_session_id IS 'Stripe Checkout Session ID';
COMMENT ON COLUMN orders.stripe_payment_intent_id IS 'Stripe Payment Intent ID';

-- Update sample data with test Stripe IDs (for development)
-- In production, these would be real Stripe IDs
UPDATE lien_kits
SET 
  stripe_product_id = CASE 
    WHEN category = 'residential' THEN 'prod_test_residential_kit'
    WHEN category = 'commercial' THEN 'prod_test_commercial_kit'
    WHEN category = 'subcontractor' THEN 'prod_test_subcontractor_kit'
    WHEN category = 'specialty' THEN 'prod_test_specialty_kit'
  END,
  stripe_price_id = CASE 
    WHEN category = 'residential' THEN 'price_test_residential_299'
    WHEN category = 'commercial' THEN 'price_test_commercial_499'
    WHEN category = 'subcontractor' THEN 'price_test_subcontractor_399'
    WHEN category = 'specialty' THEN 'price_test_specialty_599'
  END
WHERE stripe_product_id IS NULL;

-- Create a function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Add a trigger to auto-generate order numbers if not provided
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();
