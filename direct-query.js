import { createClient } from '@supabase/supabase-js';

// Use the same credentials as your app
const supabaseUrl = "https://zewkainvgxtlmtuzgvjg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpld2thaW52Z3h0bG10dXpndmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzY4MDMsImV4cCI6MjA1ODc1MjgwM30.j0-qB84p-aYyXDdGX0ycfqL9hIGnOwizDvNpfZOkHQ4";

const supabase = createClient(supabaseUrl, supabaseKey);

// Try to query the legal_pages table directly
async function queryLegalPages() {
  try {
    console.log('Attempting to query legal_pages table...');
    const { data, error } = await supabase
      .from('legal_pages')
      .select('*');
      
    console.log('Query result:', { data, error });
    
    if (error && error.code === '42P01') {
      return { tableExists: false, data: null, error };
    }
    
    return { tableExists: true, data, error };
  } catch (error) {
    console.error('Error in queryLegalPages:', error);
    return { tableExists: false, data: null, error };
  }
}

// Create sample legal pages
async function createSampleLegalPages() {
  const samplePages = [
    {
      title: 'Terms of Service',
      slug: 'terms-of-service',
      content: '<h2>1. Introduction</h2><p>Welcome to Permitsy. These Terms of Service govern your use of our web pages.</p><h2>2. Sample</h2><p>This is sample content.</p>',
      last_updated: new Date().toISOString()
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: '<h2>1. Introduction</h2><p>At Permitsy, we respect your privacy.</p><h2>2. Sample</h2><p>This is sample content.</p>',
      last_updated: new Date().toISOString()
    },
    {
      title: 'Cookie Policy',
      slug: 'cookie-policy',
      content: '<h2>1. Introduction</h2><p>This Cookie Policy explains how we use cookies.</p><h2>2. Sample</h2><p>This is sample content.</p>',
      last_updated: new Date().toISOString()
    }
  ];

  console.log('Creating sample legal pages...');
  
  for (const page of samplePages) {
    try {
      const { data, error } = await supabase
        .from('legal_pages')
        .insert(page)
        .select();
        
      if (error) {
        console.error(`Error creating ${page.title}:`, error);
      } else {
        console.log(`✅ Created ${page.title}`);
      }
    } catch (error) {
      console.error(`Error creating ${page.title}:`, error);
    }
  }
}

// Create the legal_pages table using raw SQL
async function createLegalPagesTable() {
  console.log('Creating legal_pages table...');
  
  const createTableSQL = `
    CREATE TABLE public.legal_pages (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  
  try {
    // Execute the SQL via the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        query: createTableSQL
      })
    });
    
    if (!response.ok) {
      console.error('Failed to create table via REST API');
      return false;
    }
    
    console.log('Table creation attempted via REST API');
    return true;
  } catch (error) {
    console.error('Error creating table:', error);
    return false;
  }
}

async function run() {
  console.log('==== DIRECT DATABASE QUERY ====');
  
  // Try to query legal_pages
  console.log('\nChecking if legal_pages table exists:');
  const { tableExists, data: pages, error: queryError } = await queryLegalPages();
  
  if (!tableExists) {
    console.log('legal_pages table does not exist or cannot be accessed.');
    console.log('\nPlease execute this SQL in the Supabase SQL Editor:');
    console.log(`
CREATE TABLE public.legal_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies for security
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read legal pages
CREATE POLICY "Allow public read access to legal pages" 
  ON public.legal_pages FOR SELECT 
  USING (true);

-- Allow anyone to modify legal pages (for development/testing)
CREATE POLICY "Allow public write access to legal pages" 
  ON public.legal_pages FOR ALL
  USING (true);
`);
  } else {
    console.log('legal_pages table exists!');
    
    if (pages && pages.length > 0) {
      console.log(`Found ${pages.length} legal pages:`);
      pages.forEach(page => {
        console.log(`- ${page.title} (${page.slug})`);
      });
    } else {
      console.log('No legal pages found. Creating sample pages...');
      await createSampleLegalPages();
      
      // Try querying again to confirm creation
      const { data: newPages } = await queryLegalPages();
      if (newPages && newPages.length > 0) {
        console.log(`\nNow there are ${newPages.length} legal pages:`);
        newPages.forEach(page => {
          console.log(`- ${page.title} (${page.slug})`);
        });
      }
    }
  }
  
  console.log('\n==== QUERY COMPLETE ====');
}

run(); 