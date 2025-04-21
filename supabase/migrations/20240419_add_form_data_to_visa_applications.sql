-- Add form_data column to visa_applications table
ALTER TABLE visa_applications ADD COLUMN form_data JSONB;

-- Add a comment explaining the column
COMMENT ON COLUMN visa_applications.form_data IS 'Stores the complete form data for the visa application including personal info, travel info, passport info, and documents';

-- Make sure RLS policies are updated to allow access to the new column
ALTER POLICY "Allow users to view their own applications" 
ON visa_applications 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

ALTER POLICY "Allow users to update their own applications" 
ON visa_applications 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

ALTER POLICY "Allow users to insert their own applications" 
ON visa_applications 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id); 