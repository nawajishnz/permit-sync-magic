
-- Fix for visa_packages table schema issues
-- Run this in the Supabase SQL editor

-- Create the visa_packages table if it doesn't exist
CREATE TABLE IF NOT EXISTS visa_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Visa Package',
  government_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  service_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  processing_days INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add total_price computed column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'visa_packages' 
    AND column_name = 'total_price'
  ) THEN
    ALTER TABLE visa_packages ADD COLUMN total_price NUMERIC(10,2) 
      GENERATED ALWAYS AS (government_fee + service_fee) STORED;
  END IF;
END $$;

-- Create an index on country_id for better performance
CREATE INDEX IF NOT EXISTS idx_visa_packages_country_id 
  ON visa_packages(country_id);

-- Add unique constraint for one package per country if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'visa_packages_country_id_key'
  ) THEN
    ALTER TABLE visa_packages ADD CONSTRAINT visa_packages_country_id_key 
      UNIQUE (country_id);
  END IF;
END $$;

-- Add updated_at trigger function if not exists
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

-- Make sure RPC function exists for getting country packages
CREATE OR REPLACE FUNCTION get_country_packages(p_country_id UUID)
RETURNS TABLE(
  country_id UUID,
  country_name TEXT,
  package_id UUID,
  package_name TEXT,
  government_fee NUMERIC,
  service_fee NUMERIC,
  processing_days INTEGER,
  total_price NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS country_id,
    c.name AS country_name,
    vp.id AS package_id,
    vp.name AS package_name,
    vp.government_fee,
    vp.service_fee,
    vp.processing_days,
    vp.government_fee + vp.service_fee AS total_price
  FROM countries c
  LEFT JOIN visa_packages vp ON c.id = vp.country_id
  WHERE c.id = p_country_id;
END;
$$ LANGUAGE plpgsql;

-- Make sure RPC function exists for saving visa packages
CREATE OR REPLACE FUNCTION save_visa_package(
  p_country_id UUID,
  p_name TEXT DEFAULT 'Visa Package',
  p_government_fee NUMERIC DEFAULT 0,
  p_service_fee NUMERIC DEFAULT 0,
  p_processing_days INTEGER DEFAULT 15
) 
RETURNS JSONB AS $$
DECLARE
  v_existing_id UUID;
  v_result JSONB;
BEGIN
  -- Check if a package exists for this country
  SELECT id INTO v_existing_id 
  FROM visa_packages 
  WHERE country_id = p_country_id 
  LIMIT 1;
  
  -- Update or insert based on existence
  IF v_existing_id IS NOT NULL THEN
    -- Update existing package
    UPDATE visa_packages
    SET 
      name = p_name,
      government_fee = p_government_fee,
      service_fee = p_service_fee,
      processing_days = p_processing_days,
      updated_at = now()
    WHERE id = v_existing_id;
    
    v_result = jsonb_build_object(
      'id', v_existing_id,
      'action', 'updated',
      'country_id', p_country_id
    );
  ELSE
    -- Insert new package
    INSERT INTO visa_packages(
      country_id, 
      name, 
      government_fee, 
      service_fee, 
      processing_days
    )
    VALUES (
      p_country_id,
      p_name,
      p_government_fee,
      p_service_fee,
      p_processing_days
    )
    RETURNING id INTO v_existing_id;
    
    v_result = jsonb_build_object(
      'id', v_existing_id,
      'action', 'created',
      'country_id', p_country_id
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_country_packages(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_country_packages(UUID) TO anon;
GRANT EXECUTE ON FUNCTION save_visa_package(UUID, TEXT, NUMERIC, NUMERIC, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION save_visa_package(UUID, TEXT, NUMERIC, NUMERIC, INTEGER) TO anon;

-- Enable RLS on the table
ALTER TABLE visa_packages ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for visa_packages table
CREATE POLICY IF NOT EXISTS "Allow public read access to visa packages" 
  ON "public"."visa_packages" 
  FOR SELECT 
  TO anon, authenticated 
  USING (TRUE);

CREATE POLICY IF NOT EXISTS "Allow authenticated users to create visa packages" 
  ON "public"."visa_packages" 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (TRUE);

CREATE POLICY IF NOT EXISTS "Allow authenticated users to update visa packages" 
  ON "public"."visa_packages" 
  FOR UPDATE 
  TO authenticated 
  USING (TRUE) 
  WITH CHECK (TRUE);

CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete visa packages" 
  ON "public"."visa_packages" 
  FOR DELETE 
  TO authenticated 
  USING (TRUE);

-- Grant table access
GRANT SELECT ON visa_packages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON visa_packages TO authenticated;

-- Force schema cache refresh
SELECT pg_notify('supabase_realtime', 'reload_schema');

-- List all columns in the table to verify
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'visa_packages';
