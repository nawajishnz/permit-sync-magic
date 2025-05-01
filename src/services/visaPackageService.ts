import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches all visa packages.
 * @returns {Promise<{ success: boolean; data?: any[]; message?: string }>}
 */
export const getAllVisaPackages = async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
  try {
    const { data, error } = await supabase
      .from('visa_packages')
      .select('*');

    if (error) {
      console.error('Error fetching visa packages:', error);
      return { success: false, message: 'Failed to fetch visa packages', data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Unexpected error fetching visa packages:', error);
    return { success: false, message: error.message || 'Unexpected error', data: [] };
  }
};

/**
 * Fetches a visa package by its ID.
 * @param {string} id - The ID of the visa package to fetch.
 * @returns {Promise<{ success: boolean; data?: any; message?: string }>}
 */
export const getVisaPackageById = async (id: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const { data, error } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching visa package by ID:', error);
      return { success: false, message: 'Failed to fetch visa package', data: null };
    }

    return { success: true, data: data || null };
  } catch (error: any) {
    console.error('Unexpected error fetching visa package by ID:', error);
    return { success: false, message: error.message || 'Unexpected error', data: null };
  }
};

/**
 * Fetches visa packages by country ID.
 * @param {string} countryId - The ID of the country to fetch visa packages for.
 * @returns {Promise<{ success: boolean; data?: any[]; message?: string }>}
 */
export const getVisaPackagesByCountryId = async (countryId: string): Promise<{ success: boolean; data?: any[]; message?: string }> => {
  try {
    const { data, error } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId);

    if (error) {
      console.error('Error fetching visa packages by country ID:', error);
      return { success: false, message: 'Failed to fetch visa packages for the country', data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Unexpected error fetching visa packages by country ID:', error);
    return { success: false, message: error.message || 'Unexpected error', data: [] };
  }
};

/**
 * Creates a new visa package.
 * @param {any} packageData - The data for the new visa package.
 * @returns {Promise<{ success: boolean; data?: any; message?: string }>}
 */
export const createVisaPackage = async (packageData: any): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const { data, error } = await supabase
      .from('visa_packages')
      .insert([packageData])
      .select()
      .single();

    if (error) {
      console.error('Error creating visa package:', error);
      return { success: false, message: 'Failed to create visa package', data: null };
    }

    return { success: true, data: data || null };
  } catch (error: any) {
    console.error('Unexpected error creating visa package:', error);
    return { success: false, message: error.message || 'Unexpected error', data: null };
  }
};

/**
 * Updates an existing visa package.
 * @param {string} id - The ID of the visa package to update.
 * @param {any} packageData - The updated data for the visa package.
 * @returns {Promise<{ success: boolean; data?: any; message?: string }>}
 */
export const updateVisaPackage = async (id: string, packageData: any): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    const { data, error } = await supabase
      .from('visa_packages')
      .update(packageData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating visa package:', error);
      return { success: false, message: 'Failed to update visa package', data: null };
    }

    return { success: true, data: data || null };
  } catch (error: any) {
    console.error('Unexpected error updating visa package:', error);
    return { success: false, message: error.message || 'Unexpected error', data: null };
  }
};

/**
 * Deletes a visa package by its ID.
 * @param {string} id - The ID of the visa package to delete.
 * @returns {Promise<{ success: boolean; message?: string }>}
 */
export const deleteVisaPackage = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('visa_packages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting visa package:', error);
      return { success: false, message: 'Failed to delete visa package' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error deleting visa package:', error);
    return { success: false, message: error.message || 'Unexpected error' };
  }
};

export const toggleVisaPackageStatus = async (
  countryId: string,
  isActive: boolean
): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log(`Toggling package status for country ${countryId} to ${isActive ? 'active' : 'inactive'}`);
    
    if (isActive) {
      // Check if visa package already exists
      const { data: existingPackages, error: checkError } = await supabase
        .from('visa_packages')
        .select('*')
        .eq('country_id', countryId)
        .limit(1);
      
      if (checkError) {
        console.error('Error checking existing packages:', checkError);
        return { 
          success: false, 
          message: `Failed to check existing packages: ${checkError.message}` 
        };
      }
      
      // If we have an existing package, update it instead of creating a new one
      if (existingPackages && existingPackages.length > 0) {
        const packageToUpdate = existingPackages[0];
        
        const { error: updateError } = await supabase
          .from('visa_packages')
          .update({
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', packageToUpdate.id);
        
        if (updateError) {
          console.error('Error updating existing package:', updateError);
          return { 
            success: false, 
            message: `Failed to update package: ${updateError.message}` 
          };
        }
        
        return { success: true };
      }
      
      // No existing package, create a new one with all required fields
      const defaultPackage = {
        country_id: countryId,
        name: 'Standard Visa',
        government_fee: 0,
        service_fee: 0,
        processing_days: 15,
        price: 0, // Make sure price is included
        processing_time: '15 business days',
        is_active: true
      };
      
      const { error: insertError } = await supabase
        .from('visa_packages')
        .insert(defaultPackage);
      
      if (insertError) {
        console.error('Error creating package:', insertError);
        return { 
          success: false, 
          message: `Failed to create package: ${insertError.message}` 
        };
      }
      
      return { success: true };
    } else {
      // Deactivate all packages for this country
      const { error: updateError } = await supabase
        .from('visa_packages')
        .update({ is_active: false })
        .eq('country_id', countryId);
      
      if (updateError) {
        console.error('Error deactivating packages:', updateError);
        return { 
          success: false, 
          message: `Failed to deactivate packages: ${updateError.message}` 
        };
      }
      
      return { success: true };
    }
  } catch (error: any) {
    console.error('Exception in toggleVisaPackageStatus:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred'
    };
  }
};
