
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [error, setError] = useState<string | null>(null);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<any | null>(null);
  const [formData, setFormData] = useState<PricingFormData>({
    government_fee: '',
    service_fee: '',
    processing_days: ''
  });
  
  const { toast } = useToast();
  const localQueryClient = useQueryClient();
  const activeQueryClient = propQueryClient || localQueryClient;
  
  // Check the database schema to see which columns are available
  const checkDatabaseSchema = async () => {
    try {
      const { data, error } = await supabase.rpc('get_table_info', { p_table_name: 'visa_packages' });
      
      if (error) {
        console.error("Error checking schema:", error);
        setSchemaError("Could not verify database schema: " + error.message);
        return false;
      }
      
      console.log("Table schema information:", data);
      
      // Check if the required columns exist
      const hasGovernmentFee = data?.some((col: any) => col.column_name === 'government_fee');
      const hasServiceFee = data?.some((col: any) => col.column_name === 'service_fee');
      const hasProcessingDays = data?.some((col: any) => col.column_name === 'processing_days');
      
      if (!hasGovernmentFee || !hasServiceFee || !hasProcessingDays) {
        setSchemaError(
          "Your database schema is missing required columns. Please run the migration script: " +
          "supabase/fix-database-schema.sql"
        );
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Error in schema check:", err);
      setSchemaError("Failed to check database schema");
      return false;
    }
  };
  
  // Fetch pricing data for the selected country
  const fetchPricingData = async () => {
    if (!selectedCountryId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First check if the schema is valid
      const isSchemaValid = await checkDatabaseSchema();
      if (!isSchemaValid) {
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
          government_fee: '',
          service_fee: '',
          processing_days: ''
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
      
      // Try multiple approaches to save visa package data
      let saveSucceeded = false;
      let errorMessages = [];
      
      // Approach 1: Using the JsonB version of the function
      try {
        console.log("Attempting to use save_visa_package RPC function with JSON parameters");
        const jsonParams = {
          p_country_id: selectedCountryId,
          p_name: 'Visa Package',
          p_government_fee: government_fee,
          p_service_fee: service_fee,
          p_processing_days: processing_days
        };
        
        const { data: rpcJsonResult, error: rpcJsonError } = await supabase.rpc(
          'save_visa_package', 
          jsonParams
        );
        
        if (rpcJsonError) {
          console.error("RPC JSON approach failed:", rpcJsonError);
          errorMessages.push(`JSON params approach: ${rpcJsonError.message}`);
        } else {
          console.log("RPC function with JSON params succeeded:", rpcJsonResult);
          saveSucceeded = true;
        }
      } catch (rpcJsonErr: any) {
        console.warn("RPC JSON approach threw an exception:", rpcJsonErr);
        errorMessages.push(`JSON exception: ${rpcJsonErr.message}`);
      }
      
      // If JSON approach failed, try with named parameters
      if (!saveSucceeded) {
        try {
          console.log("Attempting to use save_visa_package RPC function with named parameters");
          const { data: rpcResult, error: rpcError } = await supabase.rpc(
            'save_visa_package',
            {
              p_country_id: selectedCountryId,
              p_name: 'Visa Package',
              p_government_fee: government_fee,
              p_service_fee: service_fee,
              p_processing_days: processing_days
            }
          );
          
          if (rpcError) {
            console.error("RPC named params approach failed:", rpcError);
            errorMessages.push(`Named params approach: ${rpcError.message}`);
          } else {
            console.log("RPC function with named params succeeded:", rpcResult);
            saveSucceeded = true;
          }
        } catch (rpcErr: any) {
          console.warn("RPC named params approach threw an exception:", rpcErr);
          errorMessages.push(`Named params exception: ${rpcErr.message}`);
        }
      }
      
      // If named parameters failed, try with positional parameters
      if (!saveSucceeded) {
        try {
          console.log("Attempting to use save_visa_package RPC function with positional arguments");
          const { data: rpcResult, error: rpcError } = await supabase.rpc(
            'save_visa_package',
            [selectedCountryId, 'Visa Package', government_fee, service_fee, processing_days]
          );
          
          if (rpcError) {
            console.error("RPC positional params approach failed:", rpcError);
            errorMessages.push(`Positional params approach: ${rpcError.message}`);
          } else {
            console.log("RPC function with positional params succeeded:", rpcResult);
            saveSucceeded = true;
          }
        } catch (rpcErr: any) {
          console.warn("RPC positional params approach threw an exception:", rpcErr);
          errorMessages.push(`Positional params exception: ${rpcErr.message}`);
        }
      }
      
      // If all RPC approaches failed, fall back to traditional UPSERT
      if (!saveSucceeded) {
        console.log("All RPC approaches failed, falling back to traditional UPSERT");
        
        try {
          if (packageData?.id) {
            // Update existing package
            const { error } = await supabase
              .from('visa_packages')
              .update({
                government_fee,
                service_fee,
                processing_days
              })
              .eq('id', packageData.id);
              
            if (error) {
              console.error("Update approach failed:", error);
              errorMessages.push(`Update approach: ${error.message}`);
              throw error;
            }
            
            saveSucceeded = true;
          } else {
            // Create new package
            const { error } = await supabase
              .from('visa_packages')
              .insert({
                country_id: selectedCountryId,
                name: 'Visa Package',
                government_fee,
                service_fee,
                processing_days
              });
              
            if (error) {
              console.error("Insert approach failed:", error);
              errorMessages.push(`Insert approach: ${error.message}`);
              throw error;
            }
            
            saveSucceeded = true;
          }
        } catch (dbErr: any) {
          console.error("Database fallback approach failed:", dbErr);
          errorMessages.push(`Database fallback: ${dbErr.message}`);
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
        fetchPricingData();
      } else {
        // All approaches failed
        throw new Error(`Failed to save pricing data. Please run the SQL fix script.\n\nErrors: ${errorMessages.join(', ')}`);
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
            <AlertDescription>{schemaError}</AlertDescription>
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
                      {packageData.total_price !== undefined && (
                        <p>Total Price: ${packageData.total_price}</p>
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
