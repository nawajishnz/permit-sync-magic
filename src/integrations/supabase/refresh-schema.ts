
import { supabase } from './client';
import { useToast } from '@/hooks/use-toast';
import { fixVisaPackagesSchema } from './fix-schema';

/**
 * Attempts to fix database schema issues automatically
 */
export const autoFixSchema = async (): Promise<{ success: boolean, message: string }> => {
  try {
    console.log('Running schema auto-fix script...');
    
    // Check visa_packages table structure
    const { data: tableInfo, error: tableError } = await supabase.rpc('get_table_info', {
      p_table_name: 'visa_packages'
    });
    
    if (tableError) {
      console.error('Error checking table info:', tableError);
      
      // Try to apply the fix directly
      console.log('Attempting direct schema fix...');
      
      // First check if the table exists
      const { data: tableExists } = await supabase
        .from('visa_packages')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      if (tableExists !== null) {
        // Table exists but might be missing columns
        // Try to add the government_fee column
        try {
          const { data: fixResult } = await supabase.rpc('fix_visa_packages_schema');
          console.log('Schema fix attempted, result:', fixResult);
        } catch (err) {
          console.error('Failed to fix schema:', err);
        }
      }
    }
    
    return { success: true, message: 'Schema fix attempted' };
  } catch (err) {
    console.error('Schema fix error:', err);
    return { success: false, message: 'Failed to fix schema' };
  }
};

/**
 * Create a fallback pricing object to handle situations where the
 * database schema is not yet complete
 */
export const createFallbackPricing = (countryId: string) => {
  return {
    id: `fallback-${countryId}`,
    name: 'Visa Package',
    country_id: countryId,
    government_fee: 0,
    service_fee: 0,
    processing_days: 15,
    total_price: 0
  };
};

/**
 * Refresh the schema cache to ensure all updated tables and columns are visible
 */
export const refreshSchemaCache = async (): Promise<{ success: boolean, message: string }> => {
  console.log('Refreshing schema cache...');
  
  try {
    // Use the fixVisaPackagesSchema function from fix-schema.ts
    const result = await fixVisaPackagesSchema();
    
    if (result.success) {
      // Attempt a simple query to refresh the schema cache
      await supabase.from('countries').select('id').limit(1);
      
      // We can't use .catch() on PostgrestFilterBuilder, so use try/catch instead
      try {
        await supabase.from('visa_packages').select('id').limit(1);
      } catch (e) {
        console.log('Error querying visa_packages, this is expected if the table doesn\'t exist yet');
      }
      
      console.log('Schema cache refreshed');
      return { success: true, message: 'Schema cache refreshed successfully' };
    }
    
    return result;
  } catch (err: any) {
    console.error('Schema cache refresh error:', err);
    return { success: false, message: `Failed to refresh schema: ${err.message}` };
  }
};

/**
 * Run diagnostics on visa packages for a specific country
 */
export const runVisaPackagesDiagnostic = async (countryId: string): Promise<{ success: boolean, message: string, results: any }> => {
  console.log(`Running diagnostics for country ${countryId}...`);
  
  try {
    // Instead of calling a non-existent function, implement the diagnostic here
    const results: any = { diagnosticRun: true };
    
    // Check if the country exists
    const { data: country, error: countryError } = await supabase
      .from('countries')
      .select('id, name')
      .eq('id', countryId)
      .single();
      
    if (countryError) {
      return {
        success: false,
        message: `Country not found: ${countryError.message}`,
        results: {}
      };
    }
    
    // Check if the visa package exists
    const { data: visaPackage, error: packageError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId)
      .maybeSingle();
      
    results.countryExists = !!country;
    results.packageExists = !!visaPackage;
    results.packageData = visaPackage || null;
    
    if (packageError && packageError.code !== 'PGRST116') {
      results.packageError = packageError.message;
    }
    
    // Get column information if possible
    try {
      const { data: columnInfo } = await supabase.rpc('get_table_info', {
        p_table_name: 'visa_packages'
      });
      
      results.tableInfo = columnInfo;
    } catch (err: any) {
      results.tableInfoError = err.message;
    }
    
    return {
      success: true,
      message: `Diagnostics complete for country ${country?.name || countryId}`,
      results
    };
  } catch (err: any) {
    console.error('Diagnostic error:', err);
    return {
      success: false, 
      message: `Failed to run diagnostics: ${err.message}`,
      results: {}
    };
  }
};
