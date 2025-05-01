
import { supabase } from '@/integrations/supabase/client';
import { VisaPackageDB } from '@/types/visaPackage';

/**
 * Run diagnostics on visa package configuration
 * @param {string} countryId - The ID of the country to diagnose
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export const runDiagnostic = async (countryId: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
  timestamp: string; // Added timestamp field to match DiagnosticResult type
}> => {
  try {
    console.log('Running diagnostic for country:', countryId);
    
    // Check if country exists
    const { data: countryData, error: countryError } = await supabase
      .from('countries')
      .select('id, name')
      .eq('id', countryId)
      .single();
      
    if (countryError) {
      return {
        success: false,
        message: `Country not found: ${countryError.message}`,
        data: { error: countryError },
        timestamp: new Date().toISOString()
      };
    }
    
    // Check if visa package exists
    const { data: packageData, error: packageError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId);
      
    if (packageError) {
      return {
        success: false,
        message: `Error checking visa packages: ${packageError.message}`,
        data: { error: packageError },
        timestamp: new Date().toISOString()
      };
    }
    
    if (!packageData || packageData.length === 0) {
      // Create a default package
      console.log('No package found, creating default package');
      
      const defaultPackage: VisaPackageDB = {
        country_id: countryId,
        name: `${countryData.name} Visa`,
        government_fee: 0,
        service_fee: 0,
        processing_days: 15,
        processing_time: '15 days', // Add the required processing_time field
        price: 0 // Add the required price field
      };
      
      const { data: newPackage, error: createError } = await supabase
        .from('visa_packages')
        .insert(defaultPackage)
        .select()
        .single();
        
      if (createError) {
        return {
          success: false,
          message: `Failed to create default package: ${createError.message}`,
          data: { error: createError },
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        success: true,
        message: 'Created default visa package',
        data: { package: { ...newPackage, is_active: true } },
        timestamp: new Date().toISOString()
      };
    }
    
    // Check for any issues with existing package
    const existingPackage = packageData[0];
    const issues = [];
    
    if (!existingPackage.name) {
      issues.push('Missing package name');
    }
    
    if (existingPackage.government_fee === null || existingPackage.government_fee === undefined) {
      issues.push('Missing government fee');
    }
    
    if (existingPackage.service_fee === null || existingPackage.service_fee === undefined) {
      issues.push('Missing service fee');
    }
    
    if (!existingPackage.processing_days) {
      issues.push('Missing processing days');
    }
    
    if (issues.length > 0) {
      return {
        success: false,
        message: `Found issues with visa package: ${issues.join(', ')}`,
        data: { issues, package: existingPackage },
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      success: true,
      message: 'Visa package is properly configured',
      data: { package: { ...existingPackage, is_active: true } },
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Exception in runDiagnostic:', error);
    return {
      success: false,
      message: `Diagnostic failed: ${error.message}`,
      data: { error },
      timestamp: new Date().toISOString()
    };
  }
};
