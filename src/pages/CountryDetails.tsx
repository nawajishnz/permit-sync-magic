
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCountryData } from '@/hooks/useCountryData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CountryDataFallback from '@/components/country/CountryDataFallback';
import { autoFixSchema, createFallbackPricing } from '@/integrations/supabase/refresh-schema';
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
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CountryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  // Trigger schema fix on page load
  useEffect(() => {
    if (id) {
      autoFixSchema().catch(console.error);
    }
  }, [id]);
  
  // Use our enhanced useCountryData hook
  const { data: country, isLoading, error, refetch } = useCountryData(id);
  
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
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Error Loading Country Details</AlertTitle>
          <AlertDescription>
            {error?.message || "Country details could not be loaded"}
          </AlertDescription>
        </Alert>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <h2 className="text-xl font-bold mb-2">Country details not available</h2>
              <p className="text-gray-600 mb-4">There was a problem loading this country's information.</p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => refetch()}
                  className="bg-blue-600 text-white"
                >
                  Try Again
                </Button>
                <Link to="/">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ensure we have all necessary data
  if (!country) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Country details not available</h2>
          <p className="text-gray-600 mb-4">The requested country could not be found.</p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => refetch()}
              className="bg-blue-600 text-white"
            >
              Try Again
            </Button>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
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
