
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Default fallback values for local development
const DEFAULT_SUPABASE_URL = 'https://zewkainvgxtlmtuzgvjg.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpld2thaW52Z3h0bG10dXpndmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzY4MDMsImV4cCI6MjA1ODc1MjgwM30.j0-qB84p-aYyXDdGX0ycfqL9hIGnOwizDvNpfZOkHQ4';

// Get environment variables with fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Debug environment variables (without exposing sensitive data)
console.log('Supabase Configuration Check:', {
  hasUrl: !!SUPABASE_URL,
  hasKey: !!SUPABASE_ANON_KEY,
  urlLength: SUPABASE_URL?.length,
  keyLength: SUPABASE_ANON_KEY?.length,
  usingFallback: !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY
});

// Enable Supabase debug logging
const DEBUG_LOGGING = true;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Create the Supabase client with debug options
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-application-name': 'permitsy'
      }
    },
    db: {
      schema: 'public'
    },
    // Disable schema caching completely
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Debug - log any session errors
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, 'Session:', !!session);
});

// Test connection and log any issues
export const testConnection = async () => {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('Auth error:', authError);
      return false;
    }

    // Test database access with explicit schema
    const { data, error } = await supabase
      .from('countries')
      .select('id, name, visa_packages(id, name, government_fee, service_fee)')
      .limit(1);

    if (error) {
      console.error('Database access error:', error);
      return false;
    }

    console.log('Successfully connected to Supabase');
    console.log('Sample data:', data);
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

// Run connection test on startup
testConnection().then(isConnected => {
  if (!isConnected) {
    console.error('Failed to establish initial Supabase connection');
  } else {
    console.log('Initial Supabase connection successful');
  }
});

// Add a function to refresh schema cache
export const refreshSchemaCache = async () => {
  try {
    console.log('Refreshing schema cache...');
    // Force a new query to refresh the schema cache
    const { data, error } = await supabase
      .from('visa_packages')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Schema refresh error:', error);
      return false;
    }
    console.log('Schema cache refreshed successfully');
    return true;
  } catch (error) {
    console.error('Failed to refresh schema cache:', error);
    return false;
  }
};
