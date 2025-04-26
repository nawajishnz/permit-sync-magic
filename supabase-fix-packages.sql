
-- Fix for visa_packages table schema
-- COPY AND RUN THIS IN THE SUPABASE SQL EDITOR

-- First, check if the table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS visa_packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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
    ALTER TABLE visa_packages ADD COLUMN total_price numeric;
    UPDATE visa_packages SET total_price = government_fee + service_fee;
    RAISE NOTICE 'Added total_price column to visa_packages table';
  END IF;
END;
$$;

-- Create a function to help save visa packages
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

-- Clear the schema cache for all tables
SELECT pg_notify('supabase_realtime', 'reload_schema'); 

-- Verify the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'visa_packages';
