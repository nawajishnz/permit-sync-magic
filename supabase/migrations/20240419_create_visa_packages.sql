-- Create visa_packages table if it doesn't exist
CREATE TABLE IF NOT EXISTS visa_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES countries(id),
    name TEXT NOT NULL,
    government_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    service_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    processing_days INTEGER NOT NULL DEFAULT 15,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (government_fee + service_fee) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE visa_packages IS 'Stores visa package information including fees and processing time';
COMMENT ON COLUMN visa_packages.government_fee IS 'Official government visa fee';
COMMENT ON COLUMN visa_packages.service_fee IS 'Permitsy service fee';
COMMENT ON COLUMN visa_packages.processing_days IS 'Number of working days for processing';
COMMENT ON COLUMN visa_packages.total_price IS 'Total price (government fee + service fee)';

-- Add unique constraint
ALTER TABLE visa_packages ADD CONSTRAINT unique_country_package UNIQUE (country_id);

-- Enable RLS
ALTER TABLE visa_packages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users"
ON visa_packages
FOR SELECT
USING (true);

CREATE POLICY "Enable write access for authenticated users"
ON visa_packages
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON visa_packages
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON visa_packages
FOR DELETE
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT ALL ON visa_packages TO authenticated;
GRANT SELECT ON visa_packages TO anon; 