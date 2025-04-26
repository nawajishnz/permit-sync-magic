
-- Function to fix visa_packages schema issues
-- Run this in your Supabase SQL editor
CREATE OR REPLACE FUNCTION fix_visa_packages_schema()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
  v_table_exists BOOLEAN;
BEGIN
  -- Check if the table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'visa_packages'
  ) INTO v_table_exists;
  
  -- Create table if it doesn't exist
  IF NOT v_table_exists THEN
    CREATE TABLE visa_packages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
      name TEXT NOT NULL DEFAULT 'Visa Package',
      government_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
      service_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
      processing_days INTEGER NOT NULL DEFAULT 15,
      total_price NUMERIC(10,2) GENERATED ALWAYS AS (government_fee + service_fee) STORED,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Add unique constraint
    ALTER TABLE visa_packages ADD CONSTRAINT unique_country_package UNIQUE (country_id);
    
    v_result = jsonb_build_object(
      'action', 'created',
      'message', 'visa_packages table created successfully'
    );
  ELSE
    -- Table exists, check for missing columns
    
    -- Check if government_fee column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'visa_packages' 
      AND column_name = 'government_fee'
    ) THEN
      -- Add government_fee column
      ALTER TABLE visa_packages ADD COLUMN government_fee NUMERIC(10,2) DEFAULT 0;
    END IF;
    
    -- Check if service_fee column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'visa_packages' 
      AND column_name = 'service_fee'
    ) THEN
      -- Add service_fee column
      ALTER TABLE visa_packages ADD COLUMN service_fee NUMERIC(10,2) DEFAULT 0;
    END IF;
    
    -- Check if processing_days column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'visa_packages' 
      AND column_name = 'processing_days'
    ) THEN
      -- Add processing_days column
      ALTER TABLE visa_packages ADD COLUMN processing_days INTEGER DEFAULT 15;
    END IF;
    
    -- Check if total_price column exists
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'visa_packages' 
      AND column_name = 'total_price'
    ) THEN
      -- Add total_price column as computed column
      ALTER TABLE visa_packages ADD COLUMN total_price NUMERIC(10,2);
      
      -- Update it based on existing data
      UPDATE visa_packages SET total_price = government_fee + service_fee;
      
      -- Drop and recreate as GENERATED ALWAYS
      ALTER TABLE visa_packages DROP COLUMN total_price;
      ALTER TABLE visa_packages ADD COLUMN total_price NUMERIC(10,2) 
          GENERATED ALWAYS AS (government_fee + service_fee) STORED;
    END IF;
    
    v_result = jsonb_build_object(
      'action', 'updated',
      'message', 'visa_packages table columns fixed'
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION fix_visa_packages_schema() TO authenticated;
GRANT EXECUTE ON FUNCTION fix_visa_packages_schema() TO anon;

-- Run the fix immediately
SELECT fix_visa_packages_schema();
