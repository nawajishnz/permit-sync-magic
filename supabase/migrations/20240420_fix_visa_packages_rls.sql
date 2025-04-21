-- Enable RLS on visa_packages table
ALTER TABLE visa_packages ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON visa_packages;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON visa_packages;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON visa_packages;

-- Create policy for public read access
CREATE POLICY "Enable read access for all users"
ON visa_packages
FOR SELECT
USING (true);

-- Create policy for authenticated users to insert
CREATE POLICY "Enable write access for authenticated users"
ON visa_packages
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy for authenticated users to update
CREATE POLICY "Enable update for authenticated users"
ON visa_packages
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy for authenticated users to delete
CREATE POLICY "Enable delete for authenticated users"
ON visa_packages
FOR DELETE
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT ALL ON visa_packages TO authenticated;
GRANT SELECT ON visa_packages TO anon;

-- Add comment for documentation
COMMENT ON TABLE visa_packages IS 'Stores visa package information with RLS enabled - public read, authenticated write'; 