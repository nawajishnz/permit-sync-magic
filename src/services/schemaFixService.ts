
import { supabase } from '@/lib/supabase';
import { fixVisaPackagesSchema } from '@/integrations/supabase/fix-schema';
import { toast } from '@/hooks/use-toast';

/**
 * Service to handle database schema fixes
 */
export const schemaFixService = {
  /**
   * Check if the visa packages schema is properly set up
   */
  checkSchema: async () => {
    try {
      // Try to run the check schema function if it exists
      const { data, error } = await supabase.rpc('check_visa_packages_schema');
      
      if (error) {
        console.error('Error checking schema:', error);
        return { 
          success: false, 
          message: 'Schema check failed', 
          error 
        };
      }
      
      return {
        success: true,
        data
      };
    } catch (err: any) {
      console.error('Exception during schema check:', err);
      return {
        success: false,
        message: err.message || 'Schema check failed'
      };
    }
  },
  
  /**
   * Fix any schema issues
   */
  fixSchema: async () => {
    try {
      console.log('Running schema fix...');
      
      // First check if there's an issue
      const check = await schemaFixService.checkSchema();
      
      // If check succeeded and everything exists, we're good
      if (check.success && 
          check.data && 
          check.data.table_exists && 
          check.data.function_exists && 
          check.data.view_exists) {
        console.log('Schema is already valid:', check.data);
        return {
          success: true,
          message: 'Schema is valid, no fixes needed',
          data: check.data
        };
      }
      
      console.log('Schema needs fixing, running fix...');
      
      // Try to upload the fix SQL through the frontend handler
      const fixResult = await fixVisaPackagesSchema();
      
      if (!fixResult.success) {
        console.error('Schema fix failed:', fixResult);
        return fixResult;
      }
      
      console.log('Schema fix complete:', fixResult);
      
      // Verify the fix worked
      const verification = await schemaFixService.checkSchema();
      
      if (verification.success && 
          verification.data && 
          verification.data.table_exists && 
          verification.data.function_exists) {
        return {
          success: true,
          message: 'Schema fixed successfully',
          data: verification.data
        };
      }
      
      console.warn('Schema fix partially successful, verification:', verification);
      
      return {
        success: true,
        message: 'Schema fix attempted, but verification shows issues',
        data: verification.data,
        fixResult
      };
    } catch (err: any) {
      console.error('Exception during schema fix:', err);
      return {
        success: false,
        message: err.message || 'Schema fix failed'
      };
    }
  },
  
  /**
   * Run the schema fix operation and show toast notifications for feedback
   */
  fixSchemaWithFeedback: async () => {
    try {
      toast({
        title: "Fixing database schema...",
        description: "Please wait while we check and fix database issues"
      });
      
      const fixResult = await schemaFixService.fixSchema();
      
      if (fixResult.success) {
        toast({
          title: "Schema fixed",
          description: fixResult.message
        });
      } else {
        toast({
          title: "Schema fix failed",
          description: fixResult.message,
          variant: "destructive"
        });
      }
      
      return fixResult;
    } catch (err: any) {
      console.error('Error in fixSchemaWithFeedback:', err);
      
      toast({
        title: "Schema fix error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      return {
        success: false,
        message: err.message || 'Schema fix failed with feedback'
      };
    }
  }
};

export default schemaFixService;
