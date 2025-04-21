-- Create legal_pages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.legal_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample legal pages
INSERT INTO public.legal_pages (title, slug, content, last_updated)
VALUES
  ('Terms of Service',
   'terms-of-service',
   '<section><h2 class="text-2xl font-semibold text-navy mb-4">1. Introduction</h2><p class="text-gray-700 leading-relaxed mb-4">Welcome to Permitsy ("Company", "we", "our", "us")! These Terms of Service govern your use of our web pages.</p></section><hr class="my-8" /><section><h2 class="text-2xl font-semibold text-navy mb-4">2. Your Rights</h2><p class="text-gray-700 leading-relaxed mb-4">Sample content for Terms of Service. Edit this from the admin panel.</p></section>',
   NOW()),
   
  ('Privacy Policy',
   'privacy-policy',
   '<section><h2 class="text-2xl font-semibold text-navy mb-4">1. Introduction</h2><p class="text-gray-700 leading-relaxed mb-4">At Permitsy, we respect your privacy and are committed to protecting it through our compliance with this policy.</p></section><hr class="my-8" /><section><h2 class="text-2xl font-semibold text-navy mb-4">2. Information We Collect</h2><p class="text-gray-700 leading-relaxed mb-4">Sample content for Privacy Policy. Edit this from the admin panel.</p></section>',
   NOW()),
   
  ('Cookie Policy',
   'cookie-policy',
   '<section><h2 class="text-2xl font-semibold text-navy mb-4">1. Introduction</h2><p class="text-gray-700 leading-relaxed mb-4">This Cookie Policy explains how Permitsy uses cookies and similar technologies.</p></section><hr class="my-8" /><section><h2 class="text-2xl font-semibold text-navy mb-4">2. What Are Cookies</h2><p class="text-gray-700 leading-relaxed mb-4">Sample content for Cookie Policy. Edit this from the admin panel.</p></section>',
   NOW()),
   
  ('Refund Policy',
   'refund-policy',
   '<section><h2 class="text-2xl font-semibold text-navy mb-4">1. Overview</h2><p class="text-gray-700 leading-relaxed mb-4">At Permitsy, we are committed to ensuring your satisfaction with our visa application services.</p></section><hr class="my-8" /><section><h2 class="text-2xl font-semibold text-navy mb-4">2. Service Fee Refunds</h2><p class="text-gray-700 leading-relaxed mb-4">Sample content for Refund Policy. Edit this from the admin panel.</p></section>',
   NOW())
ON CONFLICT (slug) DO UPDATE
  SET content = EXCLUDED.content,
      title = EXCLUDED.title,
      last_updated = NOW(); 