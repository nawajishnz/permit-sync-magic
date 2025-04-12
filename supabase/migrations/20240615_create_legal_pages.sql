-- Create legal_pages table for storing editable content for terms, privacy, etc.
CREATE TABLE IF NOT EXISTS legal_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read
CREATE POLICY "Allow anonymous read access to legal pages" 
  ON legal_pages FOR SELECT 
  USING (true);

-- Allow authenticated users with admin role to edit
CREATE POLICY "Allow admins to manage legal pages" 
  ON legal_pages FOR ALL
  USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid() AND auth.users.user_metadata->>'role' = 'admin'
    )
  );

-- Create stored procedure to create the table
CREATE OR REPLACE FUNCTION create_legal_pages_table()
RETURNS void AS $$
BEGIN
  -- Create the table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'legal_pages') THEN
    CREATE TABLE public.legal_pages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create indexes
    CREATE INDEX legal_pages_slug_idx ON public.legal_pages (slug);
    
    -- Enable RLS
    ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Allow anonymous read access to legal pages" 
      ON public.legal_pages FOR SELECT 
      USING (true);
    
    CREATE POLICY "Allow admins to manage legal pages" 
      ON public.legal_pages FOR ALL
      USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid() AND auth.users.user_metadata->>'role' = 'admin'
        )
      );
  END IF;
END;
$$ LANGUAGE plpgsql; 