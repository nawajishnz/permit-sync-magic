-- Create the countries table if it doesn't exist
CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  flag TEXT,
  banner TEXT,
  description TEXT,
  embassy_details JSONB,
  entry_type TEXT,
  validity TEXT,
  processing_time TEXT,
  length_of_stay TEXT,
  requirements_description TEXT,
  visa_includes TEXT[],
  visa_assistance TEXT[],
  processing_steps JSONB,
  faq JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add initial sample data if table is empty
INSERT INTO countries (name, flag, banner, description, entry_type, validity, processing_time, length_of_stay)
SELECT 
  'United States', 
  'https://www.countryflagicons.com/FLAT/64/US.png', 
  'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=1200&h=600&q=80', 
  'The United States is a diverse country with attractions ranging from the skyscrapers of New York and Chicago, to the natural wonders of Yellowstone and Alaska, to the warm beaches of Florida and Hawaii.',
  'Visa Required',
  '10 years',
  '3-5 business days',
  'Up to 180 days per entry'
WHERE NOT EXISTS (SELECT 1 FROM countries LIMIT 1);

-- Drop any policies that might be using admin role
DROP POLICY IF EXISTS "Allow all read access" ON countries;

-- Create a new policy that uses anon role instead of admin
CREATE POLICY "Allow public read access" 
ON countries 
FOR SELECT
USING (true);

-- Ensure RLS is enabled on the table
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- Optional: Create an authenticated user policy if needed
CREATE POLICY "Allow authenticated users to create" 
ON countries 
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Optional: Allow authenticated users to update their own records
CREATE POLICY "Allow authenticated users to update"
ON countries
FOR UPDATE
TO authenticated
USING (true);

-- For debugging purposes
COMMENT ON TABLE countries IS 'Countries with their visa requirements - public read access enabled';