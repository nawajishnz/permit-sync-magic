/**
 * Simple script to add legal pages using Supabase data API
 * Run with: node setup-pages.js
 */

const { createClient } = require('@supabase/supabase-js');

// Use the same hardcoded credentials from the main application
const supabaseUrl = "https://zewkainvgxtlmtuzgvjg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpld2thaW52Z3h0bG10dXpndmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzY4MDMsImV4cCI6MjA1ODc1MjgwM30.j0-qB84p-aYyXDdGX0ycfqL9hIGnOwizDvNpfZOkHQ4";

console.log('Initializing legal pages setup...');

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials are not properly configured');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupLegalPages() {
  try {
    // Define the legal pages
    const pages = [
      {
        title: 'Terms of Service',
        slug: 'terms-of-service',
        content: '<section><h2 class="text-2xl font-semibold text-navy mb-4">1. Introduction</h2><p class="text-gray-700 leading-relaxed mb-4">Welcome to Permitsy ("Company", "we", "our", "us")! These Terms of Service govern your use of our web pages.</p></section><hr class="my-8" /><section><h2 class="text-2xl font-semibold text-navy mb-4">2. Your Rights</h2><p class="text-gray-700 leading-relaxed mb-4">Sample content for Terms of Service. Edit this from the admin panel.</p></section>',
        last_updated: new Date().toISOString()
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: '<section><h2 class="text-2xl font-semibold text-navy mb-4">1. Introduction</h2><p class="text-gray-700 leading-relaxed mb-4">At Permitsy, we respect your privacy and are committed to protecting it through our compliance with this policy.</p></section><hr class="my-8" /><section><h2 class="text-2xl font-semibold text-navy mb-4">2. Information We Collect</h2><p class="text-gray-700 leading-relaxed mb-4">Sample content for Privacy Policy. Edit this from the admin panel.</p></section>',
        last_updated: new Date().toISOString()
      },
      {
        title: 'Cookie Policy',
        slug: 'cookie-policy',
        content: '<section><h2 class="text-2xl font-semibold text-navy mb-4">1. Introduction</h2><p class="text-gray-700 leading-relaxed mb-4">This Cookie Policy explains how Permitsy uses cookies and similar technologies.</p></section><hr class="my-8" /><section><h2 class="text-2xl font-semibold text-navy mb-4">2. What Are Cookies</h2><p class="text-gray-700 leading-relaxed mb-4">Sample content for Cookie Policy. Edit this from the admin panel.</p></section>',
        last_updated: new Date().toISOString()
      },
      {
        title: 'Refund Policy',
        slug: 'refund-policy',
        content: '<section><h2 class="text-2xl font-semibold text-navy mb-4">1. Overview</h2><p class="text-gray-700 leading-relaxed mb-4">At Permitsy, we are committed to ensuring your satisfaction with our visa application services.</p></section><hr class="my-8" /><section><h2 class="text-2xl font-semibold text-navy mb-4">2. Service Fee Refunds</h2><p class="text-gray-700 leading-relaxed mb-4">Sample content for Refund Policy. Edit this from the admin panel.</p></section>',
        last_updated: new Date().toISOString()
      }
    ];
    
    // Insert each page
    console.log('Adding legal pages...');
    
    for (const page of pages) {
      console.log(`Adding page: ${page.title} (${page.slug})`);
      
      const { data, error } = await supabase
        .from('legal_pages')
        .upsert(page, { 
          onConflict: 'slug',
          returning: 'minimal'
        });
        
      if (error) {
        console.error(`Error inserting ${page.title}:`, error);
        
        // If error suggests table doesn't exist, try to create it using function
        if (error.code === '42P01') {
          console.log('Table does not exist. Trying to create it...');
          await createLegalPagesTable();
          
          // Try to insert again after table creation
          const { error: retryError } = await supabase
            .from('legal_pages')
            .upsert(page, { 
              onConflict: 'slug',
              returning: 'minimal'
            });
            
          if (retryError) {
            console.error(`Error inserting ${page.title} after table creation:`, retryError);
          } else {
            console.log(`✅ Page ${page.title} added!`);
          }
        }
      } else {
        console.log(`✅ Page ${page.title} added!`);
      }
    }
    
    // Verify the pages were created
    await checkLegalPages();
    
  } catch (err) {
    console.error('Error setting up legal pages:', err);
  }
}

async function createLegalPagesTable() {
  try {
    console.log('Creating legal_pages table...');
    const { error } = await supabase.rpc('create_legal_pages_table');
    
    if (error) {
      console.error('Error creating legal_pages table:', error);
      return false;
    }
    
    console.log('✅ Table created successfully!');
    return true;
  } catch (error) {
    console.error('Unexpected error creating legal_pages table:', error);
    return false;
  }
}

async function checkLegalPages() {
  try {
    console.log('Checking if legal pages exist...');
    const { data, error } = await supabase
      .from('legal_pages')
      .select('title, slug')
      .order('title');
      
    if (error) {
      console.error('Error checking legal pages:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Legal pages found:');
      data.forEach(page => {
        console.log(`- ${page.title} (${page.slug})`);
      });
    } else {
      console.log('No legal pages found.');
    }
  } catch (err) {
    console.error('Error checking legal pages:', err);
  }
}

// Run the setup
setupLegalPages(); 