
-- Run this script in the Supabase SQL editor to fix the visa_packages table structure

-- First check if uuid-ossp extension is available (needed for uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the table info function - required for schema diagnostics
CREATE OR REPLACE FUNCTION get_table_info(p_table_name text)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(row_to_json(cols))
    INTO result
    FROM (
        SELECT 
            column_name, 
            data_type, 
            is_nullable = 'YES' as is_nullable
        FROM 
            information_schema.columns
        WHERE 
            table_name = p_table_name
            AND table_schema = 'public'
        ORDER BY 
            ordinal_position
    ) cols;
    
    RETURN result;
END;
$$;

-- Grant necessary permissions for the table info function
GRANT EXECUTE ON FUNCTION get_table_info(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_info(text) TO anon;

-- Check if the visa_packages table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'visa_packages'
  ) THEN
    CREATE TABLE public.visa_packages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      government_fee NUMERIC NOT NULL DEFAULT 0,
      service_fee NUMERIC NOT NULL DEFAULT 0,
      processing_days INTEGER NOT NULL DEFAULT 15,
      total_price NUMERIC GENERATED ALWAYS AS (government_fee + service_fee) STORED,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Add table comments
    COMMENT ON TABLE visa_packages IS 'Visa packages with pricing information';
    
    -- Create indexes for better performance
    CREATE INDEX idx_visa_packages_country_id ON visa_packages(country_id);
    
    -- Add unique constraint for one package per country
    ALTER TABLE visa_packages ADD CONSTRAINT visa_packages_country_id_key UNIQUE (country_id);
    
    -- Enable RLS
    ALTER TABLE visa_packages ENABLE ROW LEVEL SECURITY;
    
    -- Add RLS policies
    CREATE POLICY "Allow public read access to visa packages" 
      ON visa_packages 
      FOR SELECT 
      TO anon, authenticated 
      USING (TRUE);
      
    CREATE POLICY "Allow authenticated users to create visa packages" 
      ON visa_packages 
      FOR INSERT 
      TO authenticated 
      WITH CHECK (TRUE);
      
    CREATE POLICY "Allow authenticated users to update visa packages" 
      ON visa_packages 
      FOR UPDATE 
      TO authenticated 
      USING (TRUE) 
      WITH CHECK (TRUE);
      
    CREATE POLICY "Allow authenticated users to delete visa packages" 
      ON visa_packages 
      FOR DELETE 
      TO authenticated 
      USING (TRUE);
      
  ELSE
    -- Add the missing columns if they don't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'visa_packages' 
      AND column_name = 'government_fee'
    ) THEN
      ALTER TABLE public.visa_packages ADD COLUMN government_fee NUMERIC NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'visa_packages' 
      AND column_name = 'service_fee'
    ) THEN
      ALTER TABLE public.visa_packages ADD COLUMN service_fee NUMERIC NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'visa_packages' 
      AND column_name = 'processing_days'
    ) THEN
      ALTER TABLE public.visa_packages ADD COLUMN processing_days INTEGER NOT NULL DEFAULT 15;
    END IF;
    
    -- Add computed total_price column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'visa_packages' 
      AND column_name = 'total_price'
    ) THEN
      -- First add the column without the generated always constraint
      ALTER TABLE public.visa_packages ADD COLUMN total_price NUMERIC;
      
      -- Update it based on existing data
      UPDATE public.visa_packages SET total_price = government_fee + service_fee;
      
      -- Then drop and recreate as GENERATED ALWAYS (requires Postgres 12+)
      ALTER TABLE public.visa_packages DROP COLUMN total_price;
      ALTER TABLE public.visa_packages ADD COLUMN total_price NUMERIC 
      GENERATED ALWAYS AS (government_fee + service_fee) STORED;
    END IF;
  END IF;
  
  -- Make sure the updated_at is automatically updated
  CREATE OR REPLACE FUNCTION trigger_set_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  DROP TRIGGER IF EXISTS visa_packages_updated_at_trigger ON visa_packages;
  CREATE TRIGGER visa_packages_updated_at_trigger
  BEFORE UPDATE ON visa_packages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

END $$; 

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS save_visa_package(uuid, text, numeric, numeric, integer);
DROP FUNCTION IF EXISTS save_visa_package(jsonb);

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
SECURITY DEFINER
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
  
  -- Update the corresponding country to mark it has having a visa package
  -- Only mark as having a package if either fee is > 0
  UPDATE countries
  SET 
    has_visa_package = (p_government_fee > 0 OR p_service_fee > 0),
    updated_at = now()
  WHERE id = p_country_id;
  
  RETURN v_result;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION save_visa_package(uuid, text, numeric, numeric, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION save_visa_package(uuid, text, numeric, numeric, integer) TO anon;

-- Create a view to link countries and visa packages for easier querying
CREATE OR REPLACE VIEW public.countries_with_packages AS
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
  vp.government_fee + vp.service_fee as total_price,
  (vp.government_fee > 0 OR vp.service_fee > 0) as is_active
FROM 
  public.countries c
LEFT JOIN 
  public.visa_packages vp ON c.id = vp.country_id;

-- Grant access to the view
GRANT SELECT ON public.countries_with_packages TO anon, authenticated;

-- Create a function that can be called to check the schema
CREATE OR REPLACE FUNCTION check_visa_packages_schema()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'table_exists', EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'visa_packages'
    ),
    'function_exists', EXISTS (
      SELECT FROM pg_proc
      WHERE proname = 'save_visa_package'
    ),
    'view_exists', EXISTS (
      SELECT FROM information_schema.views
      WHERE table_schema = 'public' AND table_name = 'countries_with_packages'
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant access to the check function
GRANT EXECUTE ON FUNCTION check_visa_packages_schema() TO authenticated;
GRANT EXECUTE ON FUNCTION check_visa_packages_schema() TO anon;

-- Notify system to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Display current schema state
SELECT check_visa_packages_schema();
