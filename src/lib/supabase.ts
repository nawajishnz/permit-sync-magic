
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

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
) 
