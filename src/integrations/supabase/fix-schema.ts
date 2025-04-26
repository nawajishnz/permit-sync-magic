
import { supabase } from './client';

/**
 * Fixes the visa_packages table schema if needed
 */
export async function fixVisaPackagesSchema(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Checking visa_packages table schema...');
    
    // Check if the visa_packages table exists
    let tableExists = false;
    try {
      const { data, error } = await supabase.rpc('check_table_exists', {
        table_name: 'visa_packages'
      });
      
      tableExists = data === true;
      
      if (error) {
        console.warn('Error checking if table exists:', error);
      } else {
        console.log('Table exists check result:', data);
      }
    } catch (err) {
      console.warn('Could not check if table exists:', err);
    }
    
    // If table doesn't exist, run the SQL script to create it
    if (!tableExists) {
      console.log('visa_packages table does not exist, creating...');
      
      try {
        // Create the basic table
        const { error } = await supabase.rpc('create_visa_packages_table');
        
        if (error) {
          console.error('Error creating table:', error);
          return { success: false, message: `Error creating table: ${error.message}` };
        }
        
        console.log('Successfully created visa_packages table');
        return { success: true, message: 'Created visa_packages table' };
      } catch (err: any) {
        console.error('Error in creation process:', err);
        return { success: false, message: `Creation error: ${err.message}` };
      }
    }
    
    // Check if the table has the required columns
    let hasRequiredColumns = false;
    try {
      // Use the hasRequiredColumns function
      const { data, error } = await supabase.rpc('check_columns_exist', {
        table_name: 'visa_packages',
        column_names: ['government_fee', 'service_fee', 'processing_days']
      });
      
      hasRequiredColumns = data === true;
      
      if (error) {
        console.warn('Error checking columns:', error);
      } else {
        console.log('Column check result:', data);
      }
    } catch (err) {
      console.warn('Could not check columns:', err);
    }
    
    // If columns don't exist, add them
    if (!hasRequiredColumns) {
      console.log('Adding required columns to visa_packages table...');
      
      try {
        // Add the missing columns
        const { error } = await supabase.rpc('add_columns_to_visa_packages');
        
        if (error) {
          console.error('Error adding columns:', error);
          return { success: false, message: `Error adding columns: ${error.message}` };
        }
        
        console.log('Successfully added required columns');
        return { success: true, message: 'Added required columns to visa_packages table' };
      } catch (err: any) {
        console.error('Error in column addition process:', err);
        return { success: false, message: `Column addition error: ${err.message}` };
      }
    }
    
    // Everything looks good
    console.log('visa_packages table schema is up-to-date');
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
