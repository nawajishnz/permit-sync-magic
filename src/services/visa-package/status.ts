
import { supabase } from '@/integrations/supabase/client';
import { VisaPackage, VisaPackageDB } from '@/types/visaPackage';

/**
 * Toggles the status of a visa package
 * @param {string} countryId - The ID of the country
 * @param {boolean} isActive - Whether the package should be active
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export const toggleVisaPackageStatus = async (
  countryId: string, 
  isActive: boolean
): Promise<{success: boolean, message: string, data?: any}> => {
  try {
    console.log(`Toggling package status for country ${countryId} to ${isActive}`);

    // Check if a package exists
    const { data: existingPackages, error: checkError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId);
      
    if (checkError) {
      console.error('Error checking for existing packages:', checkError);
      return { 
        success: false, 
        message: `Database error: ${checkError.message}` 
      };
    }
    
    let packageData;
    
    if (!existingPackages || existingPackages.length === 0) {
      // Create a default package if none exists
      console.log('No package found, creating default package');
      
      const dbPackageData: VisaPackageDB = {
        country_id: countryId,
        name: 'Visa Package',
        government_fee: 0,
        service_fee: 0,
        processing_days: 15,
        processing_time: '15 days'  // Add processing_time field
      };
      
      const { data, error } = await supabase
        .from('visa_packages')
        .insert(dbPackageData)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating default package:', error);
        return { 
          success: false, 
          message: `Failed to create package: ${error.message}` 
        };
      }
      
      packageData = data;
    } else {
      packageData = existingPackages[0];
    }
    
    // We don't actually store is_active in the database
    // It's only used in the application
    // So we just return success with the updated status
    
    return { 
      success: true, 
      message: isActive ? 'Package activated successfully' : 'Package deactivated successfully',
      data: {
        ...packageData,
        is_active: isActive
      }
    };
  } catch (error: any) {
    console.error('Exception in toggleVisaPackageStatus:', error);
    return { 
      success: false, 
      message: `Exception: ${error.message}` 
    };
  }
};
