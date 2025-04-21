-- Add fee breakdown columns to visa_packages table
ALTER TABLE visa_packages 
ADD COLUMN government_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN service_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN processing_days INTEGER NOT NULL DEFAULT 15;

-- Update the existing price column to be computed
ALTER TABLE visa_packages DROP COLUMN price;
ALTER TABLE visa_packages ADD COLUMN total_price DECIMAL(10,2) 
GENERATED ALWAYS AS (government_fee + service_fee) STORED;

-- Add a comment explaining the columns
COMMENT ON COLUMN visa_packages.government_fee IS 'Official government visa fee';
COMMENT ON COLUMN visa_packages.service_fee IS 'Permitsy service fee';
COMMENT ON COLUMN visa_packages.processing_days IS 'Number of working days for processing';
COMMENT ON COLUMN visa_packages.total_price IS 'Total price (government fee + service fee)';

-- Convert processing_time from string to use processing_days
ALTER TABLE visa_packages DROP COLUMN processing_time;

-- Update RLS policies
ALTER POLICY "Enable read access for all users" ON "public"."visa_packages"
FOR SELECT USING (true); 