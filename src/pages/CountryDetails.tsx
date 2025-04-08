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
  Check,
  Users,
  ShieldCheck,
  BarChart,
  FileCheck,
  BadgeCheck,
  Award
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

const CountryDetails = () => {
  const { id: countryId } = useParams<{ id: string }>();
  const [travellers, setTravellers] = useState(1);
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Use our new hook to fetch all country data
  const { 
    data: country, 
    isLoading, 
    isError,
    error
  } = useCountryData(countryId);

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center px-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-xl md:text-2xl font-bold text-navy mb-2">Loading Country Details</h1>
            <p className="text-gray-600">Please wait while we fetch the latest information</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-xl md:text-2xl font-bold text-navy mb-4">Error Loading Country</h1>
            <p className="text-gray-600 mb-6">{error instanceof Error ? error.message : "Failed to load country information"}</p>
            <Link to="/countries">
              <Button>Browse All Countries</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!country) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-xl md:text-2xl font-bold text-navy mb-4">Country not found</h1>
            <p className="text-gray-600 mb-6">The country you're looking for doesn't exist or has been removed.</p>
            <Link to="/countries">
              <Button>Browse All Countries</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Helper function to get country emoji flag based on name
  const getCountryEmoji = (countryName: string) => {
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

  const handleDecreaseTravellers = () => {
    if (travellers > 1) {
      setTravellers(travellers - 1);
    }
  };
  
  const handleIncreaseTravellers = () => {
    setTravellers(travellers + 1);
  };

  // Get the selected package or use default if none available
  const selectedPackage = country.pricingTiers.length > 0 && country.pricingTiers[selectedPackageIndex] 
    ? country.pricingTiers[selectedPackageIndex] 
    : { name: 'Standard', price: '₹3,999', processing_time: '3-5 days', features: [] };

  // Extract price for calculation (remove currency symbol and commas)
  const priceString = selectedPackage.price ? selectedPackage.price.replace(/[₹,]/g, '') : '3999';
  const basePrice = parseInt(priceString) || 3999;
  const totalAmount = basePrice * travellers;

  // Calculate processing dates based on the selected package
  const today = new Date();
  const processingText = selectedPackage.processing_time || '3-5 days';
  let processingDays = 3; // default

  if (processingText.includes('24-48 hours')) {
    processingDays = 2;
  } else if (processingText.includes('Same day')) {
    processingDays = 1;
  } else if (processingText.includes('3-5')) {
    processingDays = 5;
  }

  const estimatedDate = addDays(today, processingDays);
  const formattedEstimatedDate = format(estimatedDate, "d MMMM yyyy");

  // Get image URLs for the country
  const getImageUrlsForCountry = () => {
    const mainImage = country.banner || 'https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=1000';
    
    if (country.name === 'Singapore') {
      return [
        mainImage,
        'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000', // Marina Bay Sands
        'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?q=80&w=1000', // Gardens by the Bay
        'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000', // City skyline
      ];
    } 
    else if (country.name === 'Dubai' || country.name === 'UAE') {
      return [
        mainImage,
        'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1000', // Burj Khalifa
        'https://images.unsplash.com/photo-1580674684089-5c8b0a83e6a7?q=80&w=1000', // Dubai Mall
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000', // Desert safari
      ];
    }
    else {
      // For other countries, use a mix of travel-related images
      return [
        mainImage,
        'https://images.unsplash.com/photo-1488085061387-422e29b40080',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
        'https://images.unsplash.com/photo-1504150558240-0b4fd8946624',
      ];
    }
  };

  // Handle applying for a visa
  const handleApplyNow = () => {
    if (countryId) {
      navigate(`/visa-application/${countryId}/${selectedPackageIndex}`);
    } else {
      toast({
        title: "Error",
        description: "Could not find country information. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const images = getImageUrlsForCountry();
  
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      
      {/* Enhanced Banner with multiple images */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-blue-500">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        
        {/* Image Grid - simplified for mobile */}
        <div className="relative h-64 md:h-96">
          {!isMobile && images.length > 1 ? (
            <div className="grid grid-cols-3 grid-rows-2 h-full">
              {/* Main large image */}
              <div className="col-span-2 row-span-2 relative">
                <img 
                  src={images[0]}
                  alt={country.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000';
                  }}
                />
              </div>
              
              {/* Smaller image grid */}
              <div className="col-span-1 row-span-1">
                <img 
                  src={images[1] || images[0]}
                  alt={`${country.name} attraction`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1488085061387-422e29b40080';
                  }}
                />
              </div>
              <div className="col-span-1 row-span-1">
                <div className="grid grid-cols-1 grid-rows-2 h-full">
                  <div>
                    <img 
                      src={images[2] || images[0]}
                      alt={`${country.name} attraction`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1';
                      }}
                    />
                  </div>
                  <div>
                    <img 
                      src={images[3] || images[0]}
                      alt={`${country.name} attraction`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1504150558240-0b4fd8946624';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <img 
              src={country.banner || 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000'}
              alt={country.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1000';
              }}
            />
          )}
        </div>

        {/* Banner Content Overlay */}
        <div className="absolute top-0 left-0 right-0 bottom-0 z-20 flex flex-col justify-end">
          <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="flex flex-col space-y-4 text-white">
              <Link to="/countries" className="flex items-center text-white/90 w-fit hover:text-white transition-colors">
                <ChevronLeft className="h-5 w-5 mr-1" />
                <span>Back to Countries</span>
              </Link>

              <div className="flex items-center mb-1">
                <span className="text-4xl md:text-5xl mr-3 md:mr-4">
                  {country.flag && country.flag.includes('http') ? (
                    <img src={country.flag} alt={country.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" />
                  ) : (
                    <span>{getCountryEmoji(country.name)}</span>
                  )}
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
                  <span>Processing: <strong>{country.processing_time || '3-5 days'}</strong></span>
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
      
      {/* Two-column layout - stacked on mobile */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - scrollable content */}
          <div className="w-full lg:w-2/3 space-y-6 md:space-y-8">
            {/* Visa Overview Section */}
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
              
              <div className="prose max-w-none text-sm md:text-base">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-gray-700 leading-relaxed">{country.description}</p>
                </div>
              </div>
            </section>
            
            {/* What's Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-xl border border-teal-100">
                <div className="flex items-center gap-3 mb-4">
                  <BadgeCheck className="h-5 w-5 text-teal-600" />
                  <h3 className="font-semibold text-lg text-navy">What's Included</h3>
                </div>
                <ul className="space-y-3">
                  {country.visa_includes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-teal-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg text-navy">Visa Assistance</h3>
                </div>
                <ul className="space-y-3">
                  {country.visa_assistance.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Tabs Section - Sticky Tabs */}
            <Tabs defaultValue="requirements" className="bg-white rounded-xl md:rounded-2xl shadow-sm">
              <div className="sticky top-16 z-20 bg-white rounded-t-xl border-b">
                <TabsList className="w-full justify-start p-1 px-5 gap-2">
                  <TabsTrigger value="requirements" className="rounded-full data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      <span>Requirements</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="process" className="rounded-full data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                    <div className="flex items-center gap-2">
                      <BarChart className="h-4 w-4" />
                      <span>Process</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="faq" className="rounded-full data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>FAQ</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="travel-guide" className="rounded-full data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Travel Guide</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="culture" className="rounded-full data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Culture</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Requirements Tab */}
              <TabsContent value="requirements" className="p-5 md:p-8 focus:outline-none">
                <h3 className="text-lg md:text-xl font-semibold text-navy mb-4">Document Requirements</h3>
                <p className="text-gray-600 mb-6">{country.requirements_description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {country.documents.map((doc) => (
                    <VisaDocument 
                      key={doc.id}
                      name={doc.document_name}
                      description={doc.document_description}
                      required={doc.required}
                    />
                  ))}
                </div>

                {/* Additional Requirements Info */}
                <div className="mt-8 space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-navy mb-2">Important Notes</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                      <li>All documents must be in English or officially translated</li>
                      <li>Passport must be valid for at least 6 months beyond your stay</li>
                      <li>Provide colored scans of original documents</li>
                      <li>Digital photographs must meet specific requirements</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-navy mb-2">Common Rejection Reasons</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                      <li>Incomplete or incorrect information in the application</li>
                      <li>Insufficient funds or financial documentation</li>
                      <li>Poor quality or non-compliant photographs</li>
                      <li>Missing supporting documents</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              {/* Process Tab - Enhanced */}
              <TabsContent value="process" className="p-5 md:p-8 focus:outline-none">
                <h3 className="text-lg md:text-xl font-semibold text-navy mb-4">Application Process</h3>
                <div className="mt-6 space-y-0">
                  {country.processing_steps.map((step, index) => (
                    <ProcessStep
                      key={index}
                      step={step.step}
                      title={step.title}
                      description={step.description}
                      isLast={index === country.processing_steps.length - 1}
                    />
                  ))}
                </div>

                {/* Processing Time Breakdown */}
                <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-navy mb-3">Processing Time Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Document Verification:</span>
                      <span className="font-medium">24-48 hours</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Embassy Processing:</span>
                      <span className="font-medium">3-5 business days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Visa Issuance:</span>
                      <span className="font-medium">1-2 business days</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* FAQ Tab */}
              <TabsContent value="faq" className="p-5 md:p-8 focus:outline-none">
                <h3 className="text-lg md:text-xl font-semibold text-navy mb-4">Frequently Asked Questions</h3>
                <div className="space-y-2 md:space-y-0">
                  {country.faq.map((item, index) => (
                    <FAQItem 
                      key={index}
                      question={item.question}
                      answer={item.answer}
                    />
                  ))}
                </div>
              </TabsContent>
              
              {/* Travel Guide Tab - New */}
              <TabsContent value="travel-guide" className="p-5 md:p-8 focus:outline-none">
                <h3 className="text-lg md:text-xl font-semibold text-navy mb-4">Essential Travel Information</h3>
                
                {/* Best Time to Visit */}
                <div className="mb-8">
                  <h4 className="font-semibold text-navy mb-3">Best Time to Visit</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Peak Season</h5>
                      <p className="text-sm text-gray-600">June to August</p>
                      <p className="text-xs text-gray-500 mt-1">Perfect weather, busy tourist season</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Shoulder Season</h5>
                      <p className="text-sm text-gray-600">March to May, September to November</p>
                      <p className="text-xs text-gray-500 mt-1">Moderate crowds, better rates</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Off Season</h5>
                      <p className="text-sm text-gray-600">December to February</p>
                      <p className="text-xs text-gray-500 mt-1">Lower prices, fewer tourists</p>
                    </div>
                  </div>
                </div>

                {/* Transportation */}
                <div className="mb-8">
                  <h4 className="font-semibold text-navy mb-3">Getting Around</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Public Transportation</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Extensive metro network in major cities</li>
                        <li>• Regular bus services</li>
                        <li>• Taxi and ride-sharing services available</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">From the Airport</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Airport express trains</li>
                        <li>• Airport shuttle buses</li>
                        <li>• Licensed airport taxis</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Accommodation */}
                <div className="mb-8">
                  <h4 className="font-semibold text-navy mb-3">Where to Stay</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Budget</h5>
                      <p className="text-sm text-gray-600">Hostels and budget hotels</p>
                      <p className="text-xs text-gray-500 mt-1">$30-50 per night</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Mid-Range</h5>
                      <p className="text-sm text-gray-600">3-star hotels and apartments</p>
                      <p className="text-xs text-gray-500 mt-1">$100-200 per night</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Luxury</h5>
                      <p className="text-sm text-gray-600">4-5 star hotels and resorts</p>
                      <p className="text-xs text-gray-500 mt-1">$250+ per night</p>
                    </div>
                  </div>
                </div>

                {/* Safety Tips */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-navy mb-3">Safety Tips</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Keep important documents secure</li>
                      <li>• Be aware of local customs and dress codes</li>
                      <li>• Use official transportation services</li>
                    </ul>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Stay in well-reviewed accommodations</li>
                      <li>• Keep emergency numbers handy</li>
                      <li>• Get travel insurance</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              {/* Culture Tab - New */}
              <TabsContent value="culture" className="p-5 md:p-8 focus:outline-none">
                <h3 className="text-lg md:text-xl font-semibold text-navy mb-4">Cultural Guide</h3>
                
                {/* Customs and Etiquette */}
                <div className="mb-8">
                  <h4 className="font-semibold text-navy mb-3">Customs & Etiquette</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Do's</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Dress modestly when visiting religious sites</li>
                        <li>• Remove shoes when entering homes</li>
                        <li>• Learn basic local greetings</li>
                        <li>• Ask permission before taking photos</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Don'ts</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Don't point with your feet or fingers</li>
                        <li>• Avoid public displays of affection</li>
                        <li>• Don't touch people's heads</li>
                        <li>• Don't discuss sensitive political topics</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Language */}
                <div className="mb-8">
                  <h4 className="font-semibold text-navy mb-3">Essential Phrases</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Basic Greetings</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Hello</li>
                        <li>• Thank you</li>
                        <li>• Please</li>
                        <li>• Goodbye</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Useful Phrases</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Where is...?</li>
                        <li>• How much?</li>
                        <li>• I don't understand</li>
                        <li>• Can you help me?</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Food Culture */}
                <div className="mb-8">
                  <h4 className="font-semibold text-navy mb-3">Food Culture</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Must-Try Dishes</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Local specialties</li>
                        <li>• Street food</li>
                        <li>• Traditional desserts</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Dining Etiquette</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Table manners</li>
                        <li>• Tipping customs</li>
                        <li>• Meal times</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Dietary Options</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Vegetarian choices</li>
                        <li>• Halal options</li>
                        <li>• Food allergies</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Festivals and Events */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-navy mb-3">Major Festivals & Events</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Traditional Festivals</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• New Year celebrations</li>
                        <li>• Religious festivals</li>
                        <li>• Cultural events</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Modern Events</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Music festivals</li>
                        <li>• Food festivals</li>
                        <li>• Art exhibitions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Why Choose Us */}
            <section className="bg-white rounded-xl md:rounded-2xl shadow-sm p-5 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-navy mb-5 md:mb-6">Why Choose Permitsy</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center px-3 py-6">
                  <div className="mx-auto w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                    <BarChart className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-navy text-lg mb-2">98% Success Rate</h3>
                  <p className="text-gray-600 text-sm">Our visa experts ensure your application has the highest chance of approval.</p>
                </div>
                
                <div className="text-center px-3 py-6">
                  <div className="mx-auto w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                    <FileCheck className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-navy text-lg mb-2">Document Verification</h3>
                  <p className="text-gray-600 text-sm">We thoroughly check all documents before submission to avoid any rejections.</p>
                </div>
                
                <div className="text-center px-3 py-6">
                  <div className="mx-auto w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                    <BadgeCheck className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-navy text-lg mb-2">Trusted Partner</h3>
                  <p className="text-gray-600 text-sm">We're the preferred visa partner for thousands of travelers worldwide.</p>
                </div>
              </div>
            </section>
          </div>
          
          {/* Right column - sticky booking form - improve stickiness */}
          <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-5 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-teal-500 rounded-full"></div>
                    <h2 className="text-xl font-bold text-navy">Apply Now</h2>
                  </div>
                  <Badge className="bg-teal-500 hover:bg-teal-600">Fast Process</Badge>
                </div>
                
                {/* Pricing Tier Selection */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal-600" />
                    Select Processing Speed
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {country.pricingTiers.length === 0 ? (
                      <Card className="border border-dashed border-gray-200 p-4 text-center text-gray-500">
                        No pricing options available
                      </Card>
                    ) : (
                      country.pricingTiers.map((tier, index) => (
                        <PricingTier
                          key={tier.id}
                          name={tier.name}
                          price={tier.price}
                          processingTime={tier.processing_time}
                          features={tier.features}
                          isRecommended={tier.is_recommended}
                          onSelect={() => setSelectedPackageIndex(index)}
                          isSelected={selectedPackageIndex === index}
                        />
                      ))
                    )}
                  </div>
                </div>
                
                {/* Expected delivery date */}
                <div className="bg-gradient-to-r from-teal-50 to-teal-100/30 border border-teal-100 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-teal-900">Estimated Delivery</p>
                      <p className="text-sm text-teal-700 font-semibold">{formattedEstimatedDate}</p>
                    </div>
                  </div>
                </div>
                
                {/* Number of travelers */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-teal-600" />
                    Number of Travelers
                  </h3>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <button 
                      className="p-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 flex-shrink-0 transition-colors"
                      onClick={handleDecreaseTravellers}
                      disabled={travellers <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="flex-1 text-center font-medium text-navy">{travellers}</div>
                    <button 
                      className="p-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0 transition-colors"
                      onClick={handleIncreaseTravellers}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Summary */}
                <div className="border-t border-b border-gray-100 py-4 mb-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Base price</span>
                    <span className="font-medium text-navy">{selectedPackage.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Travelers</span>
                    <span className="font-medium text-navy">{travellers}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-navy font-bold">Total Amount</span>
                    <span className="text-lg font-bold text-teal-600">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                
                {/* Apply now button */}
                <Button 
                  className="w-full mb-3 bg-teal-600 hover:bg-teal-700 h-12 text-base font-medium"
                  onClick={handleApplyNow}
                >
                  Apply Now
                </Button>
                
                <div className="flex items-center justify-center text-xs text-gray-500 mb-6">
                  <ShieldCheck className="h-4 w-4 mr-1.5 text-teal-600" />
                  <span>Secure payment • Money-back guarantee</span>
                </div>
                
                {/* Trustpilot-style reviews */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-navy">Trusted by thousands</span>
                    </div>
                    <div className="flex">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                      {country.name === "Dubai" || country.name === "UAE" ? 
                        `"The Dubai visa process was incredibly smooth. Permitsy handled everything efficiently and my visa was approved in just 2 days!"` : 
                        `"The visa process was incredibly smooth. Permitsy handled everything efficiently and my ${country.name} visa was approved in just 2 days!"`}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-teal-700">AP</span>
                      </div>
                      <div className="text-xs font-medium text-gray-900">
                        Amit P. • <span className="text-teal-600">Verified customer</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Need help */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100/30 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-sm text-blue-900">Need help with your visa?</span>
                  </div>
                  <p className="text-xs text-blue-700 mb-3">Our visa experts are here to assist you with any questions.</p>
                  <Button variant="outline" size="sm" className="w-full bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 font-medium">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CountryDetails;
