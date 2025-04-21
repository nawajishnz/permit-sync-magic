-- RECREATE VISA_PACKAGES TABLE FROM SCRATCH
-- WARNING: This will delete and recreate the table - backup any existing data first!

-- First, back up existing data (if any)
CREATE TEMP TABLE IF NOT EXISTS visa_packages_backup AS
SELECT * FROM visa_packages WHERE 1=1;

SELECT COUNT(*) AS backed_up_records FROM visa_packages_backup;

-- Drop the existing table and any dependent objects
DROP TABLE IF EXISTS visa_packages CASCADE;

-- Create the table fresh with all required columns
CREATE TABLE visa_packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  name text NOT NULL,
  government_fee numeric NOT NULL DEFAULT 0,
  service_fee numeric NOT NULL DEFAULT 0,
  processing_days integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add any indexes that might be needed
CREATE INDEX visa_packages_country_id_idx ON visa_packages(country_id);

-- Restore data from backup if available
INSERT INTO visa_packages (
  id, country_id, name, government_fee, service_fee, processing_days, created_at, updated_at
)
SELECT 
  id, 
  country_id, 
  name, 
  COALESCE(government_fee, 0) AS government_fee, 
  COALESCE(service_fee, 0) AS service_fee, 
  COALESCE(processing_days, 0) AS processing_days, 
  created_at, 
  updated_at
FROM 
  visa_packages_backup
WHERE EXISTS (SELECT 1 FROM visa_packages_backup LIMIT 1);

-- Check the resulting table structure
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM 
    information_schema.columns 
WHERE 
    table_name = 'visa_packages'
ORDER BY 
    ordinal_position;

-- Create RPC function again
CREATE OR REPLACE FUNCTION save_visa_package(
  p_country_id uuid,
  p_name text,
  p_government_fee numeric,
  p_service_fee numeric,
  p_processing_days integer
) 
RETURNS jsonb AS $$
DECLARE
  v_existing_id uuid;
  v_result jsonb;
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
GRANT EXECUTE ON FUNCTION save_visa_package(uuid, text, numeric, numeric, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION save_visa_package(uuid, text, numeric, numeric, integer) TO anon;

-- Force schema cache refresh
SELECT pg_notify('supabase_realtime', 'reload_schema'); 