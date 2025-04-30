
import { useState } from 'react';
import { saveVisaPackage, toggleVisaPackageStatus } from '@/services/visaPackageService';
import { saveDocumentChecklist, fixDocumentIssues } from '@/services/documentChecklistService';
import { DocumentItem } from '@/services/documentChecklistService';
import { VisaPackage } from '@/types/visaPackage';
import { useCountryQueries } from './useCountryQueries';
import { useCountryData } from './useCountryData';

export const useCountryOperations = (queryClient?: any) => {
  const [saving, setSaving] = useState(false);
  
  const { invalidateQueries } = useCountryQueries(queryClient);
  const { fetchCountryData, setError } = useCountryData(queryClient);
  
  // Save both package and document data
  const saveCountryData = async (
    countryId: string, 
    packageToSave: VisaPackage,
    documentsToSave?: DocumentItem[]
  ) => {
    setSaving(true);
    setError(null);
    
    try {
      // Save package data with proper number conversion
      const packageWithNumericValues = {
        ...packageToSave,
        government_fee: Number(packageToSave.government_fee) || 0,
        service_fee: Number(packageToSave.service_fee) || 0,
        processing_days: Number(packageToSave.processing_days) || 15
      };
      
      const packageResult = await saveVisaPackage(packageWithNumericValues);
      
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
  
  return {
    saving,
    saveCountryData,
    togglePackageAndEnsureDocuments
  };
};
