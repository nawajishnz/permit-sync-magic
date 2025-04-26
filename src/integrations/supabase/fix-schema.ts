
import { supabase } from './client';

/**
 * Fix the structure of the visa_packages table
 */
export const fixVisaPackagesSchema = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Running schema fix for visa_packages table...');
    
    // Use try/catch to check if the table exists instead of querying information_schema
    try {
      // Try a simple query to see if table exists
      const { count, error } = await supabase
        .from('visa_packages')
        .select('*', { count: 'exact', head: true });
      
      console.log('Visa packages table check result:', { count, error });
      
      if (error && error.code === '42P01') {  // Table doesn't exist
        console.log('Visa packages table does not exist, creating it...');
        
        // Try to create the visa_packages table via RPC
        const { error: createError } = await supabase.rpc('execute_sql', {
          sql: `
          CREATE TABLE IF NOT EXISTS visa_packages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
            name TEXT NOT NULL DEFAULT 'Visa Package',
            government_fee NUMERIC NOT NULL DEFAULT 0,
            service_fee NUMERIC NOT NULL DEFAULT 0,
            processing_days INTEGER NOT NULL DEFAULT 15,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          -- Add computed total_price column if it doesn't exist
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'visa_packages' 
              AND column_name = 'total_price'
            ) THEN
              ALTER TABLE public.visa_packages ADD COLUMN total_price NUMERIC 
              GENERATED ALWAYS AS (government_fee + service_fee) STORED;
            END IF;
          END $$;
          `
        });
        
        if (createError) {
          console.error('Error creating visa_packages table:', createError);
          return {
            success: false,
            message: `Failed to create visa_packages table: ${createError.message}`
          };
        }
        
        console.log('Created visa_packages table');
        return {
          success: true,
          message: 'Created visa_packages table'
        };
      }
    } catch (tableCheckError) {
      console.error('Error checking if table exists:', tableCheckError);
    }
    
    // Check if required columns exist by trying to query them
    try {
      const { data, error } = await supabase
        .from('visa_packages')
        .select('government_fee, service_fee, processing_days, total_price')
        .limit(1);
      
      // If we can query these columns, they exist
      console.log('Column check result:', { data, error });
      
      if (error) {
        console.log('Error querying columns, they may not exist:', error);
        
        // Try to add the missing columns via RPC
        const { error: alterError } = await supabase.rpc('execute_sql', {
          sql: `
          -- Add government_fee if it doesn't exist
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'visa_packages' 
              AND column_name = 'government_fee'
            ) THEN
              ALTER TABLE visa_packages ADD COLUMN government_fee NUMERIC NOT NULL DEFAULT 0;
            END IF;
          END $$;
          
          -- Add service_fee if it doesn't exist
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'visa_packages' 
              AND column_name = 'service_fee'
            ) THEN
              ALTER TABLE visa_packages ADD COLUMN service_fee NUMERIC NOT NULL DEFAULT 0;
            END IF;
          END $$;
          
          -- Add processing_days if it doesn't exist
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'visa_packages' 
              AND column_name = 'processing_days'
            ) THEN
              ALTER TABLE visa_packages ADD COLUMN processing_days INTEGER NOT NULL DEFAULT 15;
            END IF;
          END $$;
          
          -- Add total_price if it doesn't exist
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'visa_packages' 
              AND column_name = 'total_price'
            ) THEN
              ALTER TABLE visa_packages ADD COLUMN total_price NUMERIC 
              GENERATED ALWAYS AS (government_fee + service_fee) STORED;
            END IF;
          END $$;
          `
        });
        
        if (alterError) {
          console.error('Error adding columns:', alterError);
          return {
            success: false,
            message: `Failed to add required columns: ${alterError.message}`
          };
        }
      }
    } catch (columnCheckError) {
      console.error('Error checking columns:', columnCheckError);
    }
    
    return {
      success: true,
      message: 'Schema fixed successfully'
    };
  } catch (err: any) {
    console.error('Schema fix error:', err);
    return {
      success: false,
      message: `Schema fix failed: ${err.message}`
    };
  }
};

/**
 * Test operations on the visa_packages table for a specific country
 */
export const testVisaPackagesOperations = async (countryId: string): Promise<{ success: boolean; message: string; results?: any }> => {
  try {
    console.log(`Running diagnostics for country ${countryId}...`);
    
    // Test direct select
    const { data: directData, error: directError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId)
      .maybeSingle();
      
    // Test RPC function
    let rpcData = null;
    let rpcError = null;
    
    try {
      const rpcResult = await supabase.rpc('get_country_packages', {
        p_country_id: countryId
      });
      rpcData = rpcResult.data;
      rpcError = rpcResult.error;
    } catch (err: any) {
      rpcError = {
        message: err.message
      };
    }
    
    // Test insert and update
    let insertResult = null;
    let updateResult = null;
    let insertError = null;
    let updateError = null;
    
    if (directData) {
      // Test update
      const updateResponse = await supabase
        .from('visa_packages')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', directData.id)
        .select()
        .single();
        
      updateResult = updateResponse.data;
      updateError = updateResponse.error;
    } else {
      // Test insert
      const insertResponse = await supabase
        .from('visa_packages')
        .insert({
          country_id: countryId,
          name: 'Test Package',
          government_fee: 100,
          service_fee: 50,
          processing_days: 10
        })
        .select()
        .single();
        
      insertResult = insertResponse.data;
      insertError = insertResponse.error;
      
      // Clean up test data
      if (insertResult) {
        await supabase
          .from('visa_packages')
          .delete()
          .eq('id', insertResult.id);
      }
    }
    
    return {
      success: !directError || !rpcError || !insertError || !updateError,
      message: 'Diagnostics completed',
      results: {
        direct: {
          success: !directError,
          error: directError?.message,
          data: directData
        },
        rpc: {
          success: !rpcError,
          error: rpcError?.message,
          data: rpcData
        },
        insert: {
          success: !insertError,
          error: insertError?.message,
          data: insertResult
        },
        update: {
          success: !updateError,
          error: updateError?.message,
          data: updateResult
        }
      }
    };
  } catch (err: any) {
    console.error('Diagnostic error:', err);
    return {
      success: false,
      message: `Failed to run diagnostics: ${err.message}`
    };
  }
};
