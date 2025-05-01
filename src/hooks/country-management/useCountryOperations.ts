
import { useState } from 'react';
import { saveVisaPackage, toggleVisaPackageStatus } from '@/services/visaPackageService';
import { saveDocumentChecklist, fixDocumentIssues } from '@/services/documentChecklistService';
import { DocumentItem } from '@/services/documentChecklistService';
import { VisaPackage } from '@/types/visaPackage';
import { useCountryQueries } from './useCountryQueries';
import { useCountryData } from './useCountryData';
import { useToast } from '@/hooks/use-toast';
import schemaFixService from '@/services/schemaFixService';

export const useCountryOperations = (queryClient?: any) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
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
      // First, ensure schema is valid
      const schemaResult = await schemaFixService.fixSchema();
      if (!schemaResult.success) {
        toast({
          title: "Schema Fix Required",
          description: "Database schema needs to be fixed first. Please try again.",
          variant: "destructive"
        });
        throw new Error("Schema fix required before saving");
      }
      
      // Ensure all price values are properly converted to numbers and is_active has a default
      const packageWithNumericValues = {
        ...packageToSave,
        government_fee: Number(packageToSave.government_fee) || 0,
        service_fee: Number(packageToSave.service_fee) || 0,
        processing_days: Number(packageToSave.processing_days) || 15,
        is_active: packageToSave.is_active !== undefined ? packageToSave.is_active : true, // Ensure we have a default
        processing_time: packageToSave.processing_time || `${Number(packageToSave.processing_days) || 15} days` // Add processing_time
      };
      
      console.log('Saving package with values:', packageWithNumericValues);
      const packageResult = await saveVisaPackage(packageWithNumericValues);
      console.log('Package save result:', packageResult);
      
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
          message: errorMessage || 'Failed to save some country data',
          data: null
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
  const togglePackageAndEnsureDocuments = async (countryId: string, isActive: boolean): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> => {
    setSaving(true);
    
    try {
      console.log(`Toggling package status for country ${countryId} to ${isActive ? 'active' : 'inactive'}`);
      
      // First make sure schema is properly set up
      const schemaResult = await schemaFixService.fixSchema();
      
      if (!schemaResult.success) {
        toast({
          title: "Schema Fix Failed", 
          description: "Database schema needs to be updated. Please use the database updater tool.",
          variant: "destructive"
        });
        return {
          success: false,
          message: "Schema needs to be fixed before activating country",
          data: null
        };
      }
      
      // Then toggle package status
      const packageResult = await toggleVisaPackageStatus(countryId, isActive);
      
      if (!packageResult.success) {
        setError(packageResult.message || "Failed to update package status");
        return {
          success: false,
          message: packageResult.message || "Failed to update package status",
          data: null
        };
      }
      
      // Then ensure documents exist if activating
      if (isActive) {
        await fixDocumentIssues(countryId);
      }
      
      // Invalidate queries
      invalidateQueries(countryId);
      
      // Refresh the data
      await fetchCountryData(countryId);
      
      return {
        success: true,
        message: "Package status updated successfully",
        data: packageResult.data
      };
    } catch (err: any) {
      console.error("Error in togglePackageAndEnsureDocuments:", err);
      setError(err.message || "Failed to update package status");
      return {
        success: false,
        message: err.message || "An error occurred while updating package status",
        data: null
      };
    } finally {
      setSaving(false);
    }
  };
  
  return {
    saving,
    saveCountryData,
    togglePackageAndEnsureDocuments
  };
};
