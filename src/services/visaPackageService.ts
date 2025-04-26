import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/supabase';

export type VisaPackage = {
  id?: string;
  country_id: string;
  name: string;
  government_fee: number;
  service_fee: number;
  processing_days: number;
  total_price?: number;
  created_at?: string;
  updated_at?: string;
};

/**
 * Get visa package for a country using RPC function for type safety
 */
export async function getCountryVisaPackage(countryId: string): Promise<VisaPackage | null> {
  console.log('Getting visa package for country:', countryId);
  
  try {
    // Direct query approach - most reliable
    const { data, error } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching visa package:', error);
      
      // Try RPC function if direct query fails
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_country_packages', {
          p_country_id: countryId
        });
        
        if (!rpcError && rpcData && rpcData.length > 0) {
          const packageData = rpcData[0];
          console.log('RPC succeeded:', packageData);
          return {
            id: packageData.package_id,
            country_id: packageData.country_id,
            name: packageData.package_name || 'Visa Package',
            government_fee: packageData.government_fee || 0,
            service_fee: packageData.service_fee || 0,
            processing_days: packageData.processing_days || 15,
            total_price: packageData.total_price || 0
          };
        }
      } catch (rpcErr) {
        console.warn('RPC fetch failed:', rpcErr);
      }
      
      // Create a default package if nothing found
      return await createDefaultPackage(countryId);
    }
    
    console.log('Visa package found:', data);
    return data;
  } catch (err) {
    console.error('Failed to fetch visa package:', err);
    return await createDefaultPackage(countryId);
  }
}

/**
 * Create a default package for a country if none exists
 */
async function createDefaultPackage(countryId: string): Promise<VisaPackage | null> {
  console.log('Creating default package for country:', countryId);
  
  try {
    const packageData = {
      country_id: countryId,
      name: 'Visa Package',
      government_fee: 0,
      service_fee: 0,
      processing_days: 15
    };
    
    const result = await saveVisaPackage(packageData);
    
    if (result.success && result.data) {
      console.log('Default package created:', result.data);
      return await getCountryVisaPackage(countryId);
    }
    
    return null;
  } catch (err) {
    console.error('Failed to create default package:', err);
    return null;
  }
}

/**
 * Save or update visa package for a country
 */
export async function saveVisaPackage(packageData: VisaPackage): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const { country_id, name, government_fee, service_fee, processing_days } = packageData;
    
    // Approach 1: Try RPC function with named parameters
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'save_visa_package',
        {
          p_country_id: country_id,
          p_name: name || 'Visa Package',
          p_government_fee: government_fee,
          p_service_fee: service_fee,
          p_processing_days: processing_days
        }
      );
      
      if (!rpcError) {
        return { 
          success: true, 
          message: "Package saved successfully via RPC",
          data: rpcData
        };
      }
      
      console.warn('RPC approach failed:', rpcError);
      // Continue to next approach
    } catch (err) {
      console.warn('RPC call threw exception:', err);
      // Continue to next approach
    }
    
    // Approach 2: Direct database operations
    let packageId = packageData.id;
    let result;
    
    if (packageId) {
      // Update existing
      result = await supabase
        .from('visa_packages')
        .update({
          name,
          government_fee,
          service_fee,
          processing_days
        })
        .eq('id', packageId)
        .select();
    } else {
      // Try to find existing by country_id
      const { data: existingData } = await supabase
        .from('visa_packages')
        .select('id')
        .eq('country_id', country_id)
        .single();
        
      if (existingData?.id) {
        // Update existing by country_id
        result = await supabase
          .from('visa_packages')
          .update({
            name,
            government_fee,
            service_fee,
            processing_days
          })
          .eq('id', existingData.id)
          .select();
      } else {
        // Insert new
        result = await supabase
          .from('visa_packages')
          .insert({
            country_id,
            name,
            government_fee,
            service_fee,
            processing_days
          })
          .select();
      }
    }
    
    if (result.error) {
      throw new Error(`Database operation failed: ${result.error.message}`);
    }
    
    return { 
      success: true, 
      message: "Package saved successfully via direct database operation",
      data: result.data
    };
  } catch (err: any) {
    console.error('Error saving visa package:', err);
    return { 
      success: false, 
      message: err.message || "Failed to save package" 
    };
  }
}

/**
 * Run database diagnostic for visa packages
 */
export async function runDiagnostic(countryId: string): Promise<{ success: boolean; message: string; results?: any }> {
  try {
    // Test RPC function access
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_country_packages', {
      p_country_id: countryId
    });
    
    // Test direct table access
    const { data: tableData, error: tableError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId);
      
    return {
      success: !rpcError || !tableError,
      message: "Diagnostic completed",
      results: {
        rpc: { success: !rpcError, error: rpcError?.message, data: rpcData },
        table: { success: !tableError, error: tableError?.message, data: tableData }
      }
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Diagnostic failed: ${err.message}`
    };
  }
}
