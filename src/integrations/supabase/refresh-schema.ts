
import { supabase } from './client';

/**
 * Refreshes the Supabase schema cache to ensure we have the latest schema information
 * This is particularly useful when dealing with schema-related errors
 */
export const refreshSchemaCache = async () => {
  try {
    console.log('Refreshing schema cache...');
    
    // First try to query the document_checklist table to refresh its schema
    const { data: documentData, error: documentError } = await supabase
      .from('document_checklist')
      .select('id')
      .limit(1);
    
    if (documentError) {
      console.warn('Schema refresh for document_checklist encountered an error:', documentError);
    } else {
      console.log('Schema for document_checklist refreshed successfully');
    }
    
    // Then try to query visa_packages to refresh its schema
    const { data: packageData, error: packageError } = await supabase
      .from('visa_packages')
      .select('id')
      .limit(1);
    
    if (packageError) {
      console.warn('Schema refresh for visa_packages encountered an error:', packageError);
    } else {
      console.log('Schema for visa_packages refreshed successfully');
    }
    
    // Then try to query countries to refresh its schema
    const { data: countryData, error: countryError } = await supabase
      .from('countries')
      .select('id, name')
      .limit(1);
    
    if (countryError) {
      console.warn('Schema refresh for countries encountered an error:', countryError);
    } else {
      console.log('Schema for countries refreshed successfully');
    }
    
    return { success: true, message: 'Schema cache refreshed successfully' };
  } catch (error) {
    console.error('Failed to refresh schema cache:', error);
    return { success: false, message: 'Failed to refresh schema cache', error };
  }
};

/**
 * Refreshes the document checklist schema cache specifically
 */
export const refreshDocumentSchema = async () => {
  try {
    const { data, error } = await supabase
      .from('document_checklist')
      .select('id, country_id, document_name')
      .limit(1);
    
    if (error) {
      console.error('Error refreshing document schema:', error);
      return { success: false, message: `Error refreshing document schema: ${error.message}` };
    }
    
    console.log('Document schema refreshed successfully');
    return { success: true, message: 'Document schema refreshed successfully' };
  } catch (error: any) {
    console.error('Error in refreshDocumentSchema:', error);
    return { success: false, message: `Unexpected error: ${error.message}` };
  }
};

/**
 * Runs diagnostic tests on visa packages for a specific country
 * This helps troubleshoot issues with visa package data
 */
export const runVisaPackagesDiagnostic = async (countryId: string) => {
  try {
    console.log(`Running visa packages diagnostic for country ID: ${countryId}`);
    
    // Step 1: Check if country exists
    const { data: countryData, error: countryError } = await supabase
      .from('countries')
      .select('id, name')
      .eq('id', countryId)
      .single();
      
    if (countryError) {
      return {
        success: false,
        message: `Country not found: ${countryError.message}`,
        diagnosticResults: {
          countryExists: false
        }
      };
    }
    
    // Step 2: Check for visa packages related to this country
    const { data: packageData, error: packageError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId);
      
    if (packageError) {
      return {
        success: false,
        message: `Error querying visa packages: ${packageError.message}`,
        diagnosticResults: {
          countryExists: true,
          countryName: countryData.name,
          packagesQueryError: packageError.message
        }
      };
    }
    
    // Prepare the diagnostic results
    const diagnosticResults = {
      countryExists: true,
      countryName: countryData.name,
      packagesFound: packageData.length > 0,
      packagesCount: packageData.length,
      packages: packageData,
      recommendation: packageData.length === 0 ? 'Create at least one visa package for this country' : 'Visa packages exist for this country'
    };
    
    // Step 3: Check if the country has the required fields
    const missingFields = [];
    const requiredFields = ['name', 'flag', 'banner', 'description'];
    
    for (const field of requiredFields) {
      if (!countryData[field]) {
        missingFields.push(field);
      }
    }
    
    return {
      success: true,
      message: packageData.length > 0 
        ? `Found ${packageData.length} visa packages for ${countryData.name}` 
        : `No visa packages found for ${countryData.name}`,
      diagnosticResults: {
        ...diagnosticResults,
        missingRequiredFields: missingFields.length > 0 ? missingFields : [],
        hasMissingFields: missingFields.length > 0
      }
    };
  } catch (error: any) {
    console.error('Error in visa packages diagnostic:', error);
    return {
      success: false,
      message: `Diagnostic error: ${error.message}`,
      diagnosticResults: { error: error.message }
    };
  }
};
