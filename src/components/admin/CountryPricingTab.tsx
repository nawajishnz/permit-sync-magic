
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import SimplePricingManager from './SimplePricingManager';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { fixVisaPackagesSchema } from '@/integrations/supabase/fix-schema';
import { supabase } from '@/lib/supabase'; // Using from lib
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import HelpOverlay from './HelpOverlay';
import { checkDatabaseConnection } from '@/services/visaPackageService';

interface CountryPricingTabProps {
  countries: any[];
}

const CountryPricingTab: React.FC<CountryPricingTabProps> = ({ countries }) => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh
  const [countryPackages, setCountryPackages] = useState<any>(null);
  const [isFixingSchema, setIsFixingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fix database schema on component mount
  useEffect(() => {
    const runSchemaFix = async () => {
      setIsFixingSchema(true);
      setSchemaError(null);
      
      try {
        // First check database connection
        const connectionCheck = await checkDatabaseConnection();
        if (!connectionCheck.success) {
          console.warn('Database connection issue detected:', connectionCheck.message);
          setSchemaError(`Database connection issue: ${connectionCheck.message}`);
          return;
        }
        
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
  
  // Debug countries prop
  useEffect(() => {
    console.log('Countries in CountryPricingTab:', countries);
  }, [countries]);
  
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
        <div className="flex items-center">
          <h2 className="text-xl font-bold">Country Pricing</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="ml-2"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Help</span>
          </Button>
        </div>
        
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
            {countries && countries.length > 0 ? (
              countries.map(country => (
                <SelectItem key={country.id} value={country.id}>
                  {country.flag} {country.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-countries" disabled>No countries available</SelectItem>
            )}
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
      
      {/* Help overlay */}
      <HelpOverlay 
        open={showHelp}
        onClose={() => setShowHelp(false)}
        topic="visa-packages"
      />
    </div>
  );
};

export default CountryPricingTab;
