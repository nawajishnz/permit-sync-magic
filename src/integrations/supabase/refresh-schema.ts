
import { supabase } from './client';
import { createOrFixVisaPackageSchema, createDefaultVisaPackageForCountry } from './fix-schema';
import { Database } from '@/integrations/supabase/types';

/**
 * Refreshes the database schema to ensure tables have the correct structure
 */
export async function refreshSchemaCache() {
  try {
    // First try to use the RPC function if it exists
    try {
      const { data, error } = await supabase.rpc('refresh_schema_cache');
      
      if (error) {
        console.error('Error refreshing schema cache via RPC:', error);
      } else if (data) {
        return {
          success: true,
          message: 'Schema cache refreshed successfully via RPC',
          data: data
        };
      }
    } catch (error) {
      console.error('Exception calling refresh_schema_cache RPC:', error);
    }
    
    // Fall back to manual schema refresh
    return await createOrFixVisaPackageSchema();
  } catch (error) {
    console.error('Exception in refreshSchemaCache:', error);
    return { 
      success: false, 
      message: 'Exception occurred while refreshing schema cache',
      error 
    };
  }
}

/**
 * Refreshes the schema and fixes any issues with the visa packages table
 */
export async function refreshVisaPackagesSchema() {
  try {
    // First try to run the schema refresh RPC
    const { data, error } = await supabase.rpc('refresh_visa_packages_schema');
    
    if (error) {
      console.error('Error refreshing visa packages schema via RPC:', error);
      // Fallback to direct fix
      return await createOrFixVisaPackageSchema();
    }
    
    if (data) {
      return {
        success: true,
        message: 'Visa packages schema refreshed successfully',
        data
      };
    }
    
    return {
      success: false,
      message: 'Visa packages schema refresh returned no data'
    };
  } catch (error) {
    console.error('Exception in refreshVisaPackagesSchema:', error);
    return { 
      success: false, 
      message: 'Exception occurred while refreshing visa packages schema',
      error 
    };
  }
}

/**
 * Gets the stored procedure definitions from the database
 */
export async function getStoredProceduresDefinitions() {
  try {
    // This SQL query gets the definition of all stored procedures
    const { data, error } = await supabase.from('pg_proc_definitions').select('*');
    
    if (error) {
      console.error('Error fetching stored procedures:', error);
      return { 
        success: false, 
        message: 'Failed to fetch stored procedures definitions',
        error 
      };
    }
    
    return {
      success: true,
      message: 'Stored procedures definitions retrieved successfully',
      data
    };
  } catch (error) {
    console.error('Exception in getStoredProceduresDefinitions:', error);
    return { 
      success: false, 
      message: 'Exception occurred while fetching stored procedures',
      error 
    };
  }
}

/**
 * Runs a diagnostic check on the visa packages system
 */
export async function runVisaPackagesDiagnostic(countryId?: string) {
  try {
    const results = {
      schema: null,
      tables: null,
      countryCheck: null,
      visaPackages: null,
      documentChecklist: null,
      fixAttempt: null
    };
    
    // Check schema version
    const schemaCheck = await getStoredProceduresDefinitions();
    results.schema = {
      success: schemaCheck.success,
      message: schemaCheck.message,
      procedures: schemaCheck.data ? schemaCheck.data.length : 0,
      hasFunctions: schemaCheck.data && schemaCheck.data.some((p: any) => p.name === 'fix_visa_packages')
    };
    
    // Check if tables exist
    const { data: tableList, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['visa_packages', 'document_checklist', 'countries']);
    
    results.tables = {
      success: !tableError,
      error: tableError ? tableError.message : null,
      tables: tableList ? tableList.map((t: any) => t.table_name) : [],
      hasPackagesTable: tableList ? tableList.some((t: any) => t.table_name === 'visa_packages') : false,
      hasDocumentsTable: tableList ? tableList.some((t: any) => t.table_name === 'document_checklist') : false
    };
    
    // If a country ID is provided, check if it exists
    if (countryId) {
      const { data, error } = await supabase
        .from('countries')
        .select('id, name')
        .eq('id', countryId)
        .single();
      
      results.countryCheck = {
        success: !error,
        error: error ? error.message : null,
        countryExists: !!data,
        countryName: data ? data.name : null
      };
      
      if (data) {
        // Check if visa packages exist for this country
        const { data: packagesData, error: packagesError } = await supabase
          .from('visa_packages')
          .select('*')
          .eq('country_id', countryId);
          
        results.visaPackages = {
          success: !packagesError,
          error: packagesError ? packagesError.message : null,
          packageExists: packagesData ? packagesData.length > 0 : false,
          packageData: packagesData && packagesData.length > 0 ? packagesData[0] : null
        };
        
        // Check if document checklist exists for this country
        const { data: docData, error: docError } = await supabase
          .from('document_checklist')
          .select('*')
          .eq('country_id', countryId);
          
        results.documentChecklist = {
          success: !docError,
          error: docError ? docError.message : null,
          documentsExist: docData ? docData.length > 0 : false,
          documentCount: docData ? docData.length : 0
        };
        
        // If issues detected, try to fix automatically
        const needsFix = 
          (!results.visaPackages?.packageExists || !results.documentChecklist?.documentsExist);
          
        if (needsFix) {
          results.fixAttempt = {
            attempted: true,
            message: 'Automatic fix attempted'
          };
          
          // If schema is missing, fix it first
          if (!results.tables.hasPackagesTable || !results.tables.hasDocumentsTable) {
            const schemaFix = await refreshSchemaCache();
            results.fixAttempt.schemaFix = {
              success: schemaFix.success,
              message: schemaFix.message
            };
          }
          
          // Create default visa package and documents if missing
          if (!results.visaPackages?.packageExists || !results.documentChecklist?.documentsExist) {
            const packageFix = await createDefaultVisaPackageForCountry(countryId);
            results.fixAttempt.packageFix = {
              success: packageFix.success,
              message: packageFix.message
            };
          }
        }
      }
    } else {
      // If no country ID, check overall visa packages
      const { data: packages, error: packagesError } = await supabase
        .from('visa_packages')
        .select('country_id')
        .limit(10);
        
      results.visaPackages = {
        success: !packagesError,
        error: packagesError ? packagesError.message : null,
        packageCount: packages ? packages.length : 0,
        sampleCountries: packages ? packages.map((p: any) => p.country_id).slice(0, 5) : []
      };
      
      // Check document checklist overall
      const { data: docs, error: docsError } = await supabase
        .from('document_checklist')
        .select('country_id, document_name')
        .limit(10);
        
      results.documentChecklist = {
        success: !docsError,
        error: docsError ? docsError.message : null,
        documentCount: docs ? docs.length : 0,
      };
      
      // Check countries overall
      const { data: countries, error: countriesError } = await supabase
        .from('countries')
        .select('id, name')
        .limit(10);
        
      results.countryCheck = {
        success: !countriesError,
        error: countriesError ? countriesError.message : null,
        countryCount: countries ? countries.length : 0,
        sampleCountries: countries ? countries.map((c: any) => ({ id: c.id, name: c.name })).slice(0, 5) : []
      };
    }
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      results
    };
  } catch (error) {
    console.error('Exception in runVisaPackagesDiagnostic:', error);
    return { 
      success: false, 
      message: 'Exception occurred while running visa packages diagnostic',
      error 
    };
  }
}
