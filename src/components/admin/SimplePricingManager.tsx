import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SimplePricingManagerProps {
  countryId: string;
  countryName: string;
  onSaved?: () => void;
}

interface PricingData {
  government_fee: string;
  service_fee: string;
  processing_days: string;
}

const SimplePricingManager: React.FC<SimplePricingManagerProps> = ({
  countryId,
  countryName,
  onSaved
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<PricingData>({
    government_fee: '0',
    service_fee: '0',
    processing_days: '15'
  });
  
  const { toast } = useToast();
  
  // Fetch existing pricing data
  useEffect(() => {
    const fetchPricingData = async () => {
      if (!countryId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching pricing data for country:', countryId);
        
        // Check if visa_packages table exists by trying to query it directly
        try {
          // First try RPC function (most reliable method)
          const { data: rpcData, error: rpcError } = await supabase.rpc('get_country_packages', {
            p_country_id: countryId
          });
          
          if (!rpcError && rpcData && rpcData.length > 0) {
            console.log('Package data loaded via RPC:', rpcData);
            const packageData = rpcData[0];
            setFormData({
              government_fee: packageData.government_fee?.toString() || '0',
              service_fee: packageData.service_fee?.toString() || '0',
              processing_days: packageData.processing_days?.toString() || '15'
            });
            return;
          } else if (rpcError) {
            console.warn('RPC method failed, trying direct query:', rpcError);
          }
        } catch (rpcErr) {
          console.warn('RPC call failed, falling back to direct query:', rpcErr);
        }
        
        // Fall back to direct query if RPC fails
        const { data, error } = await supabase
          .from('visa_packages')
          .select('*')
          .eq('country_id', countryId)
          .single();
          
        if (error) {
          console.warn('Direct query failed:', error.message);
          // No existing pricing data - use defaults
          return;
        } 
        
        if (data) {
          console.log('Package data loaded via direct query:', data);
          setFormData({
            government_fee: data.government_fee?.toString() || '0',
            service_fee: data.service_fee?.toString() || '0',
            processing_days: data.processing_days?.toString() || '15'
          });
        }
      } catch (err: any) {
        console.error('Error fetching pricing data:', err);
        setError(err.message || 'Failed to fetch pricing data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPricingData();
  }, [countryId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    if (!countryId) {
      toast({
        title: "No country selected",
        description: "Please select a country before saving pricing",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Convert form values to numbers
      const governmentFee = parseFloat(formData.government_fee) || 0;
      const serviceFee = parseFloat(formData.service_fee) || 0;
      const processingDays = parseInt(formData.processing_days) || 15;
      
      console.log('Saving package data:', { 
        countryId, 
        governmentFee, 
        serviceFee, 
        processingDays 
      });
      
      // First try direct insert/upsert approach (most reliable)
      try {
        // Check if a package already exists
        const { data: existingPackage } = await supabase
          .from('visa_packages')
          .select('id')
          .eq('country_id', countryId)
          .single();
          
        let result;
        if (existingPackage?.id) {
          // Update existing package
          result = await supabase
            .from('visa_packages')
            .update({
              name: 'Visa Package',
              government_fee: governmentFee,
              service_fee: serviceFee,
              processing_days: processingDays,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingPackage.id);
        } else {
          // Create new package
          result = await supabase
            .from('visa_packages')
            .insert({
              country_id: countryId,
              name: 'Visa Package',
              government_fee: governmentFee,
              service_fee: serviceFee,
              processing_days: processingDays
            });
        }
        
        if (result.error) throw result.error;
        
        // Verify the data was saved by fetching it back
        const { data: verifyData, error: verifyError } = await supabase
          .from('visa_packages')
          .select('*')
          .eq('country_id', countryId)
          .single();
          
        if (verifyError || !verifyData) {
          throw new Error('Failed to verify saved data');
        }
        
        console.log('Verified saved data:', verifyData);
        
        // Update the form with the verified data
        setFormData({
          government_fee: verifyData.government_fee?.toString() || '0',
          service_fee: verifyData.service_fee?.toString() || '0',
          processing_days: verifyData.processing_days?.toString() || '15'
        });
        
        // Show success message
        setSuccess(`Pricing for ${countryName} has been updated successfully`);
        toast({
          title: "Pricing saved",
          description: `Pricing for ${countryName} has been updated successfully`,
        });
        
        // Call the onSaved callback if provided
        if (onSaved) {
          onSaved();
        }
        
        return; // Early return on success
      } catch (directErr) {
        console.warn('Direct database update failed, trying RPC function:', directErr);
      }
      
      // Try RPC function as fallback
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'save_visa_package',
        {
          p_country_id: countryId,
          p_name: 'Visa Package',
          p_government_fee: governmentFee,
          p_service_fee: serviceFee,
          p_processing_days: processingDays
        }
      );
      
      if (rpcError) throw rpcError;
      
      console.log('Package saved with RPC:', rpcResult);
      
      // Verify the data was saved by fetching it back
      const { data: verifyData, error: verifyError } = await supabase
        .from('visa_packages')
        .select('*')
        .eq('country_id', countryId)
        .single();
        
      if (verifyError || !verifyData) {
        throw new Error('Failed to verify saved data');
      }
      
      console.log('Verified saved data:', verifyData);
      
      // Update the form with the verified data
      setFormData({
        government_fee: verifyData.government_fee?.toString() || '0',
        service_fee: verifyData.service_fee?.toString() || '0',
        processing_days: verifyData.processing_days?.toString() || '15'
      });
      
      // Show success message
      setSuccess(`Pricing for ${countryName} has been updated successfully`);
      toast({
        title: "Pricing saved",
        description: `Pricing for ${countryName} has been updated successfully`,
      });
      
      // Call the onSaved callback if provided
      if (onSaved) {
        onSaved();
      }
      
    } catch (err: any) {
      console.error("Error saving pricing:", err);
      setError(err.message || "An error occurred while saving pricing");
      
      toast({
        title: "Error saving pricing",
        description: err.message || "An error occurred while saving pricing",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Calculate total price
  const totalPrice = parseFloat(formData.government_fee) + parseFloat(formData.service_fee) || 0;
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">
          Pricing for {countryName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700 font-medium">
                Total Price: ₹{totalPrice.toFixed(2)}
              </div>
              
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Pricing
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimplePricingManager;
