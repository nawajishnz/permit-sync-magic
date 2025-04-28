
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  getCountryVisaPackage,
  saveVisaPackage,
  toggleVisaPackageStatus,
  runDiagnostic
} from '@/services/visaPackageService';
import {
  getDocumentChecklist,
  saveDocumentChecklist,
  refreshDocumentSchema,
  fixDocumentIssues
} from '@/services/documentChecklistService';
import { VisaPackage } from '@/types/visaPackage';
import { DocumentItem } from '@/services/documentChecklistService';

interface UseCountryManagementProps {
  externalQueryClient?: any;
}

export const useCountryManagement = ({ externalQueryClient }: UseCountryManagementProps = {}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<VisaPackage | null>(null);
  const [documentData, setDocumentData] = useState<DocumentItem[]>([]);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  
  const localQueryClient = useQueryClient();
  const queryClient = externalQueryClient || localQueryClient;
  const { toast } = useToast();
  
  // Fetch both package and document data
  const fetchCountryData = async (countryId: string) => {
    if (!countryId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both in parallel
      const [packageData, documentData] = await Promise.all([
        getCountryVisaPackage(countryId),
        getDocumentChecklist(countryId)
      ]);
      
      setPackageData(packageData);
      setDocumentData(documentData);
      
      return {
        packageData,
        documentData
      };
    } catch (err: any) {
      console.error("Error fetching country data:", err);
      setError(err.message || "An error occurred while fetching country data");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save both package and document data
  const saveCountryData = async (
    countryId: string, 
    packageToSave: VisaPackage,
    documentsToSave?: DocumentItem[]
  ) => {
    setSaving(true);
    setError(null);
    
    try {
      // Save package data
      const packageResult = await saveVisaPackage(packageToSave);
      
      // If documents were provided, save them too
      let documentResult = { success: true, message: 'No documents to save' };
      if (documentsToSave && documentsToSave.length > 0) {
        documentResult = await saveDocumentChecklist(countryId, documentsToSave);
      }
      
      // Determine overall success
      const success = packageResult.success && documentResult.success;
      
      if (!success) {
        const errorMessage = [
          !packageResult.success ? packageResult.message : '',
          !documentResult.success ? documentResult.message : ''
        ].filter(Boolean).join('; ');
        
        setError(errorMessage);
        
        return {
          success: false,
          message: errorMessage || 'Failed to save some country data'
        };
      }
      
      // Invalidate queries to refresh data
      invalidateQueries(countryId);
      
      // Refresh the data
      await fetchCountryData(countryId);
      
      return {
        success: true,
        message: 'Country data saved successfully',
        packageResult,
        documentResult
      };
    } catch (err: any) {
      console.error("Error saving country data:", err);
      setError(err.message || "Failed to save country data");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Toggle package status and ensure documents exist
  const togglePackageAndEnsureDocuments = async (countryId: string, isActive: boolean) => {
    try {
      // First toggle package status
      const packageResult = await toggleVisaPackageStatus(countryId, isActive);
      
      if (!packageResult.success) {
        return packageResult;
      }
      
      // Then ensure documents exist if activating
      if (isActive) {
        await fixDocumentIssues(countryId);
      }
      
      // Invalidate queries
      invalidateQueries(countryId);
      
      // Refresh the data
      await fetchCountryData(countryId);
      
      return packageResult;
    } catch (err: any) {
      console.error("Error in togglePackageAndEnsureDocuments:", err);
      setError(err.message || "Failed to update package status");
      throw err;
    }
  };

  // Run diagnostic with enhanced functionality
  const runCountryDiagnostic = async (countryId: string) => {
    setRunningDiagnostic(true);
    
    try {
      // Run visa package diagnostic
      const result = await runDiagnostic(countryId);
      setDiagnosticResult(result);
      
      // If there are issues, try to fix them
      if (!result.success || (result.recommendations && result.recommendations.length > 0)) {
        // Try to fix document issues
        await fixDocumentIssues(countryId);
      }
      
      return result;
    } catch (err: any) {
      console.error("Error in runCountryDiagnostic:", err);
      setError(err.message || "Failed to run diagnostic");
      throw err;
    } finally {
      setRunningDiagnostic(false);
    }
  };

  // Refresh schema and data
  const refreshSchemaAndData = async (countryId: string) => {
    try {
      // Refresh document schema
      await refreshDocumentSchema();
      
      // Invalidate queries
      invalidateQueries(countryId);
      
      // Refresh data
      return await fetchCountryData(countryId);
    } catch (err: any) {
      console.error("Error refreshing schema and data:", err);
      throw err;
    }
  };

  const invalidateQueries = (countryId: string) => {
    // Invalidate all relevant queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
    queryClient.invalidateQueries({ queryKey: ['countryDetail'] });
    queryClient.invalidateQueries({ queryKey: ['countries'] });
    queryClient.invalidateQueries({ queryKey: ['countryVisaPackage'] });
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    queryClient.invalidateQueries({ queryKey: ['popularDestinations'] });
    
    // Invalidate country-specific queries
    if (countryId) {
      queryClient.invalidateQueries({ queryKey: ['country', countryId] });
      queryClient.invalidateQueries({ queryKey: ['countryDetail', countryId] });
      queryClient.invalidateQueries({ queryKey: ['documents', countryId] });
      queryClient.invalidateQueries({ queryKey: ['countryVisaPackage', countryId] });
    }
  };
  
  return {
    fetchCountryData,
    saveCountryData,
    togglePackageAndEnsureDocuments,
    runCountryDiagnostic,
    refreshSchemaAndData,
    invalidateQueries,
    loading,
    saving,
    runningDiagnostic,
    error,
    packageData,
    documentData,
    diagnosticResult,
    setError
  };
};

export default useCountryManagement;
