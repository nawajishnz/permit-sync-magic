
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCountryData } from '@/hooks/useCountryData';
import { useToast } from '@/hooks/use-toast';
import CountryDataFallback from '@/components/country/CountryDataFallback';
import CountryNotFound from '@/components/country/CountryNotFound';
import { fixSchemaIfNeeded } from '@/integrations/supabase/fix-schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  ArrowLeft, 
  MapPin, 
  Globe, 
  Calendar, 
  Clock 
} from 'lucide-react';
import PricingTier from '@/components/country/PricingTier';
import ProcessStep from '@/components/country/ProcessStep';
import FAQSection from '@/components/country/FAQSection';
import EmbassySection from '@/components/country/EmbassySection';
import DocumentChecklist from '@/components/country/DocumentChecklist';

const CountryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Run schema fix on page load
  useEffect(() => {
    fixSchemaIfNeeded().catch(console.error);
  }, []);

  // Periodic data refresh
  useEffect(() => {
    if (!id) return;
    
    // Initial data refresh
    queryClient.invalidateQueries({ queryKey: ['countryDetail', id] });
    
    // Set up interval to periodically refresh data (every 15 seconds)
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['countryDetail', id] });
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, [id, queryClient]);
  
  // Use our enhanced useCountryData hook with staleTime: 0 to always fetch fresh data
  const { data: country, isLoading, error, refetch } = useCountryData(id, { 
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  // Handle refresh button click with better UX
  const handleRefresh = async () => {
    if (!id) return;
    
    setIsRefreshing(true);
    
    try {
      // Run schema fix first to ensure table structures are correct
      await fixSchemaIfNeeded();
      
      // Force query invalidation and refetch
      await queryClient.invalidateQueries({ queryKey: ['countryDetail', id] });
      await refetch();
      
      toast({
        title: "Data refreshed",
        description: "Country information has been updated",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh failed",
        description: "Could not update country information",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle loading states
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle error state with our fallback component
  if (error) {
    return <CountryDataFallback countryId={id || ''} error={error as Error} onRetry={refetch} />;
  }

  // Handle not found
  if (!country) {
    return <CountryNotFound onRetry={refetch} />;
  }

  // Debug - log the package details
  console.log('Country package details:', country.packageDetails);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">{country.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Link to="/" className="flex items-center text-blue-500 hover:text-blue-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </CardHeader>
        <CardContent className="py-4">
          <div className="relative">
            <img
              src={country.banner}
              alt={country.name}
              className="w-full rounded-md aspect-video object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge className="uppercase text-xs">{country.entry_type}</Badge>
            </div>
          </div>
          <div className="my-4">
            <CardDescription className="text-gray-600">{country.description}</CardDescription>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{country.name}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Globe className="h-4 w-4 mr-2" />
              <span>Validity: {country.validity}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Length of Stay: {country.length_of_stay}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="h-4 w-4 mr-2" />
              <span>Processing Time: {country.packageDetails?.processing_days || country.processing_time || 'Not specified'} days</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Visa Pricing</h2>
            
            {country.packageDetails ? (
              <PricingTier
                name={country.packageDetails.name}
                price={
                  country.packageDetails.total_price || 
                  country.packageDetails.price || 
                  (country.packageDetails.government_fee || 0) + (country.packageDetails.service_fee || 0)
                }
                governmentFee={country.packageDetails.government_fee || 0}
                serviceFee={country.packageDetails.service_fee || 0}
                processingDays={country.packageDetails.processing_days || 15}
              />
            ) : (
              <div className="p-6 bg-gray-50 rounded-md text-center">
                <p className="text-gray-500 mb-2">No pricing information available</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Pricing'}
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <ProcessStep steps={country.processing_steps} />

          <Separator className="my-4" />

          <FAQSection faq={country.faq} />

          <Separator className="my-4" />

          <EmbassySection embassyDetails={country.embassy_details} />

          <Separator className="my-4" />

          <DocumentChecklist requirementsDescription={country.requirements_description} documents={country.documents} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CountryDetails;
