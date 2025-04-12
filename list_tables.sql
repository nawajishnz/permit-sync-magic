-- List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Try to create the legal_pages table if it doesn't exist
CREATE TABLE IF NOT EXISTS legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample legal pages (will fail silently if they already exist with the same slug)
INSERT INTO legal_pages (title, slug, content, last_updated)
VALUES
  ('Terms of Service',
   'terms-of-service',
   '<h2>1. Introduction</h2><p>Welcome to Permitsy ("Company", "we", "our", "us")! These Terms of Service govern your use of our web pages.</p><h2>2. Your Rights</h2><p>Sample content for Terms of Service. Edit this from the admin panel.</p>',
   NOW())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO legal_pages (title, slug, content, last_updated)
VALUES
  ('Privacy Policy',
   'privacy-policy',
   '<h2>1. Introduction</h2><p>At Permitsy, we respect your privacy and are committed to protecting it through our compliance with this policy.</p><h2>2. Information We Collect</h2><p>Sample content for Privacy Policy. Edit this from the admin panel.</p>',
   NOW())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO legal_pages (title, slug, content, last_updated)
VALUES
  ('Cookie Policy',
   'cookie-policy',
   '<h2>1. Introduction</h2><p>This Cookie Policy explains how Permitsy uses cookies and similar technologies.</p><h2>2. What Are Cookies</h2><p>Sample content for Cookie Policy. Edit this from the admin panel.</p>',
   NOW())
ON CONFLICT (slug) DO NOTHING;

INSERT INTO legal_pages (title, slug, content, last_updated)
VALUES
  ('Refund Policy',
   'refund-policy',
   '<h2>1. Overview</h2><p>At Permitsy, we are committed to ensuring your satisfaction with our visa application services.</p><h2>2. Service Fee Refunds</h2><p>Sample content for Refund Policy. Edit this from the admin panel.</p>',
   NOW())
ON CONFLICT (slug) DO NOTHING;

-- Check if the legal_pages table exists and has data
SELECT count(*) FROM legal_pages; 