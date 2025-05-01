
import { supabase } from '@/integrations/supabase/client';

/**
 * Initializes the visa packages schema if it doesn't exist
 */
export const initializeVisaPackagesSchema = async (): Promise<{success: boolean, message: string}> => {
  try {
    // Check if the visa_packages table exists
    const { data, error } = await supabase
      .from('visa_packages')
      .select('id')
      .limit(1);
      
    if (error && error.message.includes('does not exist')) {
      console.log('visa_packages table does not exist, need to create it');
      return {
        success: false,
        message: 'Schema needs to be created'
      };
    }
    
    return {
      success: true,
      message: 'Schema exists'
    };
  } catch (error: any) {
    console.error('Error checking schema:', error);
    return {
      success: false,
      message: `Schema check failed: ${error.message}`
    };
  }
};
