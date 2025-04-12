/**
 * This script will insert legal pages into Supabase
 * Run with: node create-legal-pages-table.js
 */

import { createClient } from '@supabase/supabase-js';

// Use the same credentials as your app
const supabaseUrl = "https://zewkainvgxtlmtuzgvjg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpld2thaW52Z3h0bG10dXpndmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzY4MDMsImV4cCI6MjA1ODc1MjgwM30.j0-qB84p-aYyXDdGX0ycfqL9hIGnOwizDvNpfZOkHQ4";

const supabase = createClient(supabaseUrl, supabaseKey);

// Initial legal pages content
const legalPages = [
  {
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: `
      <h2>1. Introduction</h2>
      <p>Welcome to Permitsy ("Company", "we", "our", "us")! These Terms of Service govern your use of our web pages.</p>
      <h2>2. Your Rights</h2>
      <p>Sample content for Terms of Service. Edit this from the admin panel.</p>
    `,
    last_updated: new Date().toISOString(),
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: `
      <h2>1. Introduction</h2>
      <p>At Permitsy, we respect your privacy and are committed to protecting it through our compliance with this policy.</p>
      <h2>2. Information We Collect</h2>
      <p>Sample content for Privacy Policy. Edit this from the admin panel.</p>
    `,
    last_updated: new Date().toISOString(),
  },
  {
    title: 'Cookie Policy',
    slug: 'cookie-policy',
    content: `
      <h2>1. Introduction</h2>
      <p>This Cookie Policy explains how Permitsy uses cookies and similar technologies.</p>
      <h2>2. What Are Cookies</h2>
      <p>Sample content for Cookie Policy. Edit this from the admin panel.</p>
    `,
    last_updated: new Date().toISOString(),
  },
  {
    title: 'Refund Policy',
    slug: 'refund-policy',
    content: `
      <h2>1. Overview</h2>
      <p>At Permitsy, we're committed to ensuring your satisfaction with our visa application services.</p>
      <h2>2. Service Fee Refunds</h2>
      <p>Sample content for Refund Policy. Edit this from the admin panel.</p>
    `,
    last_updated: new Date().toISOString(),
  },
];

async function insertLegalPages() {
  console.log('Inserting legal pages...');
  
  for (const page of legalPages) {
    console.log(`Inserting: ${page.title}`);
    
    try {
      // Directly insert without checking for existence
      const { data, error } = await supabase
        .from('legal_pages')
        .insert(page)
        .select();
      
      if (error) {
        if (error.code === '42P01') {
          console.error('Error: The legal_pages table does not exist!');
          console.log('\nPlease create the table first using SQL in the Supabase dashboard.');
          return false;
        } else if (error.code === '23505') { // Unique violation
          console.log(`Page with slug '${page.slug}' already exists, trying to update...`);
          
          // Try to update instead
          const { error: updateError } = await supabase
            .from('legal_pages')
            .update({
              title: page.title,
              content: page.content,
              last_updated: page.last_updated
            })
            .eq('slug', page.slug);
            
          if (updateError) {
            console.error(`Error updating ${page.title}:`, updateError);
          } else {
            console.log(`✅ Updated ${page.title}`);
          }
        } else {
          console.error(`Error inserting ${page.title}:`, error);
        }
      } else {
        console.log(`✅ Inserted ${page.title}`);
      }
    } catch (e) {
      console.error(`Unexpected error for ${page.title}:`, e);
    }
  }
  
  return true;
}

async function run() {
  console.log('Setting up legal pages...');
  
  const success = await insertLegalPages();
  
  if (success) {
    // Verify the pages were added
    try {
      const { data: pages, error: listError } = await supabase
        .from('legal_pages')
        .select('title, slug');
      
      if (listError) {
        if (listError.code === '42P01') {
          console.error('Error: The legal_pages table does not exist!');
          console.log('\nPlease create the table using this SQL in the Supabase dashboard:');
          console.log(`
CREATE TABLE IF NOT EXISTS legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS legal_pages_slug_idx ON legal_pages (slug);

-- Create RLS policies
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read
CREATE POLICY "Allow anonymous read access to legal pages" 
  ON legal_pages FOR SELECT 
  USING (true);

-- Allow authenticated users with admin role to edit
CREATE POLICY "Allow admins to manage legal pages" 
  ON legal_pages FOR ALL
  USING (true);
          `);
        } else {
          console.error('Error listing pages:', listError);
        }
      } else {
        console.log('\nLegal pages in database:');
        if (pages && pages.length > 0) {
          pages.forEach(page => {
            console.log(`- ${page.title} (${page.slug})`);
          });
        } else {
          console.log('No pages found.');
        }
      }
    } catch (e) {
      console.error('Error verifying pages:', e);
    }
  }
  
  console.log('\nSetup complete!');
  console.log('If pages were added successfully, you can now edit them in the admin panel at /admin/legal-pages');
}

// Run the script
run(); 