
import { supabase } from './client';
import { useToast } from '@/hooks/use-toast';

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
