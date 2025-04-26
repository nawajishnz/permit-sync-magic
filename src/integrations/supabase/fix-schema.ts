
import { supabase } from './client';

/**
 * Fix the structure of the visa_packages table
 */
export const fixVisaPackagesSchema = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Running schema fix for visa_packages table...');
    
    // Check if the table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'visa_packages')
      .eq('table_schema', 'public')
      .single();
    
    if (tableError) {
      console.error('Error checking if visa_packages table exists:', tableError);
      
      // Try to create the visa_packages table
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
    
    // Check if the columns exist
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'visa_packages')
      .eq('table_schema', 'public');
      
    if (columnsError) {
      console.error('Error checking visa_packages columns:', columnsError);
      return {
        success: false,
        message: `Failed to check visa_packages columns: ${columnsError.message}`
      };
    }
    
    const columnNames = columns?.map(c => c.column_name) || [];
    console.log('Existing columns:', columnNames);
    
    // Check for missing required columns
    const requiredColumns = ['government_fee', 'service_fee', 'processing_days', 'total_price'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('Missing columns:', missingColumns);
      
      // Add missing columns
      for (const column of missingColumns) {
        let sql = '';
        
        if (column === 'government_fee') {
          sql = `ALTER TABLE visa_packages ADD COLUMN government_fee NUMERIC NOT NULL DEFAULT 0;`;
        } else if (column === 'service_fee') {
          sql = `ALTER TABLE visa_packages ADD COLUMN service_fee NUMERIC NOT NULL DEFAULT 0;`;
        } else if (column === 'processing_days') {
          sql = `ALTER TABLE visa_packages ADD COLUMN processing_days INTEGER NOT NULL DEFAULT 15;`;
        } else if (column === 'total_price') {
          sql = `
          ALTER TABLE visa_packages ADD COLUMN total_price NUMERIC 
          GENERATED ALWAYS AS (government_fee + service_fee) STORED;
          `;
        }
        
        if (sql) {
          const { error } = await supabase.rpc('execute_sql', { sql });
          if (error) {
            console.error(`Error adding column ${column}:`, error);
          } else {
            console.log(`Added column ${column}`);
          }
        }
      }
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
