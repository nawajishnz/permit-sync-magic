import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCountryData } from '@/hooks/useCountryData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CountryDataFallback from '@/components/country/CountryDataFallback';
import { autoFixSchema } from '@/integrations/supabase/refresh-schema';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Globe, MapPin, Plane } from 'lucide-react';
import PricingTier from '@/components/country/PricingTier';
import ProcessStep from '@/components/country/ProcessStep';
import FAQSection from '@/components/country/FAQSection';
import EmbassySection from '@/components/country/EmbassySection';
import DocumentChecklist from '@/components/country/DocumentChecklist';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CountryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  // Trigger schema fix on page load
  useEffect(() => {
    autoFixSchema().catch(console.error);
  }, []);
  
  // Use our enhanced useCountryData hook
  const { data: country, isLoading, error, refetch } = useCountryData(id);
  
  // Additional visa package query as backup (more resilient)
  const {
    data: visaPackage,
    isLoading: isLoadingPackage
  } = useQuery({
    queryKey: ['countryVisaPackage', id],
    queryFn: async () => {
      console.log('Fetching visa package for country ID:', id);
      try {
        // Try the view first (which should be created by our SQL script)
        const { data: viewData, error: viewError } = await supabase
          .from('countries_with_packages')
          .select('*')
          .eq('country_id', id)
          .maybeSingle();
          
        if (!viewError && viewData) {
          return {
            id: viewData.package_id,
            name: viewData.package_name,
            government_fee: viewData.government_fee || 0,
            service_fee: viewData.service_fee || 0,
            processing_days: viewData.processing_days || 15,
            total_price: viewData.total_price || 0
          };
        }
        
        // Fallback to direct query
        const { data, error } = await supabase
          .from('visa_packages')
          .select('*')
          .eq('country_id', id)
          .single();
          
        if (error) {
          console.error('Error fetching visa package:', error);
          return null;
        }
        
        return data;
      } catch (err) {
        console.error('Failed to fetch visa package:', err);
        return null;
      }
    },
    enabled: !!id && !country?.packageDetails, // Only run if country exists but has no package
  });

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
  if (error || (!country && !isLoading)) {
    return <CountryDataFallback countryId={id || ''} error={error as Error} onRetry={refetch} />;
  }

  // Ensure we have all necessary data
  if (!country) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Country details not available</h2>
          <p className="text-gray-600 mb-4">The requested country could not be found.</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Use visa package from dedicated query if main country query failed to get package
  const packageDetails = country.packageDetails || visaPackage;
  
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
              price={packageDetails.total_price || 0}
              governmentFee={packageDetails.government_fee || 0}
              serviceFee={packageDetails.service_fee || 0}
              processingDays={packageDetails.processing_days}
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
