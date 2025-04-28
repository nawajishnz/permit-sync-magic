
import { supabase } from '@/integrations/supabase/client';

export async function runDiagnostic(countryId: string): Promise<{ 
  success: boolean; 
  message: string; 
  results?: any;
  recommendations?: string[];
}> {
  try {
    console.log('Running diagnostic for country:', countryId);
    const recommendations: string[] = [];
    const results: any = {
      tableAccess: null,
      packageExists: false,
      documentsExist: false,
      packageActive: false,
      rpc: {
        success: false,
        error: null
      }
    };
    
    // Test direct table access for visa_packages
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('visa_packages')
        .select('count(*)')
        .single();
        
      results.tableAccess = {
        success: !tableError,
        error: tableError?.message,
        data: tableData
      };
      
      if (tableError) {
        recommendations.push('The visa_packages table appears to have issues. Try refreshing schema.');
      }
    } catch (err: any) {
      results.tableAccess = {
        success: false,
        error: err.message
      };
      recommendations.push('Cannot access visa_packages table. Check your database permissions.');
    }
    
    // Check document_checklist table access
    try {
      const { data: docTableData, error: docTableError } = await supabase
        .from('document_checklist')
        .select('count(*)')
        .single();
        
      results.documentTableAccess = {
        success: !docTableError,
        error: docTableError?.message,
        data: docTableData
      };
      
      if (docTableError) {
        recommendations.push('The document_checklist table appears to have issues. Try refreshing schema.');
      }
    } catch (err: any) {
      results.documentTableAccess = {
        success: false,
        error: err.message
      };
      recommendations.push('Cannot access document_checklist table. Check your database permissions.');
    }
    
    // Check if package exists for this country
    if (countryId) {
      try {
        const { data: packageData, error: packageError } = await supabase
          .from('visa_packages')
          .select('*')
          .eq('country_id', countryId)
          .maybeSingle();
          
        if (packageError) {
          console.error('Error checking package:', packageError);
          results.packageCheck = {
            success: false,
            error: packageError.message
          };
          recommendations.push('Error checking for existing visa package. Try again or refresh schema.');
        } else {
          results.packageExists = !!packageData;
          results.packageActive = packageData && (packageData.government_fee > 0 || packageData.service_fee > 0);
          results.packageData = packageData;
          
          if (!packageData) {
            recommendations.push('No visa package exists for this country. Try creating one.');
          } else if (!results.packageActive) {
            recommendations.push('Visa package exists but appears to be inactive (zero fees).');
          }
        }
      } catch (err: any) {
        console.error('Error checking package existence:', err);
        results.packageCheck = {
          success: false,
          error: err.message
        };
      }
      
      // Check if documents exist for this country
      try {
        const { data: documents, error: docError } = await supabase
          .from('document_checklist')
          .select('*')
          .eq('country_id', countryId);
          
        if (docError) {
          console.error('Error checking documents:', docError);
          results.documentCheck = {
            success: false,
            error: docError.message
          };
          recommendations.push('Error checking documents. Try refreshing schema.');
        } else {
          results.documentsExist = documents && documents.length > 0;
          results.documentsCount = documents ? documents.length : 0;
          
          if (!documents || documents.length === 0) {
            recommendations.push('No documents exist for this country. Try adding some.');
          }
        }
      } catch (err: any) {
        console.error('Error checking documents existence:', err);
        results.documentCheck = {
          success: false,
          error: err.message
        };
      }
    }
    
    // Try using RPC function for better compatibility
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('save_visa_package', {
        p_country_id: countryId,
        p_name: 'Test Package',
        p_government_fee: 0,
        p_service_fee: 0,
        p_processing_days: 15
      });
      
      results.rpc = {
        success: !rpcError && !!rpcData,
        error: rpcError?.message,
        data: rpcData
      };
      
      if (rpcError) {
        recommendations.push('RPC functions may not be available. This is optional but recommended.');
      }
    } catch (err: any) {
      results.rpc = {
        success: false,
        error: err.message
      };
    }
    
    const success = results.tableAccess?.success || results.rpc?.success;
    
    return {
      success,
      message: success 
        ? "Diagnostic completed successfully" 
        : "Diagnostic found issues that need attention",
      results,
      recommendations
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Diagnostic failed: ${err.message}`,
      recommendations: ['An unexpected error occurred during diagnostics. Try refreshing the page.']
    };
  }
}
