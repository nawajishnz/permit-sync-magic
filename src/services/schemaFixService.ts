
import { supabase } from '@/integrations/supabase/client';
import { fixVisaPackagesSchema } from '@/integrations/supabase/fix-schema';

/**
 * Schema Fix Service
 * Handles checking and fixing database schema issues
 */
const schemaFixService = {
  /**
   * Check if the schema is correct
   */
  checkSchema: async () => {
    try {
      // Try to select from the table
      const { data, error } = await supabase
        .from('visa_packages')
        .select('*')
        .limit(1);
        
      if (error) {
        console.error('Error checking schema:', error);
        return {
          success: false,
          message: `Schema check failed: ${error.message}`,
          error
        };
      }
      
      return {
        success: true,
        message: 'Schema check passed'
      };
    } catch (error: any) {
      console.error('Error checking schema:', error);
      return {
        success: false,
        message: `Error checking schema: ${error}`,
        error
      };
    }
  },
  
  /**
   * Fix the schema if needed
   */
  fixSchema: async () => {
    try {
      // First check if there's a schema issue
      const checkResult = await schemaFixService.checkSchema();
      
      if (checkResult.success) {
        return checkResult;
      }
      
      console.log('Schema needs fixing, running fix...');
      
      // Try to fix schema using RPC functions
      try {
        const result = await fixVisaPackagesSchema();
        if (result.success) {
          return result;
        }
      } catch (fixError) {
        console.error('Error fixing schema with RPC:', fixError);
      }
      
      // Try direct schema creation as fallback
      try {
        const { data, error } = await supabase.rpc('execute_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS visa_packages (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              country_id UUID REFERENCES countries(id),
              name TEXT,
              government_fee NUMERIC DEFAULT 0,
              service_fee NUMERIC DEFAULT 0,
              processing_days INTEGER DEFAULT 15
            );
          `
        });
        
        console.log('Direct schema creation attempt result:', data, error);
        
        if (error) {
          console.error('Direct schema creation error:', error);
          return {
            success: false,
            message: `Failed to fix schema: ${error.message}`
          };
        }
        
        return {
          success: true,
          message: 'Schema fixed successfully via direct SQL'
        };
      } catch (directError: any) {
        console.error('Error in direct schema creation:', directError);
        return {
          success: false,
          message: `Failed to fix schema: ${directError.message}`
        };
      }
    } catch (error: any) {
      console.error('Unexpected error in fixSchema:', error);
      return {
        success: false,
        message: `Unexpected error: ${error.message}`
      };
    }
  }
};

export default schemaFixService;
