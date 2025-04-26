
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getCountryVisaPackage, saveVisaPackage, runDiagnostic } from '@/services/visaPackageService';
import { VisaPackage } from '@/types/visaPackage';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { useApiMutation } from '@/hooks/useApiMutations';

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
        console.log("No package data found for this country");
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
      
      // If diagnostic was successful, refresh the data
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
  
  const handleSave = async () => {
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
      // Make sure to parse the numerical values correctly
      const packageToSave: VisaPackage = {
        id: packageData?.id,
        country_id: selectedCountryId,
        name: formData.name || 'Visa Package',
        government_fee: parseFloat(formData.government_fee) || 0,
        service_fee: parseFloat(formData.service_fee) || 0,
        processing_days: parseInt(formData.processing_days) || 15
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
        
        // Refetch the data to update our UI
        await fetchPricingData();
        
        // Invalidate all related queries to ensure data consistency
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
  
  const getPackageStatus = () => {
    if (!selectedCountryId) return null;
    
    if (loading) return <Badge variant="outline" className="bg-gray-100">Loading...</Badge>;
    
    if (packageData) {
      const hasPricing = packageData.government_fee > 0 || packageData.service_fee > 0;
      return hasPricing ? 
        <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge> : 
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Inactive</Badge>;
    }
    
    return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Not configured</Badge>;
  };
  
  const selectedCountry = countries.find(c => c.id === selectedCountryId);
  const totalPrice = 
    (parseFloat(formData.government_fee) || 0) + 
    (parseFloat(formData.service_fee) || 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Pricing</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {diagnosticResult && (
          <Alert className="mb-4 bg-slate-50">
            <AlertTitle>Diagnostic Results</AlertTitle>
            <AlertDescription>
              <div className="text-sm mt-2 space-y-1">
                <div><strong>Success:</strong> {diagnosticResult.success ? 'Yes' : 'No'}</div>
                {diagnosticResult.results && (
                  <>
                    <div>
                      <strong>RPC Function:</strong> {diagnosticResult.results.rpc.success ? 'Working' : 'Failed'}
                      {diagnosticResult.results.rpc.error && <div className="text-xs text-red-500">{diagnosticResult.results.rpc.error}</div>}
                    </div>
                    <div>
                      <strong>Direct Table Access:</strong> {diagnosticResult.results.table.success ? 'Working' : 'Failed'}
                      {diagnosticResult.results.table.error && <div className="text-xs text-red-500">{diagnosticResult.results.table.error}</div>}
                    </div>
                  </>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Select Country</Label>
            <Select value={selectedCountryId || ''} onValueChange={handleSelectCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedCountryId && (
            <div className="space-y-4 border p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium">
                    Pricing for {selectedCountry?.name}
                  </h3>
                  {getPackageStatus()}
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
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
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
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="government_fee">Government Fee (₹)</Label>
                      <Input
                        id="government_fee"
                        name="government_fee"
                        type="number"
                        value={formData.government_fee}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="service_fee">Service Fee (₹)</Label>
                      <Input
                        id="service_fee"
                        name="service_fee"
                        type="number"
                        value={formData.service_fee}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="processing_days">Processing Days</Label>
                      <Input
                        id="processing_days"
                        name="processing_days"
                        type="number"
                        value={formData.processing_days}
                        onChange={handleInputChange}
                        placeholder="15"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-gray-700 font-medium">
                      Total Price: ₹{totalPrice.toFixed(2)}
                    </div>
                    
                    <Button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="bg-teal hover:bg-teal-600"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : 'Save Pricing'}
                    </Button>
                  </div>
                  
                  {packageData && (
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
