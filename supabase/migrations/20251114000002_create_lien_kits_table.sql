-- =====================================================
-- Migration: Create Lien Kits Table
-- Description: Product catalog for lien form packages
-- =====================================================

-- Create enum for kit categories
CREATE TYPE kit_category AS ENUM ('residential', 'commercial', 'subcontractor', 'specialty');

-- Create lien_kits table
CREATE TABLE lien_kits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    long_description text,
    price_cents integer NOT NULL CHECK (price_cents >= 0),
    category kit_category,
    jurisdiction text DEFAULT 'texas',
    is_active boolean DEFAULT true,
    is_popular boolean DEFAULT false,
    features jsonb DEFAULT '[]'::jsonb,
    includes_attorney_review boolean DEFAULT false,
    form_template_ids jsonb DEFAULT '[]'::jsonb,
    sort_order integer DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_lien_kits_slug ON lien_kits(slug);
CREATE INDEX idx_lien_kits_is_active ON lien_kits(is_active);
CREATE INDEX idx_lien_kits_category ON lien_kits(category);
CREATE INDEX idx_lien_kits_sort_order ON lien_kits(sort_order);

-- Add updated_at trigger
CREATE TRIGGER update_lien_kits_updated_at
    BEFORE UPDATE ON lien_kits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE lien_kits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view active lien kits
CREATE POLICY "Anyone can view active lien kits"
    ON lien_kits FOR SELECT
    USING (is_active = true);

-- Admins can view all lien kits (including inactive)
CREATE POLICY "Admins can view all lien kits"
    ON lien_kits FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Only admins can insert lien kits
CREATE POLICY "Admins can insert lien kits"
    ON lien_kits FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Only admins can update lien kits
CREATE POLICY "Admins can update lien kits"
    ON lien_kits FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Only admins can delete lien kits
CREATE POLICY "Admins can delete lien kits"
    ON lien_kits FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Grant permissions
GRANT ALL ON lien_kits TO authenticated;
GRANT SELECT ON lien_kits TO anon;
