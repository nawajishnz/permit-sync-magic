
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if the database connection is working properly.
 * @returns {Promise<{success: boolean, message: string}>} Result of the connection test.
 */
export const checkDatabaseConnection = async (): Promise<{success: boolean, message: string}> => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id')
      .limit(1);
      
    if (error) {
      return {
        success: false,
        message: `Database connection error: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Database connection successful'
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Database connection exception: ${error.message}`
    };
  }
};
