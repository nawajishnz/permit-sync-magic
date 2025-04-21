-- Run this script in the Supabase SQL editor to fix pricing tiers
-- This ensures that pricing tier data is properly saved and persisted

-- First, create a function to upsert pricing tiers
CREATE OR REPLACE FUNCTION upsert_pricing_tier(
  p_country_id UUID,
  p_name TEXT,
  p_price TEXT,
  p_processing_time TEXT,
  p_features JSONB,
  p_is_recommended BOOLEAN
) RETURNS SETOF visa_pricing_tiers AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Check if a pricing tier already exists for this country
  SELECT id INTO v_id FROM visa_pricing_tiers WHERE country_id = p_country_id LIMIT 1;
  
  IF v_id IS NOT NULL THEN
    -- Update existing record
    UPDATE visa_pricing_tiers SET
      name = p_name,
      price = p_price,
      processing_time = p_processing_time,
      features = p_features,
      is_recommended = p_is_recommended,
      updated_at = NOW()
    WHERE id = v_id;
    
    RETURN QUERY SELECT * FROM visa_pricing_tiers WHERE id = v_id;
  ELSE
    -- Insert new record
    RETURN QUERY INSERT INTO visa_pricing_tiers (
      country_id,
      name,
      price,
      processing_time,
      features,
      is_recommended
    ) VALUES (
      p_country_id,
      p_name,
      p_price,
      p_processing_time,
      p_features,
      p_is_recommended
    ) RETURNING *;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to directly get pricing for a country 
CREATE OR REPLACE FUNCTION get_country_pricing(country_id_param UUID)
RETURNS SETOF visa_pricing_tiers AS $$
BEGIN
  RETURN QUERY SELECT * FROM visa_pricing_tiers WHERE country_id = country_id_param;
END;
$$ LANGUAGE plpgsql;

-- Fix any potential permission issues
GRANT EXECUTE ON FUNCTION upsert_pricing_tier TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_pricing_tier TO anon;
GRANT EXECUTE ON FUNCTION get_country_pricing TO authenticated;
GRANT EXECUTE ON FUNCTION get_country_pricing TO anon;

-- Make sure the visa_pricing_tiers table exists and has the right columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'visa_pricing_tiers'
  ) THEN
    CREATE TABLE public.visa_pricing_tiers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price TEXT NOT NULL,
      processing_time TEXT NOT NULL,
      features JSONB DEFAULT '[]'::jsonb,
      is_recommended BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Add table comments
    COMMENT ON TABLE visa_pricing_tiers IS 'Pricing tiers for visa packages';
    
    -- Create indexes for better performance
    CREATE INDEX idx_visa_pricing_tiers_country_id ON visa_pricing_tiers(country_id);
    
    -- Enable RLS
    ALTER TABLE visa_pricing_tiers ENABLE ROW LEVEL SECURITY;
    
    -- Add RLS policies
    CREATE POLICY "Allow public read access to visa pricing tiers" 
      ON visa_pricing_tiers 
      FOR SELECT 
      TO anon, authenticated 
      USING (TRUE);
      
    CREATE POLICY "Allow authenticated users to create visa pricing tiers" 
      ON visa_pricing_tiers 
      FOR INSERT 
      TO authenticated 
      WITH CHECK (TRUE);
      
    CREATE POLICY "Allow authenticated users to update visa pricing tiers" 
      ON visa_pricing_tiers 
      FOR UPDATE 
      TO authenticated 
      USING (TRUE) 
      WITH CHECK (TRUE);
      
    CREATE POLICY "Allow authenticated users to delete visa pricing tiers" 
      ON visa_pricing_tiers 
      FOR DELETE 
      TO authenticated 
      USING (TRUE);
  END IF;
  
  -- Make sure the updated_at is automatically updated
  IF NOT EXISTS (
    SELECT FROM pg_trigger
    WHERE tgname = 'visa_pricing_tiers_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION trigger_set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE TRIGGER visa_pricing_tiers_updated_at
    BEFORE UPDATE ON visa_pricing_tiers
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();
  END IF;

END $$; 