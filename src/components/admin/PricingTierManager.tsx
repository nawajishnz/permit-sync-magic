
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
          "supabase/fix-visa-packages.sql"
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
        console.log("Attempting to use save_visa_package with JSON body");
        
        // The jsonb version expects a single object with these keys
        const jsonBody = {
          country_id: selectedCountryId,
          name: 'Visa Package',
          government_fee,
          service_fee,
          processing_days
        };
        
        const { data: jsonResult, error: jsonError } = await supabase.rpc(
          'save_visa_package',
          jsonBody
        );
        
        if (jsonError) {
          console.error("JSON body approach failed:", jsonError);
          errorMessages.push(`JSON body: ${jsonError.message}`);
        } else {
          console.log("JSON body approach succeeded:", jsonResult);
          saveSucceeded = true;
        }
      } catch (jsonErr: any) {
        console.warn("JSON body approach threw exception:", jsonErr);
        errorMessages.push(`JSON exception: ${jsonErr.message}`);
      }
      
      // If JSON body approach failed, try with named parameters
      if (!saveSucceeded) {
        try {
          console.log("Attempting to use save_visa_package with named parameters");
          
          const { data: namedResult, error: namedError } = await supabase.rpc(
            'save_visa_package',
            {
              p_country_id: selectedCountryId,
              p_name: 'Visa Package',
              p_government_fee: government_fee,
              p_service_fee: service_fee,
              p_processing_days: processing_days
            }
          );
          
          if (namedError) {
            console.error("Named parameters approach failed:", namedError);
            errorMessages.push(`Named params: ${namedError.message}`);
          } else {
            console.log("Named parameters approach succeeded:", namedResult);
            saveSucceeded = true;
          }
        } catch (namedErr: any) {
          console.warn("Named parameters approach threw exception:", namedErr);
          errorMessages.push(`Named params exception: ${namedErr.message}`);
        }
      }
      
      // If previous approaches failed, try direct database update/insert
      if (!saveSucceeded) {
        try {
          console.log("Attempting direct database operation");
          
          if (packageData?.id) {
            // Update existing package
            const { data: updateData, error: updateError } = await supabase
              .from('visa_packages')
              .update({
                government_fee,
                service_fee,
                processing_days,
                updated_at: new Date().toISOString()
              })
              .eq('id', packageData.id)
              .select()
              .single();
              
            if (updateError) {
              console.error("Direct update failed:", updateError);
              errorMessages.push(`Update error: ${updateError.message}`);
            } else {
              console.log("Direct update succeeded:", updateData);
              setPackageData(updateData);
              saveSucceeded = true;
            }
          } else {
            // Insert new package
            const { data: insertData, error: insertError } = await supabase
              .from('visa_packages')
              .insert({
                country_id: selectedCountryId,
                name: 'Visa Package',
                government_fee,
                service_fee,
                processing_days
              })
              .select()
              .single();
              
            if (insertError) {
              console.error("Direct insert failed:", insertError);
              errorMessages.push(`Insert error: ${insertError.message}`);
            } else {
              console.log("Direct insert succeeded:", insertData);
              setPackageData(insertData);
              saveSucceeded = true;
            }
          }
        } catch (dbErr: any) {
          console.error("Direct database approach threw exception:", dbErr);
          errorMessages.push(`DB exception: ${dbErr.message}`);
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
        const detailedError = `Failed to save pricing data. Errors: ${errorMessages.join(', ')}`;
        console.error(detailedError);
        setError(detailedError);
        
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
