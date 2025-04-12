/**
 * This script checks if the legal_pages table exists in Supabase
 * Run with: node check-table.js
 */

import { createClient } from '@supabase/supabase-js';

// Use the same credentials as your app
const supabaseUrl = "https://zewkainvgxtlmtuzgvjg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpld2thaW52Z3h0bG10dXpndmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzY4MDMsImV4cCI6MjA1ODc1MjgwM30.j0-qB84p-aYyXDdGX0ycfqL9hIGnOwizDvNpfZOkHQ4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Checking if the legal_pages table exists...');
  
  try {
    // Try a direct query to get table information from Postgres system tables
    const { data, error } = await supabase
      .rpc('pg_check_table', { table_name: 'legal_pages' });
    
    if (error) {
      console.error('Error calling RPC function:', error);
      
      // Try a direct query to the table
      console.log('Trying direct query to the table...');
      
      const { data: directData, error: directError } = await supabase
        .from('legal_pages')
        .select('count(*)', { count: 'exact' });
      
      if (directError) {
        console.error('Error querying the table directly:', directError);
        console.log('The legal_pages table does not exist or cannot be accessed.');
        return;
      }
      
      console.log(`The legal_pages table exists and has ${directData.count} rows.`);
      return;
    }
    
    console.log('Result from Postgres system tables:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function listAllTables() {
  console.log('Listing all public tables in Supabase...');
  
  try {
    // Try a direct query to information_schema
    const { data, error } = await supabase
      .rpc('list_tables');
    
    if (error) {
      console.error('Error listing tables:', error);
      
      // When RPC doesn't work, we'll use a raw SQL query
      console.log('Your Supabase instance may not have the list_tables function.');
      console.log('\nPlease run this SQL in Supabase SQL Editor:');
      console.log(`
CREATE OR REPLACE FUNCTION list_tables()
RETURNS TABLE (table_name text) AS $$
BEGIN
  RETURN QUERY SELECT t.table_name 
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql;

-- Then run this query
SELECT * FROM list_tables();
      `);
      
      return;
    }
    
    console.log('Tables in your Supabase instance:');
    if (data && data.length > 0) {
      data.forEach(table => console.log(`- ${table.table_name}`));
    } else {
      console.log('No tables found or cannot access table information.');
    }
  } catch (error) {
    console.error('Unexpected error listing tables:', error);
  }
}

async function run() {
  console.log('Checking Supabase database...');
  await checkTable();
  await listAllTables();
}

run(); 