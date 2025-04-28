
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getCountryVisaPackage, saveVisaPackage, toggleVisaPackageStatus, runDiagnostic } from '@/services/visaPackageService';
import { VisaPackage } from '@/types/visaPackage';
import { useQueryClient } from '@tanstack/react-query';

interface UseVisaPackageProps {
  externalQueryClient?: any;
}

export const useVisaPackage = ({ externalQueryClient }: UseVisaPackageProps = {}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<VisaPackage | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  
  const localQueryClient = useQueryClient();
  const queryClient = externalQueryClient || localQueryClient;
  const { toast } = useToast();
  
  const fetchVisaPackage = async (countryId: string) => {
    if (!countryId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const packageData = await getCountryVisaPackage(countryId);
      setPackageData(packageData);
      return packageData;
    } catch (err: any) {
      console.error("Error in fetchVisaPackage:", err);
      setError(err.message || "An error occurred while fetching visa package");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveVisaPackageData = async (packageToSave: VisaPackage) => {
    setSaving(true);
    setError(null);
    
    try {
      const result = await saveVisaPackage(packageToSave);
      
      if (result.success) {
        invalidateQueries(packageToSave.country_id);
        await fetchVisaPackage(packageToSave.country_id);
      } else {
        setError(result.message);
      }
      
      return result;
    } catch (err: any) {
      console.error("Error in saveVisaPackageData:", err);
      setError(err.message || "Failed to save visa package data");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const togglePackageStatus = async (countryId: string, isActive: boolean) => {
    try {
      const result = await toggleVisaPackageStatus(countryId, isActive);
      
      if (result.success) {
        invalidateQueries(countryId);
        await fetchVisaPackage(countryId);
      }
      
      return result;
    } catch (err: any) {
      console.error("Error in togglePackageStatus:", err);
      setError(err.message || "Failed to update package status");
      throw err;
    }
  };

  const runVisaDiagnostic = async (countryId: string) => {
    setRunningDiagnostic(true);
    
    try {
      const result = await runDiagnostic(countryId);
      setDiagnosticResult(result);
      return result;
    } catch (err: any) {
      console.error("Error in runVisaDiagnostic:", err);
      setError(err.message || "Failed to run diagnostic");
      throw err;
    } finally {
      setRunningDiagnostic(false);
    }
  };

  const invalidateQueries = (countryId: string) => {
    queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
    queryClient.invalidateQueries({ queryKey: ['countryDetail'] });
    queryClient.invalidateQueries({ queryKey: ['countries'] });
    queryClient.invalidateQueries({ queryKey: ['countryVisaPackage'] });
    queryClient.invalidateQueries({ queryKey: ['popularDestinations'] });
    
    if (countryId) {
      queryClient.invalidateQueries({ queryKey: ['country', countryId] });
      queryClient.invalidateQueries({ queryKey: ['countryDetail', countryId] });
    }
  };
  
  return {
    fetchVisaPackage,
    saveVisaPackageData,
    togglePackageStatus,
    runVisaDiagnostic,
    invalidateQueries,
    loading,
    saving,
    runningDiagnostic,
    error,
    packageData,
    diagnosticResult,
    setError
  };
};
