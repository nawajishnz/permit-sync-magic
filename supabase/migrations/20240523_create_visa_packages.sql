-- Create visa_packages table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."visa_packages" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "country_id" uuid REFERENCES "public"."countries"("id") ON DELETE CASCADE,
  "name" text NOT NULL DEFAULT 'Visa Package',
  "government_fee" numeric(10,2) NOT NULL DEFAULT 0,
  "service_fee" numeric(10,2) NOT NULL DEFAULT 0,
  "processing_days" integer NOT NULL DEFAULT 15,
  "total_price" numeric(10,2) GENERATED ALWAYS AS (government_fee + service_fee) STORED,
  "created_at" timestamp WITH time zone DEFAULT now(),
  "updated_at" timestamp WITH time zone DEFAULT now(),
  
  CONSTRAINT "visa_packages_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "visa_packages_country_id_key" UNIQUE ("country_id")
);

-- Add RLS policies for visa_packages table
ALTER TABLE "public"."visa_packages" ENABLE ROW LEVEL SECURITY;

-- Policy for anon and authenticated users to read visa packages
CREATE POLICY "Allow public read access to visa packages" 
  ON "public"."visa_packages" 
  FOR SELECT 
  TO anon, authenticated 
  USING (TRUE);

-- Policy for authenticated users to insert visa packages  
CREATE POLICY "Allow authenticated users to create visa packages" 
  ON "public"."visa_packages" 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (TRUE);

-- Policy for authenticated users to update visa packages
CREATE POLICY "Allow authenticated users to update visa packages" 
  ON "public"."visa_packages" 
  FOR UPDATE 
  TO authenticated 
  USING (TRUE) 
  WITH CHECK (TRUE);

-- Policy for authenticated users to delete visa packages
CREATE POLICY "Allow authenticated users to delete visa packages" 
  ON "public"."visa_packages" 
  FOR DELETE 
  TO authenticated 
  USING (TRUE);

-- Add function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update the updated_at timestamp on update
CREATE TRIGGER update_visa_packages_updated_at
BEFORE UPDATE ON visa_packages
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Add function to check if uuid_generate_v4() is available, and create it if not
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'uuid_generate_v4') THEN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  END IF;
END
$$;

-- Grant the necessary permissions
GRANT ALL ON TABLE public.visa_packages TO authenticated;
GRANT SELECT ON TABLE public.visa_packages TO anon;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visa_packages_country_id ON public.visa_packages(country_id); 