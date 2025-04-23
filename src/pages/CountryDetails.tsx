import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  Globe, 
  Clock, 
  Calendar,
  CreditCard,
  ArrowRight,
  Loader2,
  Star,
  MapPin,
  Minus,
  Plus,
  MessageSquare,
  Check as CheckIcon,
  Users,
  ShieldCheck,
  BarChart,
  FileCheck,
  BadgeCheck,
  Award,
  Info,
  AlertCircle
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCountryData } from '@/hooks/useCountryData';
import VisaDocument from '@/components/country/VisaDocument';
import ProcessStep from '@/components/country/ProcessStep';
import FAQItem from '@/components/country/FAQItem';
import PricingTier from '@/components/country/PricingTier';
import VisaIncludesCard from '@/components/country/VisaIncludesCard';
import EmbassyCard from '@/components/country/EmbassyCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const getCountryEmoji = (countryName: string): string => {
  const emojiMap: {[key: string]: string} = {
    'United States': '🇺🇸',
    'Canada': '🇨🇦',
    'United Kingdom': '🇬🇧',
    'Australia': '🇦🇺',
    'Japan': '🇯🇵',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Singapore': '🇸🇬',
    'UAE': '🇦🇪',
    'Dubai': '🇦🇪',
    'India': '🇮🇳',
    'China': '🇨🇳',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸'
  };
  return emojiMap[countryName] || '🏳️';
};

type VisaPackage = {
  id: string;
  country_id: string;
  name: string;
  government_fee: number;
  service_fee: number;
  processing_days: number;
  total_price: number;
  created_at: string;
  updated_at: string;
};

const CountryDetails = () => {
  const { id: countryId } = useParams<{ id: string }>();
  const [travellers, setTravellers] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { 
    data: country, 
    isLoading: isLoadingCountry, 
    isError: isCountryError, 
    error: countryError 
  } = useCountryData(countryId);

  const { 
    data: visaPackage, 
    isLoading: isLoadingPackage,
    isError: isPackageError,
    error: packageError
  } = useQuery({
    queryKey: ['visa-package', countryId],
    queryFn: async () => {
      if (!countryId) return null;
      
      try {
        console.log("Fetching visa package for country ID:", countryId);
        const { data, error } = await supabase
          .from('visa_packages')
          .select(`
            id,
            country_id,
            name,
            government_fee,
            service_fee,
            processing_days,
            total_price,
            created_at,
            updated_at,
            countries (
              id,
              name
            )
          `)
          .eq('country_id', countryId)
          .single();
        
        if (error) {
          console.error('Error fetching visa package:', error);
          return null;
        }
        
        console.log("Visa package data:", data);
        return data;
      } catch (err) {
        console.error('Failed to fetch visa package:', err);
        return null;
      }
    },
    enabled: !!countryId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true
  });

  const [activeTab, setActiveTab] = useState("details");
  const [numberOfTravelers, setNumberOfTravelers] = useState(1);

  const getBasePrice = (): number => {
    if (visaPackage) {
      return visaPackage.total_price || 
             (visaPackage.government_fee || 0) + (visaPackage.service_fee || 0);
    }
    if (country?.packageDetails) {
      return country.packageDetails.total_price || 
             (country.packageDetails.government_fee || 0) + (country.packageDetails.service_fee || 0);
    }
    return 0;
  };

  const parsePrice = (priceString: string | undefined | null): number => {
    if (!priceString) return 0;
    const numericString = priceString.replace(/[₹$,]/g, '');
    const price = parseFloat(numericString);
    return isNaN(price) ? 0 : price;
  };

  const numericBasePrice = getBasePrice();
  const totalAmount = numericBasePrice * numberOfTravelers;

  const getProcessingTime = (): string => {
    if (visaPackage?.processing_days) {
      return `${visaPackage.processing_days} business days`;
    }
    return country?.packageDetails?.processing_days ? 
      `${country.packageDetails.processing_days} business days` : 
      'N/A';
  };

  const getEstimatedDate = (): string => {
    const processingDays = visaPackage?.processing_days || 15;
    const today = new Date();
    const deliveryDate = addDays(today, processingDays + 2);
    return format(deliveryDate, 'PP');
  };

  const handleApplyNow = () => {
    if (countryId) {
      navigate(`/visa-application/${countryId}`);
    } else {
      toast({
        title: "Error",
        description: "Could not find country information. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoadingCountry) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-700">Loading country information...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isCountryError || !country) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-lg mx-auto">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Country Not Found</h2>
              <p className="text-gray-600 mb-6">
                We couldn't find the country you're looking for. It may have been removed or the URL might be incorrect.
              </p>
              <Button 
                onClick={() => navigate('/countries')}
                className="rounded-full px-8"
              >
                Browse All Countries
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const PricingFeatures = ({ packageDetails }: { packageDetails: VisaPackage | null }) => {
    if (!packageDetails) return null;

    const totalPrice = 
      (packageDetails.government_fee || 0) + (packageDetails.service_fee || 0);
    
    const formattedPrice = new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
    }).format(totalPrice);

    return (
      <ul className="space-y-2 text-sm">
        <li className="flex items-start">
          <div className="mr-2 mt-0.5 bg-blue-100 p-1 rounded-full">
            <CheckIcon className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span>Government fee: ${packageDetails.government_fee}</span>
        </li>
        <li className="flex items-start">
          <div className="mr-2 mt-0.5 bg-blue-100 p-1 rounded-full">
            <CheckIcon className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span>Service fee: ${packageDetails.service_fee}</span>
        </li>
        <li className="flex items-start">
          <div className="mr-2 mt-0.5 bg-blue-100 p-1 rounded-full">
            <CheckIcon className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span>Processing time: {packageDetails.processing_days} days</span>
        </li>
      </ul>
    );
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-grow pt-20 md:pt-24 bg-white">
        <div className="relative bg-gradient-to-r from-indigo-600 to-blue-500">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          
          <div className="relative h-64 md:h-96">
            <img 
              src={country.banner || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000'}
              alt={country.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000';
              }}
            />
          </div>

          <div className="absolute top-0 left-0 right-0 bottom-0 z-20 flex flex-col justify-end">
            <div className="container mx-auto px-4 py-6 md:py-8">
              <div className="flex flex-col space-y-4 text-white">
                <Link to="/countries" className="flex items-center text-white/90 w-fit hover:text-white transition-colors">
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  <span>Back to Countries</span>
                </Link>

                <div className="flex items-center mb-1">
                  <span className="text-4xl md:text-5xl mr-3 md:mr-4">
                    {getCountryEmoji(country.name || '')}
                  </span>
                  <div>
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight">{country.name} Tourist Visa</h1>
                    <div className="flex flex-wrap items-center mt-2 gap-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="font-medium">4.8</span>
                        <span className="mx-1 text-white/70">•</span>
                        <span className="text-white/70">821 Reviews</span>
                      </div>
                      <div className="px-2 py-1 rounded-full bg-teal-500/90 text-white text-xs font-medium">
                        98% Success Rate
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-white/70" />
                    <span>Stay: <strong>{country.length_of_stay || 'Up to 30 days'}</strong></span>
                  </div>
                  <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-white/70" />
                    <span>Processing: <strong>{getProcessingTime()}</strong></span>
                  </div>
                  <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                    <Globe className="h-3.5 w-3.5 mr-1.5 text-white/70" />
                    <span>Entry: <strong>{country.entry_type || 'Single/Multiple'}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-6 md:py-8 relative">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3 space-y-6 md:space-y-8">
              <section className="bg-white rounded-xl md:rounded-2xl shadow-sm p-5 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-1 bg-teal-500 rounded-full"></div>
                  <h2 className="text-xl md:text-2xl font-bold text-navy">Tourist Visa Overview</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-2">
                      <CreditCard className="h-4 w-4 mr-2 text-teal-600" />
                      <span className="text-xs md:text-sm font-medium">Visa Type</span>
                    </div>
                    <p className="font-semibold text-sm md:text-base text-navy">Tourist Visa</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-2 text-teal-600" />
                      <span className="text-xs md:text-sm font-medium">Length of Stay</span>
                    </div>
                    <p className="font-semibold text-sm md:text-base text-navy">{country.length_of_stay || 'Up to 30 days'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-2">
                      <Clock className="h-4 w-4 mr-2 text-teal-600" />
                      <span className="text-xs md:text-sm font-medium">Validity</span>
                    </div>
                    <p className="font-semibold text-sm md:text-base text-navy">{country.validity || 'Up to 180 days'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-2">
                      <Globe className="h-4 w-4 mr-2 text-teal-600" />
                      <span className="text-xs md:text-sm font-medium">Entry</span>
                    </div>
                    <p className="font-semibold text-sm md:text-base text-navy">{country.entry_type || 'Single'}</p>
                  </div>
                </div>
                
                {visaPackage && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                      <Info className="h-4 w-4 mr-2 text-blue-600" />
                      Visa Package Details
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">Government Fee</span>
                          <p className="text-lg font-bold text-gray-800">${visaPackage.government_fee?.toFixed(2)}</p>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${(visaPackage.government_fee / (visaPackage.total_price || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">Service Fee</span>
                          <p className="text-lg font-bold text-gray-800">${visaPackage.service_fee?.toFixed(2)}</p>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: `${(visaPackage.service_fee / (visaPackage.total_price || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-2">
                          <span className="text-sm text-gray-500">Processing Time</span>
                          <p className="text-lg font-bold text-gray-800">{visaPackage.processing_days} days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="prose max-w-none text-sm md:text-base">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-gray-700 leading-relaxed">{country.description}</p>
                  </div>
                </div>
              </section>
              
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden">
                <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab}>
                  <div className="border-b border-gray-100">
                    <TabsList className="w-full bg-transparent h-auto overflow-x-auto justify-start p-0 gap-4 pl-4 pr-4 pt-4 space-x-2">
                      <TabsTrigger value="details" className="rounded-md data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 text-sm py-2 px-4">
                        Requirements
                      </TabsTrigger>
                      <TabsTrigger value="process" className="rounded-md data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 text-sm py-2 px-4">
                        Process
                      </TabsTrigger>
                      <TabsTrigger value="faq" className="rounded-md data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 text-sm py-2 px-4">
                        FAQ
                      </TabsTrigger>
                      <TabsTrigger value="travel" className="rounded-md data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 text-sm py-2 px-4">
                        Travel Info
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="details" className="p-5 md:p-6 focus:outline-none">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Required Documents</h3>
                    <div className="space-y-4">
                      {country?.documents?.map((doc, index) => (
                        <VisaDocument
                          key={index}
                          name={doc.document_name}
                          description={doc.document_description || ''}
                          required={doc.required || false}
                        />
                      ))}
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-navy mb-2">Important Notes</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          <li>All documents must be in English or officially translated</li>
                          <li>Passport must be valid for at least 6 months beyond your stay</li>
                          <li>Provide colored scans of original documents</li>
                          <li>Digital photographs must meet specific requirements</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="process" className="p-5 md:p-6 focus:outline-none">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Process</h3>
                    <div className="space-y-0">
                      {country?.processing_steps.map((step, index) => (
                        <ProcessStep
                          key={index}
                          step={step.step}
                          title={step.title}
                          description={step.description}
                          isLast={index === country.processing_steps.length - 1}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="faq" className="p-5 md:p-6 focus:outline-none">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Frequently Asked Questions</h3>
                    <div className="space-y-2">
                      {country?.faq.map((item, index) => (
                        <FAQItem 
                          key={index}
                          question={item.question}
                          answer={item.answer}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="travel" className="p-5 md:p-6 focus:outline-none">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Travel Information</h3>
                    
                    <div className="space-y-6">
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Best Time to Visit</h4>
                        <p className="text-sm text-gray-600">
                          Peak Season: June to August (Perfect weather, busy tourist season)<br />
                          Shoulder Season: March to May, September to November (Moderate crowds, better rates)<br />
                          Off Season: December to February (Lower prices, fewer tourists)
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Local Transportation</h4>
                        <p className="text-sm text-gray-600">
                          Public transit widely available in major cities. Airport transfers via express trains, 
                          shuttle buses and licensed taxis. Ride-sharing apps also operate in most urban areas.
                        </p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">Safety Tips</h4>
                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                          <li>Keep important documents secure and make digital copies</li>
                          <li>Be aware of local customs and dress codes</li>
                          <li>Use official transportation services</li>
                          <li>Stay in well-reviewed accommodations</li>
                          <li>Get comprehensive travel insurance</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <section className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-navy mb-4">Why Choose Permitsy</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                        <BarChart className="h-4 w-4 text-teal-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800">98% Success Rate</h3>
                    </div>
                    <p className="text-sm text-gray-600">Our visa experts ensure your application has the highest chance of approval.</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <FileCheck className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800">Document Check</h3>
                    </div>
                    <p className="text-sm text-gray-600">We thoroughly verify all documents before submission to avoid rejections.</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <BadgeCheck className="h-4 w-4 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800">Trusted Partner</h3>
                    </div>
                    <p className="text-sm text-gray-600">We're the preferred visa partner for thousands of travelers worldwide.</p>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
              <div className="sticky top-24">
                <Card className="shadow-md border-0">
                  <CardContent className="p-5 md:p-6">
                    <div className="mb-5 flex flex-col">
                      <div className="flex justify-between items-baseline mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">
                          ${visaPackage ? visaPackage.total_price?.toFixed(2) : numericBasePrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </h3>
                        <span className="text-sm text-gray-500">per person</span>
                      </div>
                      
                      {visaPackage && (
                        <div className="flex items-center mb-2 text-sm text-gray-500">
                          <Info className="h-4 w-4 mr-1.5 text-blue-500" />
                          <span>Gov. Fee: ${visaPackage.government_fee?.toFixed(2)} + Service: ${visaPackage.service_fee?.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1.5 text-indigo-500" />
                        <span>{getProcessingTime()}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700 border-t pt-4">Booking Details</h3>
                      
                      <div className="flex items-center justify-between">
                        <label htmlFor="travellers" className="text-sm text-gray-600 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-400" /> Number of Travelers
                        </label>
                        <div className="flex items-center border rounded-md">
                           <Button variant="ghost" size="sm" className="px-2 h-8" onClick={() => setNumberOfTravelers(prev => Math.max(1, prev - 1))} disabled={numberOfTravelers <= 1}>
                             <Minus className="h-3 w-3" />
                           </Button>
                           <span className="px-3 text-sm font-medium">{numberOfTravelers}</span>
                           <Button variant="ghost" size="sm" className="px-2 h-8" onClick={() => setNumberOfTravelers(prev => prev + 1)}>
                             <Plus className="h-3 w-3" />
                           </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                         <div className="text-gray-600 flex items-center">
                           <Calendar className="h-4 w-4 mr-2 text-gray-400" /> Estimated Delivery
                         </div>
                         <span className="font-medium text-gray-800">{getEstimatedDate()}</span>
                      </div>
                      
                      <div className="border-t pt-4">
                         <div className="flex justify-between items-center mb-1">
                           <span className="text-sm text-gray-600">Total Amount</span>
                           <span className="text-xl font-bold text-indigo-600">${totalAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                         </div>
                         <p className="text-xs text-gray-400 text-right">Inclusive of all taxes</p>
                      </div>
                      
                      <Button
                        onClick={handleApplyNow}
                        className="w-full py-6 text-base rounded-lg mt-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-300"
                      >
                        Apply Now
                      </Button>
                      
                      <p className="text-xs text-center text-gray-500 mt-2">
                        By proceeding, you agree to our <Link to="/terms" className="text-indigo-600 hover:underline">Terms</Link> and <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CountryDetails;
