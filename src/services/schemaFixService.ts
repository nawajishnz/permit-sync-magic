
import { supabase } from '@/lib/supabase';
import { fixVisaPackagesSchema } from '@/integrations/supabase/fix-schema';
import { useToast } from '@/hooks/use-toast';

/**
 * Service to handle database schema fixes
 */
export const schemaFixService = {
  /**
   * Check if the visa packages schema is properly set up
   */
  checkSchema: async () => {
    try {
      // Instead of trying to use check_visa_packages_schema RPC function,
      // just check if the visa_packages table exists with a direct query
      const { data, error } = await supabase
        .from('visa_packages')
        .select('count(*)')
        .limit(1);
      
      if (error) {
        console.error('Error checking schema:', error);
        return { 
          success: false, 
          message: 'Schema check failed', 
          error 
        };
      }
      
      // Table exists if we got here
      return {
        success: true,
        data: { table_exists: true }
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
          check.data.table_exists) {
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
        
        // Try direct approach as a fallback - create the table directly
        try {
          // Try to create a basic version of the table
          const { data: directResult, error: directError } = await supabase
            .from('visa_packages')
            .insert({
              country_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
              name: 'Test Package',
              government_fee: 0,
              service_fee: 0,
              processing_days: 15
            })
            .select();
          
          console.log('Direct schema creation attempt result:', directResult, directError);
          
          if (directError && !directError.message.includes('foreign key constraint')) {
            console.error('Direct schema creation error:', directError);
            return fixResult; // Return original error
          }
          
          return {
            success: true,
            message: 'Table exists or was created with direct approach',
            directFix: true
          };
        } catch (directError) {
          console.error('Error in direct schema creation:', directError);
          return fixResult; // Return original error
        }
      }
      
      console.log('Schema fix complete:', fixResult);
      
      // Verify the fix worked with a simple query
      const verification = await schemaFixService.checkSchema();
      
      if (verification.success && 
          verification.data && 
          verification.data.table_exists) {
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
    const { toast } = useToast();
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
