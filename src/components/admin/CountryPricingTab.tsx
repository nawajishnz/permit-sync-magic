
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import SimplePricingManager from './SimplePricingManager';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { fixVisaPackagesSchema } from '@/integrations/supabase/fix-schema';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CountryPricingTabProps {
  countries: any[];
}

const CountryPricingTab: React.FC<CountryPricingTabProps> = ({ countries }) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh
  const [countryPackages, setCountryPackages] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fix database schema on component mount
  useEffect(() => {
    const runSchemaFix = async () => {
      try {
        const result = await fixVisaPackagesSchema();
        console.log('Schema fix result:', result);
        if (!result.success) {
          console.warn('Schema fix warning:', result.message);
        }
      } catch (error) {
        console.error('Error running schema fix:', error);
      }
    };

    runSchemaFix();
  }, []);
  
  // Fetch packages when country changes
  useEffect(() => {
    if (!selectedCountryId) return;
    
    const fetchPackages = async () => {
      try {
        console.log('Fetching packages for:', selectedCountryId);
        const { data, error } = await supabase
          .from('visa_packages')
          .select('*')
          .eq('country_id', selectedCountryId);
          
        if (error) throw error;
        console.log('Fetched packages:', data);
        setCountryPackages(data && data.length > 0 ? data[0] : null);
      } catch (err) {
        console.error('Error fetching packages:', err);
      }
    };
    
    fetchPackages();
  }, [selectedCountryId, refreshKey]);
  
  const handleCountryChange = (value: string) => {
    setSelectedCountryId(value);
  };
  
  const handleRefreshData = () => {
    if (!selectedCountryId) return;
    
    // Force refresh by incrementing key and invalidating queries
    setRefreshKey(prev => prev + 1);
    queryClient.invalidateQueries({ queryKey: ['countries'] });
    queryClient.invalidateQueries({ queryKey: ['country', selectedCountryId] });
    queryClient.invalidateQueries({ queryKey: ['countryDetail', selectedCountryId] });
    
    toast({
      title: "Refreshing data",
      description: "Fetching the latest pricing information",
    });
  };
  
  const handlePricingSaved = () => {
    // Invalidate ALL relevant queries
    queryClient.invalidateQueries({ queryKey: ['countries'] });
    queryClient.invalidateQueries({ queryKey: ['country', selectedCountryId] });
    queryClient.invalidateQueries({ queryKey: ['countryDetail', selectedCountryId] });
    
    // Force refresh the pricing manager component and fetch packages again
    setRefreshKey(prev => prev + 1);
    
    // Extra cache invalidation for good measure
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['countryDetail', selectedCountryId] });
    }, 1000);
    
    toast({
      title: "Pricing Updated",
      description: "The pricing information has been successfully updated.",
    });
  };
  
  const selectedCountry = countries.find(c => c.id === selectedCountryId);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Country Pricing (₹)</CardTitle>
          {selectedCountryId && (
            <Button variant="outline" size="sm" onClick={handleRefreshData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Select Country</Label>
              <Select value={selectedCountryId} onValueChange={handleCountryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedCountryId && selectedCountry && (
              <div key={`pricing-manager-${selectedCountryId}-${refreshKey}`}>
                <SimplePricingManager
                  countryId={selectedCountryId}
                  countryName={selectedCountry.name}
                  existingPackage={countryPackages}
                  onSaved={handlePricingSaved}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CountryPricingTab;
