
import { supabase } from '@/integrations/supabase/client';
import type { VisaPackage } from '@/types/visaPackage';

/**
 * Create a default package for a country if none exists
 */
export async function createDefaultPackage(countryId: string): Promise<VisaPackage | null> {
  console.log('Creating default package for country:', countryId);
  
  try {
    const packageData: VisaPackage = {
      country_id: countryId,
      name: 'Visa Package',
      government_fee: 0,
      service_fee: 0,
      processing_days: 15
    };
    
    const { data, error } = await supabase
      .from('visa_packages')
      .insert(packageData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating default package:', error);
      return packageData; // Return the data even if it failed to save
    }
    
    console.log('Default package created successfully:', data);
    return data;
  } catch (err) {
    console.error('Failed to create default package:', err);
    return null;
  }
}
