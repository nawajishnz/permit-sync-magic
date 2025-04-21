import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabase() {
  console.log('Starting database schema fix...');
  
  try {
    // Read the SQL script
    const scriptPath = path.resolve(__dirname, '../../supabase/fix-database-schema.sql');
    const sqlScript = fs.readFileSync(scriptPath, 'utf8');
    
    console.log('SQL script loaded successfully');
    
    // Execute SQL script using supabase rpc (if supported) or raw REST API
    console.log('NOTE: The exec_sql RPC function likely does not exist, so we will show manual instructions instead');
    
    // Display instructions for manual fix
    console.log('\n===== DATABASE FIX INSTRUCTIONS =====');
    console.log('1. Log in to your Supabase dashboard');
    console.log('2. Go to the SQL Editor');
    console.log('3. Copy and paste the content of supabase/fix-database-schema.sql');
    console.log('4. Run the script');
    console.log('5. Refresh your application and try adding a visa package again');
    console.log('=====================\n');
    
    // Output the SQL script to the console
    console.log('SQL Script to run:');
    console.log('------------------');
    console.log(sqlScript);
    
  } catch (error) {
    console.error('Error fixing database schema:', error);
  }
}

// Run the function
fixDatabase(); 