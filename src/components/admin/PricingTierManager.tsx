import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Database, CheckCircle, RefreshCw, PlusCircle } from 'lucide-react';
import { getCountryVisaPackage, saveVisaPackage, runDiagnostic, toggleVisaPackageStatus } from '@/services/visaPackageService';
import { VisaPackage } from '@/types/visaPackage';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

// Import our new components
import CountrySelector from './pricing/CountrySelector';
import DiagnosticResult from './pricing/DiagnosticResult';
import PackageStatusToggle from './pricing/PackageStatusToggle';
import PricingForm from './pricing/PricingForm';
import LoadingIndicator from '../shared/LoadingIndicator';
import ErrorDisplay from '../shared/ErrorDisplay';

interface PricingTierManagerProps {
  countries: any[];
  selectedCountryId: string | null;
  onSelectCountry: (countryId: string) => void;
  queryClient?: any;
}

interface PricingFormData {
  government_fee: string;
  service_fee: string;
  processing_days: string;
  name?: string;
}

const PricingTierManager: React.FC<PricingTierManagerProps> = ({ 
  countries, 
  selectedCountryId, 
  onSelectCountry,
  queryClient: propQueryClient
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<VisaPackage | null>(null);
  const [formData, setFormData] = useState<PricingFormData>({
    name: 'Visa Package',
    government_fee: '0',
    service_fee: '0',
    processing_days: '15'
  });
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  
  const { toast } = useToast();
  const localQueryClient = useQueryClient();
  const activeQueryClient = propQueryClient || localQueryClient;
  
  const fetchPricingData = async () => {
    if (!selectedCountryId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching pricing data for country:', selectedCountryId);
      const packageData = await getCountryVisaPackage(selectedCountryId);
      
      if (packageData) {
        console.log("Found package data:", packageData);
        setPackageData(packageData);
        
        setFormData({
          name: packageData.name || 'Visa Package',
          government_fee: packageData.government_fee?.toString() || '0',
          service_fee: packageData.service_fee?.toString() || '0',
          processing_days: packageData.processing_days?.toString() || '15'
        });
      } else {
        console.log("No package data found, setting defaults");
        setPackageData(null);
        setFormData({
          name: 'Visa Package',
          government_fee: '0',
          service_fee: '0',
          processing_days: '15'
        });
      }
    } catch (err: any) {
      console.error("Error in fetchPricingData:", err);
      setError(err.message || "An error occurred while fetching pricing data");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (selectedCountryId) {
      fetchPricingData();
    }
  }, [selectedCountryId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectCountry = (countryId: string) => {
    onSelectCountry(countryId);
  };
  
  const handleRunDiagnostic = async () => {
    if (!selectedCountryId) {
      toast({ 
        title: "No country selected", 
        description: "Please select a country to run diagnostic" 
      });
      return;
    }
    
    setRunningDiagnostic(true);
    try {
      const result = await runDiagnostic(selectedCountryId);
      setDiagnosticResult(result);
      
      toast({
        title: result.success ? "Diagnostic complete" : "Diagnostic found issues",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
      
      if (result.success) {
        await fetchPricingData();
      }
    } catch (err: any) {
      toast({
        title: "Diagnostic failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setRunningDiagnostic(false);
    }
  };
  
  const handleRefresh = async () => {
    if (!selectedCountryId) return;
    await fetchPricingData();
    toast({
      title: "Data refreshed",
      description: "Pricing data has been refreshed"
    });
  };
  
  const handleCreateOrUpdate = async () => {
    if (!selectedCountryId) {
      toast({
        title: "No country selected",
        description: "Please select a country before saving pricing",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const packageToSave: VisaPackage = {
        id: packageData?.id,
        country_id: selectedCountryId,
        name: formData.name || 'Visa Package',
        government_fee: parseFloat(formData.government_fee) || 0,
        service_fee: parseFloat(formData.service_fee) || 0,
        processing_days: parseInt(formData.processing_days) || 15,
        is_active: true  // Add is_active field
      };
      
      const country = countries.find(c => c.id === selectedCountryId);
      const countryName = country?.name || "country";
      
      console.log('Saving package with data:', packageToSave);
      
      const result = await saveVisaPackage(packageToSave);
      console.log('Save result:', result);
      
      if (result.success) {
        toast({
          title: "Pricing saved",
          description: `Pricing for ${countryName} has been updated successfully`,
        });
        
        await fetchPricingData();
        
        activeQueryClient.invalidateQueries({ queryKey: ['adminCountries'] });
        activeQueryClient.invalidateQueries({ queryKey: ['countryDetail'] });
        activeQueryClient.invalidateQueries({ queryKey: ['countries'] });
        activeQueryClient.invalidateQueries({ queryKey: ['countryVisaPackage'] });
        activeQueryClient.invalidateQueries({ queryKey: ['popularDestinations'] });
        if (selectedCountryId) {
          activeQueryClient.invalidateQueries({ queryKey: ['country', selectedCountryId] });
          activeQueryClient.invalidateQueries({ queryKey: ['countryDetail', selectedCountryId] });
        }
      } else {
        setError(result.message);
        toast({
          title: "Error saving pricing",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error in handleSave:", err);
      setError(err.message || "Failed to save pricing data");
      
      toast({
        title: "Error saving pricing",
        description: err.message || "An error occurred while saving pricing data",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleToggleStatus = async (isActive: boolean) => {
    if (!selectedCountryId) return;
    
    try {
      const result = await toggleVisaPackageStatus(selectedCountryId, isActive);
      
      if (result.success) {
        toast({
          title: isActive ? "Country Activated" : "Country Deactivated",
          description: result.message
        });
        
        await fetchPricingData();
        activeQueryClient.invalidateQueries({ queryKey: ['adminCountries'] });
      } else {
        toast({
          title: "Status Update Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive"
      });
    }
  };
  
  const getPackageStatus = () => {
    if (!selectedCountryId) return null;
    
    if (loading) return <Badge variant="outline" className="bg-gray-100">Loading...</Badge>;
    
    if (packageData) {
      const hasPricing = packageData.id && (packageData.government_fee > 0 || packageData.service_fee > 0);
      const isNewPackage = !packageData.id;
      
      if (hasPricing) {
        return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
      } else if (isNewPackage) {
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">New - Not Saved</Badge>;
      } else {
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Inactive</Badge>;
      }
    }
    
    return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Not configured</Badge>;
  };
  
  const selectedCountry = countries.find(c => c.id === selectedCountryId);
  const isNewPackage = packageData && !packageData.id;
  const buttonText = isNewPackage ? 'Create Package' : 'Save Pricing';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Pricing</CardTitle>
      </CardHeader>
      <CardContent>
        <ErrorDisplay error={error} />
        
        <DiagnosticResult diagnosticResult={diagnosticResult} />
        
        <div className="space-y-6">
          <CountrySelector 
            countries={countries}
            selectedCountryId={selectedCountryId}
            onSelectCountry={handleSelectCountry}
          />
          
          {selectedCountryId && (
            <div className="space-y-4 border p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium">
                    Pricing for {selectedCountry?.name}
                  </h3>
                  {packageData && (
                    <PackageStatusToggle
                      isActive={packageData.is_active}
                      onToggle={handleToggleStatus}
                    />
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRunDiagnostic}
                    disabled={runningDiagnostic}
                  >
                    {runningDiagnostic ? (
                      <LoadingIndicator size="sm" text="Running..." />
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Run Diagnostic
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {loading ? (
                <LoadingIndicator size="lg" className="py-8" />
              ) : (
                <>
                  <PricingForm 
                    formData={formData}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  
                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-gray-700 font-medium">
                      {getPackageStatus()}
                    </div>
                    
                    <Button 
                      onClick={handleCreateOrUpdate} 
                      disabled={saving}
                      className={isNewPackage ? "bg-blue-600 hover:bg-blue-700" : "bg-teal hover:bg-teal-600"}
                    >
                      {saving ? (
                        <LoadingIndicator size="sm" text="Saving..." />
                      ) : (
                        <>
                          {isNewPackage && <PlusCircle className="mr-2 h-4 w-4" />}
                          {buttonText}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {packageData?.updated_at && (
                    <div className="pt-4 text-sm text-gray-500">
                      <p>Last updated: {new Date(packageData.updated_at || Date.now()).toLocaleString()}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingTierManager;
