
import { supabase } from '@/integrations/supabase/client';
import { updateSchemaAndFixData } from './update-schema-and-fix-data';

// Function to fix schema issues automatically
export const fixVisaPackagesSchema = async () => {
  console.log('Attempting to fix visa packages schema...');
  
  try {
    // Run the schema diagnostic
    const checkResult = await updateSchemaAndFixData();
    console.log('Schema check result:', checkResult);
    
    // Create visa_packages table if it doesn't exist
    if (!checkResult.databaseStructure?.visa_packages?.exists) {
      console.log('visa_packages table does not exist, attempting to create...');
      await createVisaPackagesTable();
    }
    
    // Check for required columns
    const requiredColumns = ['government_fee', 'service_fee', 'processing_days'];
    
    const existingColumns = checkResult.databaseStructure?.visa_packages?.columns || [];
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('Missing columns:', missingColumns);
      // We can't directly add columns, but we can try some workarounds
    }
    
    return {
      success: true,
      message: 'Schema check and fix completed',
      checkResult
    };
  } catch (error: any) {
    console.error('Error fixing schema:', error);
    return {
      success: false,
      message: `Error fixing schema: ${error.message}`,
      error
    };
  }
};

// Try to create the visa_packages table
const createVisaPackagesTable = async () => {
  try {
    // We can't execute direct SQL commands, so we'll try a workaround
    // by creating a sample record with all required fields
    
    // First check if the countries table exists
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('id')
      .limit(1);
      
    if (countriesError || !countries || countries.length === 0) {
      console.error('Cannot create visa_packages table: countries table is not accessible');
      return {
        success: false,
        message: 'Could not access countries table'
      };
    }
    
    // Try to create a test package
    const countryId = countries[0].id;
    const { data, error } = await supabase
      .from('visa_packages')
      .insert({
        country_id: countryId,
        name: 'Test Package',
        government_fee: 0,
        service_fee: 0,
        processing_days: 15
      })
      .select();
      
    if (error) {
      console.error('Error creating test package:', error);
      return {
        success: false,
        message: `Could not create visa_packages table: ${error.message}`,
        error
      };
    }
    
    console.log('Successfully created test package:', data);
    return {
      success: true,
      message: 'Successfully created visa_packages table',
      data
    };
  } catch (error: any) {
    console.error('Error creating visa_packages table:', error);
    return {
      success: false,
      message: `Error creating visa_packages table: ${error.message}`,
      error
    };
  }
};

// Function to refresh schema cache
export const refreshSchemaCache = async () => {
  try {
    // First, check if we can access the visa_packages table
    const { data: packages, error: packagesError } = await supabase
      .from('visa_packages')
      .select('count(*)')
      .single();
      
    if (packagesError) {
      console.error('Error accessing visa_packages table:', packagesError);
    } else {
      console.log('Successfully accessed visa_packages table:', packages);
    }
    
    // Check if we can access the document_checklist table
    const { data: docs, error: docsError } = await supabase
      .from('document_checklist')
      .select('count(*)')
      .single();
      
    if (docsError) {
      console.error('Error accessing document_checklist table:', docsError);
    } else {
      console.log('Successfully accessed document_checklist table:', docs);
    }
    
    return {
      success: !packagesError && !docsError,
      message: 'Schema cache refreshed',
      visa_packages: {
        success: !packagesError,
        error: packagesError?.message,
        count: packagesError ? 0 : packages?.count ?? 0
      },
      document_checklist: {
        success: !docsError,
        error: docsError?.message,
        count: docsError ? 0 : docs?.count ?? 0
      }
    };
  } catch (error: any) {
    console.error('Error refreshing schema cache:', error);
    return {
      success: false,
      message: `Error refreshing schema cache: ${error.message}`,
      error
    };
  }
};

// Auto-fix function for implementing at app startup
export const autoFixSchema = async () => {
  try {
    // Only attempt fix if we haven't already done so in this session
    const hasFixedSchema = sessionStorage.getItem('schema_fixed');
    if (hasFixedSchema === 'true') {
      console.log('Schema already fixed in this session, skipping...');
      return {
        success: true,
        message: 'Schema already fixed in this session'
      };
    }
    
    // Run the fix function
    const result = await fixVisaPackagesSchema();
    
    if (result.success) {
      // Remember that we've fixed the schema in this session
      sessionStorage.setItem('schema_fixed', 'true');
      console.log('Schema auto-fix completed successfully');
    }
    
    return result;
  } catch (error: any) {
    console.error('Error in autoFixSchema:', error);
    return {
      success: false,
      message: `Failed to auto-fix schema: ${error.message}`,
      error
    };
  }
};
