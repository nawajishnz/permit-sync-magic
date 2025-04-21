-- Run this script in the Supabase SQL editor to fix the visa_packages table structure

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
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Add table comments
    COMMENT ON TABLE visa_packages IS 'Visa packages with pricing information';
    
    -- Create indexes for better performance
    CREATE INDEX idx_visa_packages_country_id ON visa_packages(country_id);
    
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
  END IF;
  
  -- Make sure the updated_at is automatically updated
  IF NOT EXISTS (
    SELECT FROM pg_trigger
    WHERE tgname = 'visa_packages_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION trigger_set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE TRIGGER visa_packages_updated_at
    BEFORE UPDATE ON visa_packages
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$; 

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
  vp.is_active
FROM 
  public.countries c
LEFT JOIN 
  public.visa_packages vp ON c.id = vp.country_id;
  
-- Grant access to the view
GRANT SELECT ON public.countries_with_packages TO anon, authenticated;

-- Run this command to try to update existing data from pricing_tiers if possible
DO $$
DECLARE
  pt RECORD;
  gov_fee NUMERIC;
  srv_fee NUMERIC;
  proc_days INTEGER;
BEGIN
  FOR pt IN 
    SELECT * FROM visa_pricing_tiers
  LOOP
    -- Try to extract pricing data from features
    gov_fee := 0;
    srv_fee := 0;
    proc_days := 15;
    
    -- Try to extract government fee
    BEGIN
      IF EXISTS (
        SELECT FROM jsonb_array_elements_text(pt.features) AS f
        WHERE f LIKE 'Government fee: %'
      ) THEN
        SELECT REGEXP_REPLACE(f, 'Government fee: \$?([0-9.]+)', '\1')::NUMERIC INTO gov_fee
        FROM jsonb_array_elements_text(pt.features) AS f
        WHERE f LIKE 'Government fee: %'
        LIMIT 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error extracting government fee from pricing tier %: %', pt.id, SQLERRM;
    END;
    
    -- Try to extract service fee
    BEGIN
      IF EXISTS (
        SELECT FROM jsonb_array_elements_text(pt.features) AS f
        WHERE f LIKE 'Service fee: %'
      ) THEN
        SELECT REGEXP_REPLACE(f, 'Service fee: \$?([0-9.]+)', '\1')::NUMERIC INTO srv_fee
        FROM jsonb_array_elements_text(pt.features) AS f
        WHERE f LIKE 'Service fee: %'
        LIMIT 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error extracting service fee from pricing tier %: %', pt.id, SQLERRM;
    END;
    
    -- Try to extract processing days
    BEGIN
      SELECT REGEXP_REPLACE(pt.processing_time, '([0-9]+).*', '\1')::INTEGER INTO proc_days
      WHERE pt.processing_time ~ '^\d+';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error extracting processing days from pricing tier %: %', pt.id, SQLERRM;
    END;
    
    -- Check if a visa package already exists for this country
    IF EXISTS (
      SELECT FROM visa_packages WHERE country_id = pt.country_id
    ) THEN
      -- Update existing visa package
      UPDATE visa_packages 
      SET 
        government_fee = gov_fee,
        service_fee = srv_fee,
        processing_days = proc_days,
        updated_at = NOW()
      WHERE country_id = pt.country_id;
      
      RAISE NOTICE 'Updated visa package for country %', pt.country_id;
    ELSE
      -- Insert new visa package
      INSERT INTO visa_packages (
        country_id,
        name,
        government_fee,
        service_fee,
        processing_days
      ) VALUES (
        pt.country_id,
        pt.name,
        gov_fee,
        srv_fee,
        proc_days
      );
      
      RAISE NOTICE 'Created new visa package for country %', pt.country_id;
    END IF;
  END LOOP;
END $$; 