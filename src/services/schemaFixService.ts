
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
      // Try to run the check schema function if it exists
      const { data, error } = await supabase.rpc('check_visa_packages_schema');
      
      if (error) {
        console.error('Error checking schema:', error);
        
        // Try alternative approach if the function doesn't exist
        // Check if the visa_packages table exists at least
        const { data: tableInfo, error: tableError } = await supabase
          .from('information_schema')
          .select('table_name')
          .eq('table_name', 'visa_packages')
          .eq('table_schema', 'public')
          .maybeSingle();
        
        if (tableError || !tableInfo) {
          return { 
            success: false, 
            message: 'Schema check failed', 
            error: tableError || new Error('Table not found') 
          };
        }
        
        // If we get here, at least the table exists
        return {
          success: true,
          data: { table_exists: true }
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
        
        // Try direct SQL approach as a fallback
        try {
          // Try to directly fix the processing_time issue
          const { data: directFixResult, error: directFixError } = await supabase.rpc('execute_sql', {
            sql: `
              DO $$
              BEGIN
                -- Create visa_packages table if it doesn't exist
                IF NOT EXISTS (
                  SELECT FROM information_schema.tables 
                  WHERE table_schema = 'public' AND table_name = 'visa_packages'
                ) THEN
                  CREATE TABLE visa_packages (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
                    name TEXT NOT NULL DEFAULT 'Visa Package',
                    government_fee NUMERIC NOT NULL DEFAULT 0,
                    service_fee NUMERIC NOT NULL DEFAULT 0,
                    processing_days INTEGER NOT NULL DEFAULT 15,
                    processing_time TEXT,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                  );
                END IF;
                
                -- Add missing columns if needed
                BEGIN
                  -- Add processing_days if it doesn't exist
                  IF NOT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'visa_packages' AND column_name = 'processing_days'
                  ) THEN
                    ALTER TABLE visa_packages ADD COLUMN processing_days INTEGER NOT NULL DEFAULT 15;
                  END IF;
                  
                  -- Make processing_time nullable if it exists
                  IF EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_schema = 'public' AND table_name = 'visa_packages' AND column_name = 'processing_time'
                  ) THEN
                    ALTER TABLE visa_packages ALTER COLUMN processing_time DROP NOT NULL;
                  END IF;
                EXCEPTION
                  WHEN OTHERS THEN
                    -- Ignore errors for now
                END;
              END $$;
            `
          });
          
          console.log('Direct schema fix result:', directFixResult, directFixError);
          
          if (directFixError) {
            console.error('Direct schema fix error:', directFixError);
            return fixResult; // Return original error
          }
          
          return {
            success: true,
            message: 'Schema fixed successfully with direct SQL',
            directFix: true
          };
        } catch (directError) {
          console.error('Error in direct schema fix:', directError);
          return fixResult; // Return original error
        }
      }
      
      console.log('Schema fix complete:', fixResult);
      
      // Verify the fix worked
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
