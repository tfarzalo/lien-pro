-- =====================================================
-- Migration: Create User Kits Table
-- Description: Tracks which kits users own/have access to
-- =====================================================

-- Create enum for access type
CREATE TYPE kit_access_type AS ENUM ('purchased', 'granted', 'trial');

-- Create user_kits table
CREATE TABLE user_kits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lien_kit_id uuid NOT NULL REFERENCES lien_kits(id) ON DELETE CASCADE,
    order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
    granted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
    access_type kit_access_type DEFAULT 'purchased',
    expires_at timestamptz,
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, lien_kit_id)
);

-- Create indexes
CREATE INDEX idx_user_kits_user_id ON user_kits(user_id);
CREATE INDEX idx_user_kits_lien_kit_id ON user_kits(lien_kit_id);
CREATE INDEX idx_user_kits_order_id ON user_kits(order_id);
CREATE INDEX idx_user_kits_user_active ON user_kits(user_id, is_active);

-- Enable RLS
ALTER TABLE user_kits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own kit access
CREATE POLICY "Users can view own kit access"
    ON user_kits FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all kit access
CREATE POLICY "Admins can view all kit access"
    ON user_kits FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can insert kit access
CREATE POLICY "Admins can insert kit access"
    ON user_kits FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can update kit access
CREATE POLICY "Admins can update kit access"
    ON user_kits FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can delete kit access
CREATE POLICY "Admins can delete kit access"
    ON user_kits FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Function to grant kit access when order is completed
CREATE OR REPLACE FUNCTION grant_kits_on_order_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if status changed to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Insert user_kits for each order_item
        INSERT INTO user_kits (user_id, lien_kit_id, order_id, access_type)
        SELECT 
            NEW.user_id,
            oi.lien_kit_id,
            NEW.id,
            'purchased'
        FROM order_items oi
        WHERE oi.order_id = NEW.id
        ON CONFLICT (user_id, lien_kit_id) DO UPDATE
        SET is_active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to grant kit access on order completion
CREATE TRIGGER on_order_completed
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION grant_kits_on_order_completion();

-- Grant permissions
GRANT ALL ON user_kits TO authenticated;
