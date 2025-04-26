
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCountryData } from '@/hooks/useCountryData';
import { useToast } from '@/hooks/use-toast';
import CountryDataFallback from '@/components/country/CountryDataFallback';
import CountryNotFound from '@/components/country/CountryNotFound';
import { autoFixSchema, createFallbackPricing } from '@/integrations/supabase/fix-schema';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Globe, MapPin, AlertCircle } from 'lucide-react';
import PricingTier from '@/components/country/PricingTier';
import ProcessStep from '@/components/country/ProcessStep';
import FAQSection from '@/components/country/FAQSection';
import EmbassySection from '@/components/country/EmbassySection';
import DocumentChecklist from '@/components/country/DocumentChecklist';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CountryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Trigger schema fix on page load
  useEffect(() => {
    if (id) {
      autoFixSchema().catch(console.error);
    }
  }, [id]);

  // Add effect to periodically refresh pricing data
  useEffect(() => {
    if (!id) return;
    
    // Initial data refresh
    queryClient.invalidateQueries({ queryKey: ['countryDetail', id] });
    
    // Set up interval to check for updates (every 10 seconds)
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['countryDetail', id] });
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [id, queryClient]);
  
  // Use our enhanced useCountryData hook with staleTime: 0 to always fetch fresh data
  const { data: country, isLoading, error, refetch } = useCountryData(id, { staleTime: 0 });

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

  // Create a fallback package if none exists
  const packageDetails = country.packageDetails || (id ? createFallbackPricing(id) : null);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">{country.name}</CardTitle>
          <Link to="/" className="flex items-center text-blue-500 hover:text-blue-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
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
              <span>Processing Time: {country.processing_time}</span>
            </div>
          </div>

          <Separator className="my-4" />

          {packageDetails && (
            <PricingTier
              name={packageDetails.name}
              price={(packageDetails.total_price || packageDetails.government_fee + packageDetails.service_fee) || 0}
              governmentFee={packageDetails.government_fee || 0}
              serviceFee={packageDetails.service_fee || 0}
              processingDays={packageDetails.processing_days || 15}
            />
          )}

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
