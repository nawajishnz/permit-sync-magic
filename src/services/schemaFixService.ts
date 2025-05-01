
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
      // Use a simpler query that won't have parsing issues
      const { data, error } = await supabase
        .from('visa_packages')
        .select('id, is_active')
        .limit(1);
      
      if (error) {
        console.error('Error checking schema:', error);
        // Check if error message specifically mentions is_active column
        if (error.message && error.message.includes("is_active")) {
          return { 
            success: false, 
            message: 'Schema is missing is_active column', 
            error,
            needsIsActiveColumn: true
          };
        }
        return { 
          success: false, 
          message: 'Schema check failed', 
          error 
        };
      }
      
      // Table exists if we got here
      return {
        success: true,
        data: { table_exists: true, has_is_active: true }
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
          check.data.has_is_active) {
        console.log('Schema is already valid:', check.data);
        return {
          success: true,
          message: 'Schema is valid, no fixes needed',
          data: check.data
        };
      }
      
      console.log('Schema needs fixing, running fix...');
      
      // Create basic version of the table with all required fields
      try {
        // Try direct database operations to create the table with all required fields
        const { error: createTableError } = await supabase.rpc(
          'execute_sql',
          {
            sql_query: `
              CREATE TABLE IF NOT EXISTS public.visa_packages (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                government_fee NUMERIC NOT NULL DEFAULT 0,
                service_fee NUMERIC NOT NULL DEFAULT 0,
                processing_days INTEGER NOT NULL DEFAULT 15,
                price NUMERIC NOT NULL DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                processing_time TEXT DEFAULT '15 business days',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
              );
              
              -- Add is_active column if it doesn't exist
              DO $$
              BEGIN
                IF NOT EXISTS (
                  SELECT FROM information_schema.columns 
                  WHERE table_name = 'visa_packages' AND column_name = 'is_active'
                ) THEN
                  ALTER TABLE public.visa_packages ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
                END IF;
              END $$;
            `
          }
        );
        
        if (createTableError) {
          console.error('Error creating table with RPC:', createTableError);
          
          // Try direct insert approach instead with is_active field
          const { data: directResult, error: directError } = await supabase
            .from('visa_packages')
            .insert({
              country_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
              name: 'Test Package',
              government_fee: 0,
              service_fee: 0,
              processing_days: 15,
              price: 0,
              processing_time: '15 business days',
              is_active: true // Add the required field
            })
            .select();
          
          console.log('Direct schema creation attempt result:', directResult, directError);
          
          if (directError && !directError.message.includes('foreign key constraint')) {
            console.error('Direct schema creation error:', directError);
            return { 
              success: false, 
              message: 'Failed to fix schema: ' + directError.message
            };
          }
          
          return {
            success: true,
            message: 'Schema fixed with direct approach',
            directFix: true
          };
        }
        
        console.log('Table creation successful');
        return {
          success: true,
          message: 'Schema fixed successfully with SQL query',
        };
      } catch (createError: any) {
        console.error('Error in SQL query execution:', createError);
        
        // Final fallback to integration function
        try {
          // Try using the integration function as last resort
          const fixResult = await fixVisaPackagesSchema();
          
          if (!fixResult.success) {
            console.error('Schema fix failed:', fixResult);
            return fixResult;
          }
          
          return {
            success: true,
            message: 'Schema fixed with integration function',
            data: fixResult
          };
        } catch (integrationError: any) {
          console.error('Error in integration schema fix:', integrationError);
          return { 
            success: false, 
            message: 'All schema fix attempts failed: ' + integrationError.message
          };
        }
      }
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
