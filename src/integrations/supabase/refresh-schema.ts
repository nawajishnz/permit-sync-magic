
import { supabase } from './client';

// Function to run diagnostic on visa packages
export const runVisaPackagesDiagnostic = async (countryId: string) => {
  try {
    console.log('Running visa packages diagnostic for country:', countryId);
    
    // Check if the country exists
    const { data: country, error: countryError } = await supabase
      .from('countries')
      .select('id, name')
      .eq('id', countryId)
      .single();
      
    if (countryError || !country) {
      console.error('Country not found:', countryError);
      return {
        success: false,
        message: `Country not found: ${countryError?.message || 'Invalid country ID'}`
      };
    }
    
    // Check visa_packages table access
    const tableAccessCheck = await supabase
      .from('visa_packages')
      .select('count(*)')
      .single();
      
    const tableAccess = {
      success: !tableAccessCheck.error,
      error: tableAccessCheck.error?.message,
      count: tableAccessCheck.error ? 0 : tableAccessCheck.data?.count
    };
    
    // Check if package exists for this country
    const { data: packageExists, error: packageError } = await supabase
      .from('visa_packages')
      .select('*')
      .eq('country_id', countryId);
      
    const hasPackage = !packageError && packageExists && packageExists.length > 0;
    const isActive = hasPackage && packageExists[0].is_active;
    
    // Check document_checklist table access
    const docTableAccessCheck = await supabase
      .from('document_checklist')
      .select('count(*)')
      .single();
      
    const documentTableAccess = {
      success: !docTableAccessCheck.error,
      error: docTableAccessCheck.error?.message,
      count: docTableAccessCheck.error ? 0 : docTableAccessCheck.data?.count
    };
    
    // Check if documents exist for this country
    const { data: documents, error: docError } = await supabase
      .from('document_checklist')
      .select('*')
      .eq('country_id', countryId);
      
    const hasDocuments = !docError && documents && documents.length > 0;
    
    const results = {
      tableAccess,
      packageExists: hasPackage,
      packageActive: isActive,
      documentsExist: hasDocuments,
      documentsCount: hasDocuments ? documents.length : 0,
      documentTableAccess
    };
    
    // Generate recommendations
    const recommendations = [];
    
    if (!tableAccess.success) {
      recommendations.push('Fix visa_packages table schema issues');
    }
    
    if (!hasPackage) {
      recommendations.push('Create visa package for this country');
    } else if (!isActive) {
      recommendations.push('Activate visa package for this country');
    }
    
    if (!documentTableAccess.success) {
      recommendations.push('Fix document_checklist table schema issues');
    }
    
    if (!hasDocuments) {
      recommendations.push('Add document requirements for this country');
    }
    
    return {
      success: tableAccess.success && hasPackage && documentTableAccess.success && hasDocuments,
      message: tableAccess.success && hasPackage && documentTableAccess.success && hasDocuments
        ? 'All checks passed successfully'
        : 'Issues found with country configuration',
      results,
      recommendations: recommendations.length > 0 ? recommendations : null
    };
  } catch (error: any) {
    console.error('Error in visa packages diagnostic:', error);
    return {
      success: false,
      message: `Error running diagnostic: ${error.message}`,
      error
    };
  }
};

// Simple function to refresh schema cache by performing some queries
export const refreshDocumentSchema = async () => {
  try {
    console.log('Refreshing document schema...');
    
    // Try to access the document_checklist table
    const { data, error } = await supabase
      .from('document_checklist')
      .select('count(*)')
      .single();
      
    if (error) {
      console.error('Error accessing document_checklist table:', error);
      return {
        success: false,
        message: `Schema refresh failed: ${error.message}`
      };
    }
    
    console.log('Document schema refreshed successfully');
    return {
      success: true,
      message: 'Document schema refreshed successfully',
      count: data?.count ?? 0
    };
  } catch (error: any) {
    console.error('Error refreshing document schema:', error);
    return {
      success: false,
      message: `Error refreshing document schema: ${error.message}`,
      error
    };
  }
};

// Export the refreshSchemaCache function
export const refreshSchemaCache = async () => {
  try {
    console.log('Refreshing schema cache...');
    
    // Check visa_packages table
    const { data: packagesData, error: packagesError } = await supabase
      .from('visa_packages')
      .select('count(*)')
      .single();
      
    // Check document_checklist table
    const { data: docData, error: docError } = await supabase
      .from('document_checklist')
      .select('count(*)')
      .single();
      
    return {
      success: !packagesError && !docError,
      message: 'Schema cache refreshed',
      visa_packages: {
        success: !packagesError,
        error: packagesError?.message,
        count: packagesError ? 0 : packagesData?.count ?? 0
      },
      document_checklist: {
        success: !docError,
        error: docError?.message,
        count: docError ? 0 : docData?.count ?? 0
      }
    };
  } catch (error: any) {
    console.error('Error refreshing schema cache:', error);
    return {
      success: false,
      message: `Error refreshing schema cache: ${error.message}`,
      error
    };
  }
};

// Function to check if tables exist and are accessible
export const checkTablesExist = async () => {
  try {
    const results: Record<string, any> = {};
    
    // Check visa_packages table
    try {
      const { data: packages, error: packagesError } = await supabase
        .from('visa_packages')
        .select('count(*)')
        .single();
        
      results.visa_packages = {
        exists: !packagesError,
        error: packagesError?.message,
        count: packagesError ? 0 : packages?.count ?? 0
      };
    } catch (err: any) {
      results.visa_packages = {
        exists: false,
        error: err.message
      };
    }
    
    // Check document_checklist table
    try {
      const { data: docs, error: docsError } = await supabase
        .from('document_checklist')
        .select('count(*)')
        .single();
        
      results.document_checklist = {
        exists: !docsError,
        error: docsError?.message,
        count: docsError ? 0 : docs?.count ?? 0
      };
    } catch (err: any) {
      results.document_checklist = {
        exists: false,
        error: err.message
      };
    }
    
    // Check countries table
    try {
      const { data: countries, error: countriesError } = await supabase
        .from('countries')
        .select('count(*)')
        .single();
        
      results.countries = {
        exists: !countriesError,
        error: countriesError?.message,
        count: countriesError ? 0 : countries?.count ?? 0
      };
    } catch (err: any) {
      results.countries = {
        exists: false,
        error: err.message
      };
    }
    
    const allExist = Object.values(results).every((r: any) => r.exists);
    
    return {
      success: allExist,
      message: allExist ? 'All tables exist and are accessible' : 'Some tables have issues',
      results
    };
  } catch (error: any) {
    console.error('Error checking tables:', error);
    return {
      success: false,
      message: `Error checking tables: ${error.message}`,
      error
    };
  }
};
