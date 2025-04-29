import { supabase } from './client';

/**
 * Function to auto-fix schema issues
 */
export const fixSchemaIfNeeded = async () => {
  try {
    console.log('Running schema fix check...');
    
    // Try to fix visa packages schema
    await fixVisaPackagesSchema();
    
    return { success: true };
  } catch (error) {
    console.error('Error in fixSchemaIfNeeded:', error);
    return { 
      success: false,
      error
    };
  }
};

/**
 * Fix visa packages schema if needed
 */
export const fixVisaPackagesSchema = async () => {
  try {
    // Check if visa_packages table exists
    const { data: tableExists, error: checkError } = await supabase
      .from('visa_packages')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking visa_packages table:', checkError);
      return { success: false, error: checkError };
    }
    
    // We don't need to do anything if the table exists and we can query it
    if (tableExists) {
      console.log('Visa packages table seems to be working fine');
      return { success: true };
    }
    
    // Otherwise run the fix function
    const { error: fixError } = await supabase.rpc('fix_visa_packages');
    
    if (fixError) {
      console.error('Error fixing visa_packages:', fixError);
      return { success: false, error: fixError };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in fixVisaPackagesSchema:', error);
    return { success: false, error };
  }
};

// Re-export these for backwards compatibility
export { refreshDocumentSchema } from '../document-checklist';
export { autoFixSchema } from './update-schema-and-fix-data';

/**
 * Creates the visa packages table and schema if it doesn't exist
 */
export async function createOrFixVisaPackagesTable() {
  try {
    const { error } = await supabase.rpc('fix_visa_packages');
    if (error) {
      console.error('Error fixing visa packages table:', error);
      return { 
        success: false, 
        message: 'Failed to fix visa packages table. ' + error.message,
        error 
      };
    }
    
    return {
      success: true,
      message: 'Visa packages table fixed successfully'
    };
  } catch (error) {
    console.error('Exception in createOrFixVisaPackagesTable:', error);
    return { 
      success: false, 
      message: 'Exception occurred while fixing visa packages table',
      error 
    };
  }
}

/**
 * Create the document checklist view and RLS policy
 */
export async function createOrFixDocumentChecklistTable() {
  try {
    const { error } = await supabase.rpc('fix_document_checklist');
    if (error) {
      console.error('Error fixing document checklist table:', error);
      return { 
        success: false, 
        message: 'Failed to fix document checklist table. ' + error.message,
        error 
      };
    }
    
    return {
      success: true,
      message: 'Document checklist table fixed successfully'
    };
  } catch (error) {
    console.error('Exception in createOrFixDocumentChecklistTable:', error);
    return { 
      success: false, 
      message: 'Exception occurred while fixing document checklist table',
      error 
    };
  }
}

/**
 * Creates the entire visa package schema
 */
export async function createOrFixVisaPackageSchema() {
  try {
    const visaPackagesResult = await createOrFixVisaPackagesTable();
    if (!visaPackagesResult.success) {
      return visaPackagesResult;
    }
    
    const docChecklistResult = await createOrFixDocumentChecklistTable();
    if (!docChecklistResult.success) {
      return docChecklistResult;
    }
    
    return {
      success: true,
      message: 'Visa package schema created/fixed successfully'
    };
  } catch (error) {
    console.error('Exception in createOrFixVisaPackageSchema:', error);
    return { 
      success: false, 
      message: 'Exception occurred while fixing visa package schema',
      error 
    };
  }
}

/**
 * Auto-fixes schema issues - main entry point for schema management
 */
export async function autoFixSchema() {
  console.log('Running auto schema fix...');
  try {
    return await createOrFixVisaPackageSchema();
  } catch (error) {
    console.error('Auto schema fix failed:', error);
    return { 
      success: false, 
      message: 'Auto schema fix failed', 
      error 
    };
  }
}

/**
 * Fixes visa packages schema - alias for createOrFixVisaPackageSchema
 */
export async function fixVisaPackagesSchema() {
  console.log('Fixing visa packages schema...');
  return await createOrFixVisaPackageSchema();
}

/**
 * Creates a default visa package for a country
 */
export async function createDefaultVisaPackageForCountry(countryId: string) {
  try {
    // First check if the package already exists
    const packageResult = await getCountryVisaPackage(countryId);
    if (packageResult) {
      console.log('Visa package already exists for country', countryId);
      return {
        success: true,
        message: 'Visa package already exists for this country',
        data: packageResult
      };
    }
    
    // Create default visa package
    const { data: packageData, error: packageError } = await supabase
      .from('visa_packages')
      .insert({
        country_id: countryId,
        name: 'Standard Tourist Visa',
        government_fee: 1000,
        service_fee: 1000,
        processing_days: 7,
        // The following properties were causing type errors - removing them
        // is_active: false,
        // total_price: 2000,
        // validity_months: 3,
        // entry_type: 'single',
        // package_name: 'Standard Tourist Visa'
      })
      .select('*')
      .single();
      
    if (packageError) {
      console.error('Error creating default visa package:', packageError);
      return { 
        success: false, 
        message: 'Failed to create default visa package',
        error: packageError 
      };
    }
    
    // Check if documents exist
    const docResult = await getDocumentChecklist(countryId);
    if (docResult && docResult.length > 0) {
      console.log('Documents already exist for country', countryId);
      return {
        success: true,
        message: 'Visa package created and documents exist',
        data: packageData
      };
    }
    
    // Create default document checklist
    const { error: docError } = await supabase
      .from('document_checklist')
      .insert([
        {
          country_id: countryId,
          document_name: 'Passport',
          is_required: true,
          description: 'Valid passport with at least 6 months validity'
        },
        {
          country_id: countryId,
          document_name: 'Photograph',
          is_required: true,
          description: 'Recent passport-sized photograph'
        },
        {
          country_id: countryId,
          document_name: 'Travel Itinerary',
          is_required: true,
          description: 'Flight bookings and accommodation details'
        }
      ]);
      
    if (docError) {
      console.error('Error creating default document checklist:', docError);
      return { 
        success: true, // Still return success as the visa package was created
        message: 'Visa package created but document checklist creation failed',
        data: packageData,
        warning: 'Failed to create document checklist'
      };
    }
    
    return {
      success: true,
      message: 'Default visa package and document checklist created successfully',
      data: packageData
    };
  } catch (error) {
    console.error('Exception in createDefaultVisaPackageForCountry:', error);
    return { 
      success: false, 
      message: 'Exception occurred while creating default visa package',
      error 
    };
  }
}
