-- =====================================================
-- Migration: Create Profiles Table
-- Description: Extends Supabase Auth with user profiles
-- =====================================================

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'attorney', 'admin');
CREATE TYPE subscription_status AS ENUM ('free', 'active', 'cancelled', 'past_due');
CREATE TYPE subscription_tier AS ENUM ('basic', 'professional', 'enterprise');

-- Create profiles table
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    company_name text,
    phone text,
    role user_role NOT NULL DEFAULT 'user',
    subscription_status subscription_status DEFAULT 'free',
    subscription_tier subscription_tier,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function (reusable for all tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is admin or attorney
CREATE OR REPLACE FUNCTION is_admin_or_attorney(user_id uuid)
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role IN ('admin', 'attorney')
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies for profiles
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    );

-- Admins and attorneys can view all profiles
CREATE POLICY "Admins and attorneys can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin_or_attorney(auth.uid()));

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
