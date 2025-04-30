
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

declare module '@supabase/supabase-js' {
  interface SupabaseClient<
    Database = any,
    SchemaName extends string & keyof Database = 'public' extends keyof Database ? 'public' : string & keyof Database,
  > {
    rpc<
      Returns = any,
      Args = any
    >(fn: string, args?: Args): Promise<{ data: Returns; error: Error | null }>;
  }
}

// Default fallback values for local development
const DEFAULT_SUPABASE_URL = 'https://zewkainvgxtlmtuzgvjg.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpld2thaW52Z3h0bG10dXpndmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzY4MDMsImV4cCI6MjA1ODc1MjgwM30.j0-qB84p-aYyXDdGX0ycfqL9hIGnOwizDvNpfZOkHQ4';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY
);

// Debug supabase connection
console.log("Supabase URL being used:", import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL);
console.log("Supabase client initialized:", !!supabase);
