/**
 * Simple script to run SQL against Supabase
 * Run with: node run-sql.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Use the same hardcoded credentials from the main application
const supabaseUrl = "https://zewkainvgxtlmtuzgvjg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpld2thaW52Z3h0bG10dXpndmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzY4MDMsImV4cCI6MjA1ODc1MjgwM30.j0-qB84p-aYyXDdGX0ycfqL9hIGnOwizDvNpfZOkHQ4";

console.log('Initializing SQL script execution...');

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials are not properly configured');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL file
try {
  const sqlContent = fs.readFileSync('./init-legal-pages.sql', 'utf8');
  
  // Execute the SQL
  async function runSQL() {
    try {
      console.log('Executing SQL...');
      const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
      
      if (error) {
        console.error('Error executing SQL:', error);
        
        // Fallback to creating table directly
        console.log('Attempting to create table directly...');
        await createTableDirectly();
      } else {
        console.log('SQL executed successfully!');
      }
      
      // Verify the pages were created
      await checkLegalPages();
    } catch (err) {
      console.error('Execution error:', err);
      await createTableDirectly();
    }
  }
  
  async function createTableDirectly() {
    try {
      console.log('Creating table directly...');
      
      // Create the table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.legal_pages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          content TEXT NOT NULL,
          last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (tableError) {
        console.error('Error creating table:', tableError);
        return;
      }
      
      console.log('Table created, now inserting pages...');
      
      // Insert pages one by one
      const pages = [
        {
          title: 'Terms of Service',
          slug: 'terms-of-service',
          content: '<section><h2>1. Introduction</h2><p>Sample Terms of Service content.</p></section>',
          last_updated: new Date().toISOString()
        },
        {
          title: 'Privacy Policy',
          slug: 'privacy-policy',
          content: '<section><h2>1. Introduction</h2><p>Sample Privacy Policy content.</p></section>',
          last_updated: new Date().toISOString()
        },
        {
          title: 'Cookie Policy',
          slug: 'cookie-policy',
          content: '<section><h2>1. Introduction</h2><p>Sample Cookie Policy content.</p></section>',
          last_updated: new Date().toISOString()
        },
        {
          title: 'Refund Policy',
          slug: 'refund-policy',
          content: '<section><h2>1. Introduction</h2><p>Sample Refund Policy content.</p></section>',
          last_updated: new Date().toISOString()
        }
      ];
      
      for (const page of pages) {
        console.log(`Adding page: ${page.title}`);
        const { error: insertError } = await supabase
          .from('legal_pages')
          .upsert(page, { 
            onConflict: 'slug',
            returning: 'minimal'
          });
          
        if (insertError) {
          console.error(`Error inserting ${page.title}:`, insertError);
        } else {
          console.log(`✅ Page ${page.title} added!`);
        }
      }
    } catch (err) {
      console.error('Error in direct table creation:', err);
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
  
  // Run the SQL
  runSQL();
  
} catch (err) {
  console.error('Error reading SQL file:', err);
  process.exit(1);
} 