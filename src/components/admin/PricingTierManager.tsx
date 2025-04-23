
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2, Database } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { refreshSchemaCache, runVisaPackagesDiagnostic } from '@/integrations/supabase/refresh-schema';

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
}

const PricingTierManager: React.FC<PricingTierManagerProps> = ({ 
  countries, 
  selectedCountryId, 
  onSelectCountry,
  queryClient: propQueryClient
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fixingSchema, setFixingSchema] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<any | null>(null);
  const [formData, setFormData] = useState<PricingFormData>({
    government_fee: '',
    service_fee: '',
    processing_days: ''
  });
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  
  const { toast } = useToast();
  const localQueryClient = useQueryClient();
  const activeQueryClient = propQueryClient || localQueryClient;
  
  // Check if the visa_packages table exists and has the required columns
  const checkTableStructure = async () => {
    try {
      console.log('Checking visa_packages table structure...');
      
      // First try with the get_table_info function if it exists
      try {
        const { data: tableInfo, error: fnError } = await supabase.rpc('get_table_info', { p_table_name: 'visa_packages' });
        
        if (fnError) {
          console.warn('get_table_info function not available:', fnError.message);
          // Continue to fallback method
        } else if (tableInfo) {
          console.log('Table info retrieved via function:', tableInfo);
          // Check if required columns exist
          const columns = tableInfo.map((col: any) => col.column_name);
          const hasRequiredColumns = 
            columns.includes('government_fee') && 
            columns.includes('service_fee') && 
            columns.includes('processing_days');
            
          if (!hasRequiredColumns) {
            setSchemaError(
              "The visa_packages table is missing required columns. Please run the SQL script: supabase/fix-visa-packages.sql"
            );
          }
          return hasRequiredColumns;
        }
      } catch (fnError) {
        console.warn('Error using get_table_info function:', fnError);
        // Continue to fallback method
      }
      
      // Fallback: Try to select from the table directly
      const { data: sampleData, error: tableError } = await supabase
        .from('visa_packages')
        .select('id, government_fee, service_fee, processing_days')
        .limit(1);
        
      if (tableError) {
        console.error('Error checking table structure:', tableError);
        
        if (tableError.message.includes('column') && tableError.message.includes('does not exist')) {
          setSchemaError(
            "The visa_packages table is missing required columns. Please run the SQL script: supabase/fix-visa-packages.sql"
          );
          return false;
        }
        
        if (tableError.message.includes('relation') && tableError.message.includes('does not exist')) {
          setSchemaError(
            "The visa_packages table does not exist. Please run the SQL script: supabase/fix-visa-packages.sql"
          );
          return false;
        }
      }
      
      // If we got data or no error about missing columns, assume the structure is okay
      return true;
      
    } catch (err: any) {
      console.error('Error in schema check:', err);
      setSchemaError(`Database schema check failed: ${err.message}`);
      return false;
    }
  };
  
  // Function to fix schema issues
  const handleFixSchema = async () => {
    setFixingSchema(true);
    setError(null);
    setSchemaError(null);
    
    try {
      toast({
        title: "Fixing database schema",
        description: "Running diagnostics and applying fixes...",
      });
      
      // Run a full diagnostic if we have a country selected
      if (selectedCountryId) {
        const result = await runVisaPackagesDiagnostic(selectedCountryId);
        setDiagnosticResult(result);
        
        if (result.success) {
          setSchemaError(null);
          toast({
            title: "Schema fix successful",
            description: "The database schema has been updated successfully.",
          });
          
          // Refresh the data
          await fetchPricingData();
        } else {
          setSchemaError(
            "Automatic schema fix was not successful. Please run the SQL script manually: supabase/fix-visa-packages.sql"
          );
          toast({
            title: "Schema fix incomplete",
            description: "Some issues could not be fixed automatically.",
            variant: "destructive",
          });
        }
      } else {
        // Just run the schema refresh
        const result = await refreshSchemaCache();
        
        if (result.success) {
          setSchemaError(null);
          toast({
            title: "Schema refresh successful",
            description: "The database schema cache has been refreshed.",
          });
        } else {
          setSchemaError(
            "Schema refresh was not successful. Please select a country to run a full diagnostic."
          );
        }
      }
    } catch (err: any) {
      console.error("Error fixing schema:", err);
      setError(`Error fixing schema: ${err.message}`);
      
      toast({
        title: "Error fixing schema",
        description: err.message || "An error occurred while fixing the schema",
        variant: "destructive",
      });
    } finally {
      setFixingSchema(false);
    }
  };
  
  // Fetch pricing data for the selected country
  const fetchPricingData = async () => {
    if (!selectedCountryId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First check if the table structure is valid
      const isTableValid = await checkTableStructure();
      if (!isTableValid) {
        setLoading(false);
        return;
      }
      
      console.log(`Fetching pricing data for country ID: ${selectedCountryId}`);
      
      // Try to get the package data
      const { data: packageData, error: packageError } = await supabase
        .from('visa_packages')
        .select('*')
        .eq('country_id', selectedCountryId)
        .maybeSingle();
      
      if (packageError) {
        console.error("Error fetching package data:", packageError);
        setError(packageError.message);
        setPackageData(null);
        setFormData({
          government_fee: '',
          service_fee: '',
          processing_days: ''
        });
      } else if (packageData) {
        console.log("Found package data:", packageData);
        setPackageData(packageData);
        
        // Check which fields are available in the response
        setFormData({
          government_fee: packageData.government_fee !== undefined ? String(packageData.government_fee) : '0',
          service_fee: packageData.service_fee !== undefined ? String(packageData.service_fee) : '0',
          processing_days: packageData.processing_days !== undefined ? String(packageData.processing_days) : '15'
        });
      } else {
        console.log("No package data found for this country");
        setPackageData(null);
        setFormData({
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
      // Convert form values to appropriate types
      const government_fee = parseFloat(formData.government_fee) || 0;
      const service_fee = parseFloat(formData.service_fee) || 0;
      const processing_days = parseInt(formData.processing_days) || 15;
      
      // Get the selected country name for the success message
      const country = countries.find(c => c.id === selectedCountryId);
      const countryName = country?.name || "country";
      
      // Try direct database update/insert first as it's most reliable
      let saveSucceeded = false;
      let lastError = null;
      
      // Try multiple approaches
      
      // 1. Try direct database operation (most reliable)
      try {
        console.log("Attempting direct database operation");
        
        if (packageData?.id) {
          // Update existing package
          const { data, error } = await supabase
            .from('visa_packages')
            .update({
              government_fee,
              service_fee,
              processing_days,
              updated_at: new Date().toISOString()
            })
            .eq('id', packageData.id)
            .select();
            
          if (error) {
            console.error("Direct update failed:", error);
            lastError = error;
          } else {
            console.log("Direct update succeeded:", data);
            setPackageData(data[0]);
            saveSucceeded = true;
          }
        } else {
          // Insert new package
          const { data, error } = await supabase
            .from('visa_packages')
            .insert({
              country_id: selectedCountryId,
              name: 'Visa Package',
              government_fee,
              service_fee,
              processing_days
            })
            .select();
            
          if (error) {
            console.error("Direct insert failed:", error);
            lastError = error;
          } else {
            console.log("Direct insert succeeded:", data);
            setPackageData(data[0]);
            saveSucceeded = true;
          }
        }
      } catch (dbErr: any) {
        console.error("Direct database approach failed:", dbErr);
        lastError = dbErr;
      }
      
      // 2. If direct approach failed, try the save_visa_package function with jsonb parameter
      if (!saveSucceeded) {
        try {
          console.log("Attempting save_visa_package with jsonb parameter");
          
          const jsonBody = {
            country_id: selectedCountryId,
            government_fee,
            service_fee,
            processing_days
          };
          
          const { data, error } = await supabase.rpc('save_visa_package', jsonBody);
          
          if (error) {
            console.error("JSON parameter approach failed:", error);
            lastError = error;
          } else {
            console.log("JSON parameter approach succeeded:", data);
            saveSucceeded = true;
            
            // Refresh the data
            await fetchPricingData();
          }
        } catch (jsonErr: any) {
          console.error("JSON parameter approach failed:", jsonErr);
          lastError = jsonErr;
        }
      }
      
      // 3. If both approaches failed, try with named parameters
      if (!saveSucceeded) {
        try {
          console.log("Attempting save_visa_package with named parameters");
          
          const { data, error } = await supabase.rpc('save_visa_package', {
            p_country_id: selectedCountryId,
            p_name: 'Visa Package',
            p_government_fee: government_fee,
            p_service_fee: service_fee,
            p_processing_days: processing_days
          });
          
          if (error) {
            console.error("Named parameters approach failed:", error);
            lastError = error;
          } else {
            console.log("Named parameters approach succeeded:", data);
            saveSucceeded = true;
            
            // Refresh the data
            await fetchPricingData();
          }
        } catch (namedErr: any) {
          console.error("Named parameters approach failed:", namedErr);
          lastError = namedErr;
        }
      }
      
      // Check if any approach succeeded
      if (saveSucceeded) {
        toast({
          title: "Pricing saved",
          description: `Pricing for ${countryName} has been updated successfully`,
        });
        
        // Refresh the data
        activeQueryClient.invalidateQueries({ queryKey: ['countryDetail'] });
        activeQueryClient.invalidateQueries({ queryKey: ['countries'] });
      } else {
        // All approaches failed
        const errorMessage = lastError?.message || "Unknown error";
        setError(`Failed to save pricing data: ${errorMessage}`);
        
        toast({
          title: "Error saving pricing",
          description: "Please run the SQL fix script in supabase/fix-visa-packages.sql",
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
  
  const selectedCountry = countries.find(c => c.id === selectedCountryId);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Pricing</CardTitle>
      </CardHeader>
      <CardContent>
        {schemaError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Schema Error</AlertTitle>
            <AlertDescription>
              {schemaError}
              <div className="flex items-center gap-2 mt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleFixSchema}
                  disabled={fixingSchema}
                >
                  {fixingSchema ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fixing Schema...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Fix Schema Issues
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.open('/admin/database-setup', '_blank')}
                >
                  Open Database Setup
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {diagnosticResult && (
          <Alert className="mb-4 bg-slate-50">
            <AlertTitle>Diagnostic Results</AlertTitle>
            <AlertDescription>
              <div className="text-sm mt-2 space-y-1">
                <div><strong>Schema Fix:</strong> {diagnosticResult.schemaFix?.success ? 'Successful' : 'Failed'}</div>
                {diagnosticResult.operationsTest && (
                  <div>
                    <strong>Operations Test:</strong> {diagnosticResult.operationsTest?.success ? 'Successful' : 'Failed'}
                    <ul className="ml-4 mt-1 list-disc text-xs">
                      <li>SELECT: {diagnosticResult.operationsTest?.results?.select?.success ? 'OK' : 'Failed'}</li>
                      <li>INSERT: {diagnosticResult.operationsTest?.results?.insert?.success ? 'OK' : diagnosticResult.operationsTest?.results?.insert?.skipped || 'Failed'}</li>
                      <li>UPDATE: {diagnosticResult.operationsTest?.results?.update?.success ? 'OK' : diagnosticResult.operationsTest?.results?.update?.skipped || 'Failed'}</li>
                      <li>RPC: {diagnosticResult.operationsTest?.results?.rpc?.success ? 'OK' : 'Failed'}</li>
                    </ul>
                  </div>
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
              <h3 className="text-lg font-medium">
                Pricing for {selectedCountry?.name}
              </h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="government_fee">Government Fee ($)</Label>
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
                      <Label htmlFor="service_fee">Service Fee ($)</Label>
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
                  
                  <div className="flex justify-end pt-4">
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
                      <p>Last updated: {new Date(packageData.updated_at).toLocaleString()}</p>
                      {(packageData.government_fee !== undefined || packageData.service_fee !== undefined) && (
                        <p>Total Price: ${(Number(packageData.government_fee || 0) + Number(packageData.service_fee || 0)).toFixed(2)}</p>
                      )}
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
