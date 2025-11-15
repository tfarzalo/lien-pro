-- =====================================================
-- Migration: Create Orders and Order Items Tables
-- Description: E-commerce order management
-- =====================================================

-- Create enum types
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('card', 'ach', 'invoice');

-- Create orders table
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    order_number text UNIQUE NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    subtotal_cents integer NOT NULL CHECK (subtotal_cents >= 0),
    tax_cents integer DEFAULT 0 CHECK (tax_cents >= 0),
    total_cents integer NOT NULL CHECK (total_cents >= 0),
    currency text DEFAULT 'USD',
    payment_intent_id text,
    payment_method payment_method,
    billing_email text,
    billing_address jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    lien_kit_id uuid NOT NULL REFERENCES lien_kits(id),
    quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
    total_price_cents integer NOT NULL CHECK (total_price_cents >= 0),
    kit_name text NOT NULL,
    kit_features jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);

-- Create indexes for order_items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_lien_kit_id ON order_items(lien_kit_id);

-- Add updated_at trigger for orders
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending orders
CREATE POLICY "Users can update own pending orders"
    ON orders FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can update any order
CREATE POLICY "Admins can update all orders"
    ON orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- RLS Policies for order_items
-- Users can view items from their own orders
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Users can insert items to their own orders
CREATE POLICY "Users can insert own order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
    new_order_number text;
    done boolean;
BEGIN
    done := false;
    WHILE NOT done LOOP
        new_order_number := 'LP-' || LPAD(floor(random() * 99999999)::text, 8, '0');
        done := NOT EXISTS(SELECT 1 FROM orders WHERE order_number = new_order_number);
    END LOOP;
    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
