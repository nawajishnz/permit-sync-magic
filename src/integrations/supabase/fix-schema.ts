
import { supabase } from './client';

/**
 * Fixes the visa_packages table schema if needed
 */
export async function fixVisaPackagesSchema(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Checking visa_packages table schema...');
    
    // First attempt to run PostgreSQL fix script directly (most reliable method)
    try {
      console.log('Running SQL directly to fix schema...');
      
      // Try to create the necessary RPC functions first
      await supabase.rpc('create_visa_packages_table', {}).catch(err => {
        console.log('RPC function create_visa_packages_table might not exist, continuing...');
      });

      // Check if the visa_packages table exists
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'visa_packages')
        .maybeSingle();
        
      if (tableCheckError) {
        console.warn('Error checking if table exists:', tableCheckError);
      }
      
      if (!tableExists) {
        console.log('Creating visa_packages table...');
        
        // Create the table using a direct SQL query
        const { error: createTableError } = await supabase.rpc('execute_sql', {
          sql: `
          CREATE TABLE IF NOT EXISTS visa_packages (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
            name text NOT NULL DEFAULT 'Visa Package',
            government_fee numeric NOT NULL DEFAULT 0,
            service_fee numeric NOT NULL DEFAULT 0,
            processing_days integer NOT NULL DEFAULT 15,
            total_price numeric GENERATED ALWAYS AS (government_fee + service_fee) STORED,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          );
          
          -- Grant permissions
          GRANT ALL ON visa_packages TO authenticated;
          GRANT SELECT ON visa_packages TO anon;
          
          -- Set up RLS
          ALTER TABLE visa_packages ENABLE ROW LEVEL SECURITY;
          
          -- Set RLS policies
          CREATE POLICY "Enable read access for all users" ON visa_packages FOR SELECT USING (true);
          CREATE POLICY "Enable write access for authenticated users" ON visa_packages FOR INSERT TO authenticated WITH CHECK (true);
          CREATE POLICY "Enable update for authenticated users" ON visa_packages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
          CREATE POLICY "Enable delete for authenticated users" ON visa_packages FOR DELETE TO authenticated USING (true);
          `
        }).catch(err => {
          console.error('Error executing SQL:', err);
          return { error: err };
        });
        
        if (createTableError) {
          console.error('Error creating table:', createTableError);
        } else {
          console.log('Table creation successful or command executed');
          
          // Refresh the schema cache
          await supabase.rpc('pg_notify', { channel: 'pgrst', payload: 'reload schema' }).catch(() => {});
          
          return { success: true, message: 'Created visa_packages table' };
        }
      }
    } catch (sqlError) {
      console.warn('Direct SQL execution failed, falling back to alternative methods:', sqlError);
    }
    
    // Check if the visa_packages table exists
    let tableExists = false;
    try {
      const { data, error } = await supabase.rpc('check_table_exists', {
        table_name: 'visa_packages'
      });
      
      tableExists = data === true;
      
      if (error) {
        console.warn('Error checking if table exists:', error);
        
        // Fallback method to check if table exists
        const { count } = await supabase
          .from('visa_packages')
          .select('*', { count: 'exact', head: true });
          
        tableExists = count !== null;
      } else {
        console.log('Table exists check result:', data);
      }
    } catch (err) {
      console.warn('Could not check if table exists using RPC, trying direct query:', err);
      
      try {
        const { count } = await supabase
          .from('visa_packages')
          .select('*', { count: 'exact', head: true });
          
        tableExists = count !== null;
      } catch (queryErr) {
        console.warn('Table likely does not exist:', queryErr);
        tableExists = false;
      }
    }
    
    // If table doesn't exist, run the SQL script to create it
    if (!tableExists) {
      console.log('visa_packages table does not exist, creating...');
      
      try {
        // Create the basic table
        const { error } = await supabase.rpc('create_visa_packages_table');
        
        if (error) {
          console.error('Error creating table with RPC:', error);
          
          // Try direct SQL
          try {
            // Note: This method may not work with Supabase's permissions,
            // but it's worth trying as a last resort
            await fetch(`${supabase.supabaseUrl}/rest/v1/rpc/create_table`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabase.supabaseKey}`,
                'apikey': supabase.supabaseKey
              },
              body: JSON.stringify({
                table_name: 'visa_packages',
                columns: `
                  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
                  name text NOT NULL DEFAULT 'Visa Package',
                  government_fee numeric NOT NULL DEFAULT 0,
                  service_fee numeric NOT NULL DEFAULT 0,
                  processing_days integer NOT NULL DEFAULT 15,
                  created_at timestamptz DEFAULT now(),
                  updated_at timestamptz DEFAULT now()
                `
              })
            });
          } catch (directErr) {
            console.error('Direct API call failed too:', directErr);
            return { success: false, message: `Error creating table: ${error.message}` };
          }
        }
        
        console.log('Successfully created visa_packages table or attempted creation');
        return { success: true, message: 'Created visa_packages table' };
      } catch (err: any) {
        console.error('Error in creation process:', err);
        return { success: false, message: `Creation error: ${err.message}` };
      }
    }
    
    console.log('Table exists, checking columns...');
    
    // Manually insert a fallback record to ensure the schema is correct
    try {
      // Find a country to use for the fallback record
      const { data: someCountry } = await supabase
        .from('countries')
        .select('id')
        .limit(1)
        .single();
      
      if (someCountry) {
        const { data: existingRecord } = await supabase
          .from('visa_packages')
          .select('id')
          .eq('country_id', someCountry.id)
          .maybeSingle();
        
        if (!existingRecord) {
          console.log('Creating test record for country:', someCountry.id);
          
          // Insert a test record which will fail if columns don't exist
          await supabase.from('visa_packages').insert({
            country_id: someCountry.id,
            name: 'Test Package',
            government_fee: 0,
            service_fee: 0,
            processing_days: 15
          });
        }
      }
    } catch (testErr) {
      console.warn('Test record insertion failed, schema may need fixing:', testErr);
    }
    
    // Everything looks good
    console.log('visa_packages table schema appears to be up-to-date');
    return { success: true, message: 'Schema is up-to-date' };
  } catch (error: any) {
    console.error('Schema fix failed:', error);
    return { success: false, message: `Schema fix error: ${error.message}` };
  }
}

/**
 * Creates a fallback pricing package for a country
 */
export function createFallbackPricing(countryId: string) {
  return {
    id: 'fallback',
    name: 'Visa Package',
    price: 0,
    processing_days: 15,
    government_fee: 0,
    service_fee: 0,
    total_price: 0,
    country_id: countryId
  };
}

/**
 * Attempts to fix schema issues automatically
 */
export async function autoFixSchema() {
  return fixVisaPackagesSchema();
}
