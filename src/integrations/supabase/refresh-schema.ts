
import { supabase } from './client';
import { fixVisaPackagesSchema, testVisaPackagesOperations } from './fix-schema';

/**
 * Refresh the Supabase schema cache to ensure we have the latest table definitions
 */
export async function refreshSchemaCache() {
  try {
    console.log('Refreshing schema cache...');
    
    // First try to fix any visa packages schema issues
    const fixResult = await fixVisaPackagesSchema();
    console.log('Fix result:', fixResult);
    
    // Force a query to refresh schema
    const { data, error } = await supabase
      .from('visa_packages')
      .select('count(*)')
      .limit(1);
      
    if (error) {
      console.error('Error refreshing schema cache:', error);
      return { success: false, error: error.message, fixResult };
    }
    
    console.log('Schema refresh completed successfully');
    return { success: true, fixResult };
  } catch (err: any) {
    console.error('Error in refreshSchemaCache:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Run a full database diagnostic for visa packages
 */
export async function runVisaPackagesDiagnostic(countryId: string) {
  try {
    // Step 1: Fix schema issues
    const fixResult = await fixVisaPackagesSchema();
    
    // Step 2: Test operations
    const testResult = await testVisaPackagesOperations(countryId);
    
    return {
      success: fixResult.success && testResult.success,
      schemaFix: fixResult,
      operationsTest: testResult
    };
  } catch (err: any) {
    return {
      success: false, 
      error: err.message,
      message: 'Diagnostic failed'
    };
  }
}

// Auto-run schema fix on import for critical components
export const autoFixSchema = async () => {
  console.log('Auto-fixing schema on component load...');
  const result = await refreshSchemaCache();
  return result;
};
