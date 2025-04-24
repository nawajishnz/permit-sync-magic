
-- Fix for visa_packages table schema
-- This migration ensures all necessary columns exist in the visa_packages table

-- First, check if the table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS visa_packages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  name text NOT NULL,
  government_fee numeric DEFAULT 0,
  service_fee numeric DEFAULT 0,
  processing_days integer DEFAULT 15,
  total_price numeric GENERATED ALWAYS AS (government_fee + service_fee) STORED,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Now add columns if they don't exist
DO $$
BEGIN
  -- Add government_fee column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'visa_packages' AND column_name = 'government_fee'
  ) THEN
    ALTER TABLE visa_packages ADD COLUMN government_fee numeric DEFAULT 0;
    RAISE NOTICE 'Added government_fee column to visa_packages table';
  END IF;

  -- Add service_fee column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'visa_packages' AND column_name = 'service_fee'
  ) THEN
    ALTER TABLE visa_packages ADD COLUMN service_fee numeric DEFAULT 0;
    RAISE NOTICE 'Added service_fee column to visa_packages table';
  END IF;

  -- Add processing_days column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'visa_packages' AND column_name = 'processing_days'
  ) THEN
    ALTER TABLE visa_packages ADD COLUMN processing_days integer DEFAULT 15;
    RAISE NOTICE 'Added processing_days column to visa_packages table';
  END IF;
  
  -- Add total_price column if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'visa_packages' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE visa_packages ADD COLUMN total_price numeric GENERATED ALWAYS AS (government_fee + service_fee) STORED;
    RAISE NOTICE 'Added total_price computed column to visa_packages table';
  END IF;
END;
$$;

-- Create a get_table_info function for querying table schema
-- This will be used by the schema diagnostics to check the schema
CREATE OR REPLACE FUNCTION get_table_info(p_table_name text)
RETURNS TABLE(
  column_name text,
  data_type text,
  is_nullable boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.column_name::text,
    c.data_type::text,
    (c.is_nullable = 'YES')::boolean
  FROM information_schema.columns c
  WHERE c.table_name = p_table_name
  AND c.table_schema = 'public';
END;
$$ LANGUAGE plpgsql;

-- Create a helper function to get country packages (safer than relying on views)
CREATE OR REPLACE FUNCTION get_country_packages(p_country_id uuid)
RETURNS TABLE(
  country_id uuid,
  country_name text,
  package_id uuid,
  package_name text,
  government_fee numeric,
  service_fee numeric,
  processing_days integer,
  total_price numeric
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
    vp.total_price
  FROM countries c
  LEFT JOIN visa_packages vp ON c.id = vp.country_id
  WHERE c.id = p_country_id;
END;
$$ LANGUAGE plpgsql;

-- Create a helper function to save visa packages with proper error handling
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
GRANT EXECUTE ON FUNCTION get_table_info(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_info(text) TO anon;
GRANT EXECUTE ON FUNCTION save_visa_package(uuid, text, numeric, numeric, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION save_visa_package(uuid, text, numeric, numeric, integer) TO anon;
GRANT EXECUTE ON FUNCTION get_country_packages(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_country_packages(uuid) TO anon;

-- Create a view to link countries and visa packages for easier querying
DROP VIEW IF EXISTS public.countries_with_packages;
CREATE VIEW public.countries_with_packages AS
SELECT 
  c.id as country_id,
  c.name as country_name,
  c.flag as country_flag,
  c.banner as country_banner,
  c.entry_type,
  c.validity,
  c.length_of_stay,
  vp.id as package_id,
  vp.name as package_name,
  vp.government_fee,
  vp.service_fee,
  vp.processing_days,
  vp.total_price
FROM 
  public.countries c
LEFT JOIN 
  public.visa_packages vp ON c.id = vp.country_id;

-- Grant access to the view
GRANT SELECT ON public.countries_with_packages TO anon, authenticated;

-- Clear the schema cache for all tables
SELECT pg_notify('supabase_realtime', 'reload_schema'); 
