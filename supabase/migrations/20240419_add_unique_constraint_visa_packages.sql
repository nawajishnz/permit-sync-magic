-- Add unique constraint to visa_packages table to ensure only one package per country
ALTER TABLE visa_packages ADD CONSTRAINT unique_country_package UNIQUE (country_id);

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT unique_country_package ON visa_packages IS 'Ensures only one visa package exists per country'; 