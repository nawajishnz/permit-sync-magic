
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
  const { id } = useParams<{ id: string }>();
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
  } = useCountryData(id);

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
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight">{country.name} Visa</h1>
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
              <h2 className="text-xl md:text-2xl font-bold text-navy mb-5 md:mb-6">Visa Overview</h2>
              
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 mb-6">
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-500 mb-1.5">
                    <CreditCard className="h-4 w-4 mr-1.5" />
                    <span className="text-xs md:text-sm">Visa Type</span>
                  </div>
                  <p className="font-medium text-sm md:text-base">{country.name} Tourist Visa</p>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-500 mb-1.5">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span className="text-xs md:text-sm">Length of Stay</span>
                  </div>
                  <p className="font-medium text-sm md:text-base">{country.length_of_stay || 'Up to 30 days'}</p>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-500 mb-1.5">
                    <Clock className="h-4 w-4 mr-1.5" />
                    <span className="text-xs md:text-sm">Validity</span>
                  </div>
                  <p className="font-medium text-sm md:text-base">{country.validity || 'Up to 180 days'}</p>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-500 mb-1.5">
                    <Globe className="h-4 w-4 mr-1.5" />
                    <span className="text-xs md:text-sm">Entry</span>
                  </div>
                  <p className="font-medium text-sm md:text-base">{country.entry_type || 'Single'}</p>
                </div>
              </div>
              
              <div className="prose max-w-none text-sm md:text-base">
                <p className="text-gray-600">{country.description}</p>
              </div>
            </section>
            
            {/* What's Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <VisaIncludesCard 
                title="What's Included" 
                items={country.visa_includes} 
              />
              <VisaIncludesCard 
                title="Permitsy Assistance" 
                items={country.visa_assistance} 
              />
            </div>
            
            {/* Tabs Section - Sticky Tabs */}
            <Tabs defaultValue="requirements" className="bg-white rounded-xl md:rounded-2xl shadow-sm">
              <div className="sticky top-16 z-20 bg-white rounded-t-xl border-b">
                <TabsList className="w-full justify-start p-1 px-5">
                  <TabsTrigger value="requirements" className="rounded-full">Requirements</TabsTrigger>
                  <TabsTrigger value="process" className="rounded-full">Process</TabsTrigger>
                  <TabsTrigger value="faq" className="rounded-full">FAQ</TabsTrigger>
                  <TabsTrigger value="embassy" className="rounded-full">Embassy</TabsTrigger>
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
              </TabsContent>
              
              {/* Process Tab */}
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
              
              {/* Embassy Tab */}
              <TabsContent value="embassy" className="p-5 md:p-8 focus:outline-none">
                <h3 className="text-lg md:text-xl font-semibold text-navy mb-4">Embassy & Consulate Information</h3>
                <EmbassyCard details={country.embassy_details} />
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
          
          {/* Right column - sticky booking form */}
          <div className="w-full lg:w-1/3 mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-5 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-navy">Apply Now</h2>
                  <Badge className="bg-teal-500 hover:bg-teal-600">Fast Process</Badge>
                </div>
                
                {/* Pricing Tier Selection */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Select Processing Speed</h3>
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
                <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 mb-6">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-teal-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-teal-900">Estimated Delivery</p>
                      <p className="text-sm text-teal-700">{formattedEstimatedDate}</p>
                    </div>
                  </div>
                </div>
                
                {/* Number of travelers */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Number of Travelers</h3>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button 
                      className="px-4 py-3 text-gray-500 hover:text-gray-700 disabled:opacity-50 flex-shrink-0"
                      onClick={handleDecreaseTravellers}
                      disabled={travellers <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="flex-1 text-center font-medium">{travellers}</div>
                    <button 
                      className="px-4 py-3 text-gray-500 hover:text-gray-700 flex-shrink-0"
                      onClick={handleIncreaseTravellers}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Summary */}
                <div className="border-t border-b border-gray-100 py-4 mb-5">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 text-sm">Base price</span>
                    <span className="font-medium">{selectedPackage.price}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 text-sm">Travelers</span>
                    <span className="font-medium">{travellers}</span>
                  </div>
                  <div className="flex justify-between text-navy font-bold mt-3">
                    <span>Total</span>
                    <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                
                {/* Apply now button */}
                <Button className="w-full mb-3 bg-teal-600 hover:bg-teal-700">
                  Apply Now
                </Button>
                
                <div className="flex items-center justify-center text-xs text-gray-500 mb-6">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                  <span>Secure payment • Money-back guarantee</span>
                </div>
                
                {/* Trustpilot-style reviews */}
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1.5 text-green-600" />
                      <span className="text-sm font-medium">Trusted by thousands</span>
                    </div>
                    <div className="flex">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 italic">
                    {country.name === "Dubai" || country.name === "UAE" ? 
                      `"The Dubai visa process was incredibly smooth. Permitsy handled everything efficiently and my visa was approved in just 2 days!"` : 
                      `"The visa process was incredibly smooth. Permitsy handled everything efficiently and my ${country.name} visa was approved in just 2 days!"`}
                  </div>
                  <div className="text-xs font-medium mt-1">
                    Amit P. • Verified customer
                  </div>
                </div>
                
                {/* Need help */}
                <div className="mt-6 bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-sm text-blue-700">Need help with your visa?</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Our visa experts are here to assist you with any questions.</p>
                  <Button variant="outline" size="sm" className="w-full mt-2 bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
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
