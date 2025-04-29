
import { supabase } from './client';
import { getCountryVisaPackage } from '@/services/visaPackageService';
import { getDocumentChecklist } from '@/services/documentChecklistService';

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
        is_active: false,
        government_fee: 1000,
        service_fee: 1000,
        total_price: 2000,
        processing_days: 7,
        validity_months: 3,
        entry_type: 'single',
        package_name: 'Standard Tourist Visa'
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
