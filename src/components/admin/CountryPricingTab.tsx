
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
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface CountryPricingTabProps {
  countries: any[];
}

const CountryPricingTab: React.FC<CountryPricingTabProps> = ({ countries }) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh
  const [countryPackages, setCountryPackages] = useState<any>(null);
  const [isFixingSchema, setIsFixingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fix database schema on component mount
  useEffect(() => {
    const runSchemaFix = async () => {
      setIsFixingSchema(true);
      setSchemaError(null);
      
      try {
        const result = await fixVisaPackagesSchema();
        console.log('Schema fix result:', result);
        
        if (!result.success) {
          console.warn('Schema fix warning:', result.message);
          setSchemaError(result.message);
        }
      } catch (error: any) {
        console.error('Error running schema fix:', error);
        setSchemaError(error.message || 'Unknown error fixing schema');
      } finally {
        setIsFixingSchema(false);
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
          
        if (error) {
          console.error('Error fetching packages:', error);
          // Try to fix schema issues
          await fixVisaPackagesSchema();
          // Retry the fetch
          const { data: retryData, error: retryError } = await supabase
            .from('visa_packages')
            .select('*')
            .eq('country_id', selectedCountryId);
            
          if (retryError) throw retryError;
          console.log('Fetched packages on retry:', retryData);
          setCountryPackages(retryData && retryData.length > 0 ? retryData[0] : null);
          return;
        }
        
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
  
  const handleRefreshData = async () => {
    if (!selectedCountryId) return;
    
    setIsFixingSchema(true);
    
    try {
      // Try to fix schema issues
      const result = await fixVisaPackagesSchema();
      console.log('Schema fix result on refresh:', result);
      
      // Force refresh by incrementing key and invalidating queries
      setRefreshKey(prev => prev + 1);
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
      queryClient.invalidateQueries({ queryKey: ['countryDetail'] });
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['countryVisaPackage'] });
      queryClient.invalidateQueries({ queryKey: ['popularDestinations'] });
      
      if (selectedCountryId) {
        queryClient.invalidateQueries({ queryKey: ['country', selectedCountryId] });
        queryClient.invalidateQueries({ queryKey: ['countryDetail', selectedCountryId] });
        queryClient.invalidateQueries({ queryKey: ['countryVisaPackage', selectedCountryId] });
      }
      
      toast({
        title: "Data refreshed",
        description: "Pricing data has been refreshed",
      });
    } catch (error: any) {
      toast({
        title: "Error refreshing data",
        description: error.message || "An error occurred while refreshing data",
        variant: "destructive",
      });
    } finally {
      setIsFixingSchema(false);
    }
  };
  
  const handleSaved = () => {
    // Refresh the packages list and invalidate queries
    setRefreshKey(prev => prev + 1);
    
    // Invalidate all relevant queries
    if (selectedCountryId) {
      queryClient.invalidateQueries({ queryKey: ['country', selectedCountryId] });
      queryClient.invalidateQueries({ queryKey: ['countryDetail', selectedCountryId] });
      queryClient.invalidateQueries({ queryKey: ['countryVisaPackage', selectedCountryId] });
    }
    
    queryClient.invalidateQueries({ queryKey: ['adminCountries'] });
    queryClient.invalidateQueries({ queryKey: ['countryDetail'] });
    queryClient.invalidateQueries({ queryKey: ['countries'] });
    queryClient.invalidateQueries({ queryKey: ['popularDestinations'] });
  };
  
  const selectedCountry = countries.find(c => c.id === selectedCountryId);
  
  return (
    <div className="space-y-6">
      {schemaError && (
        <Alert variant="default" className="mb-4 border-amber-300 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Schema issue detected</AlertTitle>
          <AlertDescription>{schemaError}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Country Pricing</h2>
        <Button
          variant="outline"
          onClick={handleRefreshData}
          disabled={isFixingSchema}
          className="text-sm"
        >
          {isFixingSchema ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </>
          )}
        </Button>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="country-select">Select a Country</Label>
        <Select value={selectedCountryId} onValueChange={handleCountryChange}>
          <SelectTrigger id="country-select" className="w-full md:w-1/2">
            <SelectValue placeholder="Choose a country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map(country => (
              <SelectItem key={country.id} value={country.id}>
                {country.flag} {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedCountryId && selectedCountry && (
        <SimplePricingManager
          key={`${selectedCountryId}-${refreshKey}`}
          countryId={selectedCountryId}
          countryName={selectedCountry.name}
          existingPackage={countryPackages}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default CountryPricingTab;
