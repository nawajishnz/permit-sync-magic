
import { supabase } from './client';
import { fixVisaPackagesSchema, testVisaPackagesOperations } from './fix-schema';

/**
 * Refreshes the schema cache to detect new tables and columns
 */
export async function refreshSchemaCache() {
  console.log('Refreshing schema cache...');
  
  try {
    // First attempt: force schema refresh by querying tables
    await supabase.from('countries').select('count(*)').limit(1);
    
    // Try to access visa_packages, which might trigger schema refresh
    try {
      await supabase.from('visa_packages').select('count(*)').limit(1);
    } catch (err) {
      console.log('visa_packages table might not exist yet:', err);
    }
    
    return {
      success: true,
      message: 'Schema refresh attempted'
    };
  } catch (err: any) {
    console.error('Schema refresh error:', err);
    
    return {
      success: false,
      message: `Schema refresh error: ${err.message}`,
      error: err
    };
  }
}

/**
 * Automatically attempts to fix schema issues on application load
 */
export async function autoFixSchema() {
  console.log('Auto-fixing schema...');
  
  try {
    // First, refresh the schema cache
    await refreshSchemaCache();
    
    // Then attempt to fix visa_packages schema issues
    const fixResult = await fixVisaPackagesSchema();
    
    console.log('Schema auto-fix result:', fixResult);
    
    return fixResult;
  } catch (err: any) {
    console.error('Schema auto-fix error:', err);
    
    return {
      success: false,
      message: `Auto-fix error: ${err.message}`,
      error: err
    };
  }
}

/**
 * Run diagnostics on visa packages for a specific country
 */
export async function runVisaPackagesDiagnostic(countryId: string) {
  console.log('Running visa packages diagnostic...');
  
  try {
    // First, refresh the schema
    await refreshSchemaCache();
    
    // Then run specific operations tests
    const testResults = await testVisaPackagesOperations(countryId);
    
    console.log('Visa packages diagnostic results:', testResults);
    
    return {
      success: testResults.success,
      message: 'Diagnostic completed',
      results: testResults
    };
  } catch (err: any) {
    console.error('Diagnostic error:', err);
    
    return {
      success: false,
      message: `Diagnostic error: ${err.message}`,
      error: err
    };
  }
}
