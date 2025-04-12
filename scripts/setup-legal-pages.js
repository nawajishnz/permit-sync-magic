/**
 * This script will initialize the legal_pages table with default content
 * Run with: node scripts/setup-legal-pages.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Use the same hardcoded credentials from the main application
const supabaseUrl = "https://zewkainvgxtlmtuzgvjg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpld2thaW52Z3h0bG10dXpndmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzY4MDMsImV4cCI6MjA1ODc1MjgwM30.j0-qB84p-aYyXDdGX0ycfqL9hIGnOwizDvNpfZOkHQ4";

console.log('Setting up legal pages...');
console.log('Using Supabase connection...');

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials are not properly configured');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const legalPages = [
  {
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: `
      <section>
        <h2 class="text-2xl font-semibold text-navy mb-4">1. Introduction</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Welcome to Permitsy ("Company", "we", "our", "us")! These Terms of Service ("Terms") govern your use of our web pages.
        </p>
      </section>
      <hr class="my-8" />
      <section>
        <h2 class="text-2xl font-semibold text-navy mb-4">2. Your Rights</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Sample content for Terms of Service. Edit this from the admin panel.
        </p>
      </section>
    `,
    last_updated: new Date().toISOString(),
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: `
      <section>
        <h2 class="text-2xl font-semibold text-navy mb-4">1. Introduction</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          At Permitsy, we respect your privacy and are committed to protecting it through our compliance with this policy.
        </p>
      </section>
      <hr class="my-8" />
      <section>
        <h2 class="text-2xl font-semibold text-navy mb-4">2. Information We Collect</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Sample content for Privacy Policy. Edit this from the admin panel.
        </p>
      </section>
    `,
    last_updated: new Date().toISOString(),
  },
  {
    title: 'Cookie Policy',
    slug: 'cookie-policy',
    content: `
      <section>
        <h2 class="text-2xl font-semibold text-navy mb-4">1. Introduction</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          This Cookie Policy explains how Permitsy uses cookies and similar technologies.
        </p>
      </section>
      <hr class="my-8" />
      <section>
        <h2 class="text-2xl font-semibold text-navy mb-4">2. What Are Cookies</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Sample content for Cookie Policy. Edit this from the admin panel.
        </p>
      </section>
    `,
    last_updated: new Date().toISOString(),
  },
  {
    title: 'Refund Policy',
    slug: 'refund-policy',
    content: `
      <section>
        <h2 class="text-2xl font-semibold text-navy mb-4">1. Overview</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          At Permitsy, we're committed to ensuring your satisfaction with our visa application services.
        </p>
      </section>
      <hr class="my-8" />
      <section>
        <h2 class="text-2xl font-semibold text-navy mb-4">2. Service Fee Refunds</h2>
        <p class="text-gray-700 leading-relaxed mb-4">
          Sample content for Refund Policy. Edit this from the admin panel.
        </p>
      </section>
    `,
    last_updated: new Date().toISOString(),
  },
];

async function createTable() {
  console.log('Creating legal_pages table...');
  
  try {
    // Create the table using raw SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS legal_pages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: sqlError } = await supabase.rpc('pgcrypto', { sql: createTableSQL });
    
    if (sqlError) {
      console.error('Error creating table with SQL:', sqlError);
      
      // Try direct approach as a fallback
      try {
        console.log('Trying direct insert approach...');
        // Try to insert a record directly which will fail, but might auto-create the table
        const { error: directError } = await supabase.from('legal_pages').insert({
          title: 'Temporary',
          slug: 'temporary',
          content: 'Temporary content',
          last_updated: new Date().toISOString()
        });
        
        // Check again if table exists by trying to select from it
        const { error: checkError } = await supabase
          .from('legal_pages')
          .select('id')
          .limit(1);
          
        if (checkError) {
          console.error('Table still does not exist after direct insert attempt');
          return false;
        }
      } catch (directError) {
        console.error('Error with direct insert approach:', directError);
        return false;
      }
    }
    
    console.log('Table creation attempted successfully!');
    return true;
  } catch (error) {
    console.error('Error in createTable:', error);
    return false;
  }
}

async function createTableIfNotExists() {
  console.log('Checking if legal_pages table exists...');
  
  try {
    // Try a simple query to see if the table exists
    const { data, error } = await supabase
      .from('legal_pages')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking if table exists:', error);
      
      if (error.code === '42P01') { // Table doesn't exist
        console.log('Table does not exist. Creating it...');
        return await createTable();
      }
      
      return false;
    }
    
    console.log('Table exists!');
    return true;
  } catch (error) {
    console.error('Error in createTableIfNotExists:', error);
    return false;
  }
}

async function setupLegalPages() {
  try {
    // Check if the table exists
    const tableExists = await createTableIfNotExists();
    if (!tableExists) {
      console.error('Failed to create or access legal_pages table.');
      process.exit(1);
    }
    
    // Insert/update the pages
    console.log('Adding legal pages...');
    
    for (const page of legalPages) {
      console.log(`Processing: ${page.title} (${page.slug})`);
      
      // Check if the page already exists
      const { data: existingPages, error: selectError } = await supabase
        .from('legal_pages')
        .select('id')
        .eq('slug', page.slug);
      
      if (selectError) {
        console.error(`Error checking if ${page.slug} exists:`, selectError);
        continue;
      }
      
      if (existingPages && existingPages.length > 0) {
        // Update existing page
        console.log(`Updating existing page: ${page.title}`);
        const { error: updateError } = await supabase
          .from('legal_pages')
          .update({
            title: page.title,
            content: page.content,
            last_updated: page.last_updated
          })
          .eq('id', existingPages[0].id);
        
        if (updateError) {
          console.error(`Error updating ${page.title}:`, updateError);
        } else {
          console.log(`✅ Updated ${page.title} successfully!`);
        }
      } else {
        // Insert new page
        console.log(`Inserting new page: ${page.title}`);
        const { error: insertError } = await supabase
          .from('legal_pages')
          .insert(page);
        
        if (insertError) {
          console.error(`Error inserting ${page.title}:`, insertError);
        } else {
          console.log(`✅ Inserted ${page.title} successfully!`);
        }
      }
    }
    
    // Verify the pages were added
    const { data: finalPages, error: finalError } = await supabase
      .from('legal_pages')
      .select('title, slug');
    
    if (finalError) {
      console.error('Error verifying pages:', finalError);
    } else {
      console.log('\nLegal pages in database:');
      finalPages.forEach(page => {
        console.log(`- ${page.title} (${page.slug})`);
      });
    }
    
    console.log('\nSetup complete! 🎉');
    console.log('You can now edit these pages in the admin panel at /admin/legal-pages');
  } catch (error) {
    console.error('Unexpected error during setup:', error);
  }
}

// Run the setup process
setupLegalPages(); 