
-- Fix for the save_visa_package function
-- Run this in your Supabase SQL editor

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS save_visa_package;

-- Recreate the function with proper parameter handling
CREATE OR REPLACE FUNCTION save_visa_package(
  p_country_id uuid,
  p_name text DEFAULT 'Visa Package',
  p_government_fee numeric DEFAULT 0,
  p_service_fee numeric DEFAULT 0,
  p_processing_days integer DEFAULT 15
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing_id uuid;
  v_result jsonb;
BEGIN
  -- Debug log
  RAISE LOG 'save_visa_package called with: country_id=%, name=%, government_fee=%, service_fee=%, processing_days=%',
    p_country_id, p_name, p_government_fee, p_service_fee, p_processing_days;
  
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
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION save_visa_package TO authenticated;
GRANT EXECUTE ON FUNCTION save_visa_package TO anon;

-- Also create an overloaded function that accepts the parameters by name
-- This helps handle the "All object keys must match" error
CREATE OR REPLACE FUNCTION save_visa_package(args jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_country_id uuid;
  v_name text;
  v_government_fee numeric;
  v_service_fee numeric;
  v_processing_days integer;
  v_result jsonb;
BEGIN
  -- Extract parameters from JSON
  v_country_id := (args->>'p_country_id')::uuid;
  v_name := COALESCE(args->>'p_name', 'Visa Package');
  v_government_fee := COALESCE((args->>'p_government_fee')::numeric, 0);
  v_service_fee := COALESCE((args->>'p_service_fee')::numeric, 0);
  v_processing_days := COALESCE((args->>'p_processing_days')::integer, 15);
  
  -- Call the main function
  v_result := save_visa_package(
    v_country_id,
    v_name,
    v_government_fee,
    v_service_fee,
    v_processing_days
  );
  
  RETURN v_result;
END;
$$;

-- Grant necessary permissions for the overloaded function too
GRANT EXECUTE ON FUNCTION save_visa_package(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION save_visa_package(jsonb) TO anon;

-- View function definition to verify it's correct
SELECT pg_get_functiondef('save_visa_package(uuid, text, numeric, numeric, integer)'::regproc);
SELECT pg_get_functiondef('save_visa_package(jsonb)'::regproc);
