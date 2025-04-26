
-- Simple visa packages SQL script
-- Run this in your Supabase SQL editor to set up the tables and functions

-- Make sure the visa_packages table exists
CREATE TABLE IF NOT EXISTS visa_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Visa Package',
  government_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  service_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  processing_days INTEGER NOT NULL DEFAULT 15,
  total_price NUMERIC(10,2) GENERATED ALWAYS AS (government_fee + service_fee) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Add a unique constraint to ensure one package per country
  CONSTRAINT visa_packages_country_id_key UNIQUE (country_id)
);

-- Add updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_visa_packages_updated_at ON visa_packages;
CREATE TRIGGER update_visa_packages_updated_at
BEFORE UPDATE ON visa_packages
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_updated_at();

-- Enable RLS
ALTER TABLE visa_packages ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY IF NOT EXISTS "Allow authenticated read access to visa packages" 
  ON visa_packages 
  FOR SELECT 
  TO authenticated 
  USING (TRUE);
  
CREATE POLICY IF NOT EXISTS "Allow public read access to visa packages" 
  ON visa_packages 
  FOR SELECT 
  TO anon
  USING (TRUE);

CREATE POLICY IF NOT EXISTS "Allow authenticated insert to visa packages" 
  ON visa_packages 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (TRUE);
  
CREATE POLICY IF NOT EXISTS "Allow authenticated update to visa packages" 
  ON visa_packages 
  FOR UPDATE 
  TO authenticated 
  USING (TRUE);

CREATE POLICY IF NOT EXISTS "Allow authenticated delete from visa packages" 
  ON visa_packages 
  FOR DELETE 
  TO authenticated 
  USING (TRUE);

-- Grant appropriate permissions
GRANT SELECT ON visa_packages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON visa_packages TO authenticated;
