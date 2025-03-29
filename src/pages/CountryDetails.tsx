import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, 
  Globe, 
  FileText, 
  Clock, 
  DollarSign, 
  Users, 
  Check,
  Calendar,
  CreditCard,
  MapPin,
  ShieldCheck,
  Minus,
  Plus,
  FileCheck,
  BadgeIndianRupee,
  MessageSquare,
  Star,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const CountryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [country, setCountry] = useState<any>(null);
  const [visaTypes, setVisaTypes] = useState<any[]>([]);
  const [visaPackages, setVisaPackages] = useState<any[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [travellers, setTravellers] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        setIsLoading(true);
        
        if (!id) {
          toast({
            title: "Error",
            description: "Country ID is missing",
            variant: "destructive",
          });
          navigate('/countries');
          return;
        }
        
        // Fetch country data
        const { data: countryData, error: countryError } = await supabase
          .from('countries')
          .select('*')
          .eq('id', id)
          .single();
        
        if (countryError) {
          console.error('Error fetching country:', countryError);
          toast({
            title: "Error loading country",
            description: countryError.message,
            variant: "destructive",
          });
          return;
        }
        
        if (!countryData) {
          toast({
            title: "Country not found",
            description: "The requested country does not exist",
            variant: "destructive",
          });
          navigate('/countries');
          return;
        }
        
        setCountry(countryData);
        
        // Fetch visa types for this country
        const { data: visaTypesData, error: visaTypesError } = await supabase
          .from('visa_types')
          .select('*, visa_requirements(*)')
          .eq('country_id', id);
        
        if (visaTypesError) {
          console.error('Error fetching visa types:', visaTypesError);
        } else {
          setVisaTypes(visaTypesData || []);
        }
        
        // Fetch visa packages for this country
        const { data: packagesData, error: packagesError } = await supabase
          .from('visa_packages')
          .select('*, package_features(*)')
          .eq('country_id', id);
        
        if (packagesError) {
          console.error('Error fetching packages:', packagesError);
        } else {
          setVisaPackages(packagesData || []);
        }
        
        // Fetch required documents for this country
        const { data: documentsData, error: documentsError } = await supabase
          .from('required_documents')
          .select('*')
          .eq('country_id', id);
        
        if (documentsError) {
          console.error('Error fetching documents:', documentsError);
        } else {
          setRequiredDocuments(documentsData || []);
        }
      } catch (err) {
        console.error('Error in fetchCountryData:', err);
        toast({
          title: "Error loading data",
          description: "Something went wrong while loading country data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCountryData();
  }, [id, toast, navigate]);
  
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

  // Helper function to get correct flag URL format based on country name
  const getCountryFlagUrl = (countryName) => {
    // If there's already a valid flag URL stored, use that
    if (country.flag && country.flag.includes('http')) {
      return country.flag;
    }
    
    // Convert country name to ISO code for flag CDN usage
    const countryIsoMap = {
      'United States': 'us',
      'Canada': 'ca',
      'United Kingdom': 'gb',
      'Australia': 'au',
      'Japan': 'jp',
      'Germany': 'de',
      'France': 'fr',
      'Singapore': 'sg',
      'UAE': 'ae',
      'India': 'in',
      'China': 'cn',
      'Italy': 'it',
      'Spain': 'es'
    };
    
    const isoCode = countryIsoMap[countryName] || 'xx';
    return `https://flagcdn.com/w320/${isoCode.toLowerCase()}.png`;
  };
  
  // Calculate visa dates
  const today = new Date();
  const guaranteedDate = addDays(today, 3);
  const formattedGuaranteedDate = format(guaranteedDate, "d MMM yyyy 'at' h:mm a");
  const shortGuaranteedDate = format(guaranteedDate, "d MMMM");
  const previousDate = format(addDays(guaranteedDate, -2), "d MMMM");
  
  // Get the selected package
  const visaPackage = visaPackages.length > 0 && visaPackages[selectedPackage] ? visaPackages[selectedPackage] : {
    name: 'Standard Processing',
    processing_time: '7-10 days',
    price: '₹8,500',
    features: []
  };
  
  // Extract price for calculation (remove currency symbol and commas)
  const priceString = visaPackage.price ? visaPackage.price.replace(/[₹,]/g, '') : '8500';
  const basePrice = parseInt(priceString) || 8500;
  const totalAmount = basePrice * travellers;
  
  const handleDecreaseTravellers = () => {
    if (travellers > 1) {
      setTravellers(travellers - 1);
    }
  };
  
  const handleIncreaseTravellers = () => {
    setTravellers(travellers + 1);
  };

  // Get country emoji flag based on name
  const getCountryEmoji = (countryName) => {
    const emojiMap = {
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'United Kingdom': '🇬🇧',
      'Australia': '🇦🇺',
      'Japan': '🇯🇵',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Singapore': '🇸🇬',
      'UAE': '🇦🇪',
      'India': '🇮🇳',
      'China': '🇨🇳',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸'
    };
    
    return emojiMap[countryName] || '🏳️';
  };

  // Image grid layout for country banner
  const getImageUrlsForCountry = () => {
    // Use the country's banner if available
    const mainImage = country.banner || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000';
    
    // For smaller images, use predefined ones based on country name or fallbacks
    if (country.name === 'United States') {
      return [
        mainImage,
        'https://images.unsplash.com/photo-1501466044931-62695aada8e9', // Golden Gate Bridge
        'https://images.unsplash.com/photo-1543158266-0066955047b0', // Washington DC
        'https://images.unsplash.com/photo-1570755324166-49694643b334', // Las Vegas
      ];
    } else if (country.name === 'Japan') {
      return [
        mainImage,
        'https://images.unsplash.com/photo-1528164344705-47542687000d', // Tokyo Tower
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e', // Kyoto Temple
        'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3', // Cherry Blossoms
      ];
    } else if (country.name === 'Singapore') {
      return [
        mainImage,
        'https://images.unsplash.com/photo-1570375309836-a2976045b372', // Gardens by the Bay
        'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a', // Marina Bay Sands
        'https://images.unsplash.com/photo-1573655349936-b9def0b9a7b3', // City skyline
      ];
    } else {
      // For other countries, use a mix of travel-related images
      return [
        mainImage,
        'https://images.unsplash.com/photo-1488085061387-422e29b40080', // Travel image 1
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1', // Travel image 2
        'https://images.unsplash.com/photo-1504150558240-0b4fd8946624', // Travel image 3
      ];
    }
  };
  
  const images = getImageUrlsForCountry();
  
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      
      {/* Enhanced Banner with multiple images - optimized for mobile */}
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
                    target.src = 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000';
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
              src={country.banner || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000'}
              alt={country.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000';
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
                  <span>Stay: <strong>{country.length_of_stay || 'Up to 90 days'}</strong></span>
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
                    <span className="text-xs md:text-sm">Visa Type:</span>
                  </div>
                  <p className="font-medium text-sm md:text-base">{country.name} Visa</p>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-500 mb-1.5">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span className="text-xs md:text-sm">Length of Stay:</span>
                  </div>
                  <p className="font-medium text-sm md:text-base">{country.length_of_stay || 'Up to 90 days'}</p>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-500 mb-1.5">
                    <Clock className="h-4 w-4 mr-1.5" />
                    <span className="text-xs md:text-sm">Validity:</span>
                  </div>
                  <p className="font-medium text-sm md:text-base">{country.validity || 'Up to 180 days'}</p>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-500 mb-1.5">
                    <Globe className="h-4 w-4 mr-1.5" />
                    <span className="text-xs md:text-sm">Entry:</span>
                  </div>
                  <p className="font-medium text-sm md:text-base">{country.entry_type || 'Single/Multiple'}</p>
                </div>
              </div>
              
              <div className="prose max-w-none text-sm md:text-base">
                <p className="text-gray-600">{country.description || 'This country offers various visa options for tourists, students, workers, and immigrants. Each visa type has specific requirements and application procedures.'}</p>
              </div>
            </section>
            
            {/* Visa Types Section */}
            <section className="bg-white rounded-xl md:rounded-2xl shadow-sm p-5 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-navy mb-5 md:mb-6">Available Visa Types</h2>
              
              {visaTypes.length === 0 ? (
                <div className="text-center py-6 md:py-8 border border-dashed border-gray-200 rounded-lg">
                  <h3 className="text-base md:text-lg font-medium text-gray-500">Visa type information coming soon</h3>
                  <p className="text-gray-400 mt-2 text-sm">Our team is currently updating the available visa types</p>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  {visaTypes.map((visaType: any) => (
                    <Card key={visaType.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="p-4 md:p-6 flex-1">
                            <h3 className="font-bold text-base md:text-lg text-navy mb-2">{visaType.name}</h3>
                            <div className="flex flex-col space-y-2 text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                              <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                                <span>Processing Time: <span className="font-medium">{visaType.processing_time}</span></span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                                <span>Fee: <span className="font-medium">{visaType.fee}</span></span>
                              </div>
                            </div>
                            
                            {visaType.visa_requirements && visaType.visa_requirements.length > 0 && (
                              <div>
                                <h4 className="font-medium text-navy mb-1.5 text-sm">Requirements:</h4>
                                <ul className="space-y-1 text-xs md:text-sm">
                                  {visaType.visa_requirements.map((req: any) => (
                                    <li key={req.id} className="flex items-start">
                                      <Check className="h-3.5 w-3.5 text-teal mt-0.5 mr-1.5 flex-shrink-0" />
                                      <span>{req.requirement_text}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          <div className="bg-indigo-50 p-4 md:p-6 flex flex-row md:flex-col justify-between md:justify-center items-center md:w-auto lg:w-64">
                            <span className="text-lg md:text-2xl font-bold text-indigo-600 mb-0 md:mb-2">{visaType.fee}</span>
                            <Button size={isMobile ? "sm" : "default"} className="w-auto md:w-full mt-0 md:mt-2">
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {visaTypes.length > 0 && (
                <div className="mt-4 md:mt-6 text-center">
                  <Button variant="outline" className="group text-sm">
                    <span>View all visa options</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              )}
            </section>
            
            {/* Documents Required Section */}
            <section className="bg-white rounded-xl md:rounded-2xl shadow-sm p-5 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-navy mb-5 md:mb-6">Required Documents</h2>
              
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
                {(requiredDocuments.length === 0 
                  ? (country.documentsRequired || [
                      'Valid passport with at least 6 months validity',
                      'Completed visa application form',
                      'Recent passport-sized photographs',
                      'Proof of accommodation',
                      'Proof of sufficient funds',
                      'Return ticket',
                      'Travel insurance'
                    ])
                  : requiredDocuments.map((doc: any) => doc.document_name)
                ).map((doc, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 md:h-5 md:w-5 text-teal flex-shrink-0 mr-2 md:mr-3 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </section>
            
            {/* Processing Timeline - Compact on mobile */}
            <section className="bg-white rounded-xl md:rounded-2xl shadow-sm p-5 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-navy mb-5 md:mb-6">Processing Timeline</h2>
              
              <div className="space-y-4 md:space-y-6">
                <div className="relative pl-6 md:pl-8 pb-4 md:pb-6 border-l-2 border-teal">
                  <div className="absolute left-[-4px] md:left-[-8px] top-0 h-3 w-3 md:h-4 md:w-4 rounded-full bg-teal"></div>
                  <h3 className="font-semibold text-navy mb-0.5 md:mb-1 text-sm md:text-base">Application Submission</h3>
                  <p className="text-gray-600 text-xs md:text-sm">Complete and submit your visa application with all required documents.</p>
                </div>
                
                <div className="relative pl-6 md:pl-8 pb-4 md:pb-6 border-l-2 border-teal">
                  <div className="absolute left-[-4px] md:left-[-8px] top-0 h-3 w-3 md:h-4 md:w-4 rounded-full bg-teal"></div>
                  <h3 className="font-semibold text-navy mb-0.5 md:mb-1 text-sm md:text-base">Document Verification</h3>
                  <p className="text-gray-600 text-xs md:text-sm">Your documents will be reviewed by our team and the embassy.</p>
                </div>
                
                <div className="relative pl-6 md:pl-8 pb-4 md:pb-6 border-l-2 border-teal">
                  <div className="absolute left-[-4px] md:left-[-8px] top-0 h-3 w-3 md:h-4 md:w-4 rounded-full bg-teal"></div>
                  <h3 className="font-semibold text-navy mb-0.5 md:mb-1 text-sm md:text-base">Processing</h3>
                  <p className="text-gray-600 text-xs md:text-sm">Your application is processed by the embassy or consulate.</p>
                </div>
                
                <div className="relative pl-6 md:pl-8">
                  <div className="absolute left-[-4px] md:left-[-8px] top-0 h-3 w-3 md:h-4 md:w-4 rounded-full bg-teal"></div>
                  <h3 className="font-semibold text-navy mb-0.5 md:mb-1 text-sm md:text-base">Visa Issuance</h3>
                  <p className="text-gray-600 text-xs md:text-sm">Receive your visa within the standard processing time of {country.processing_time || '3-5 business days'}.</p>
                </div>
              </div>
            </section>
            
            {/* Testimonials or Additional Info - Mobile-optimized */}
            <section className="bg-white rounded-xl md:rounded-2xl shadow-sm p-5 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-navy mb-5 md:mb-6">Why Choose Us</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="text-center p-3 md:p-4">
                  <div className="bg-teal/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Clock className="h-6 w-6 md:h-8 md:w-8 text-teal" />
                  </div>
                  <h3 className="font-bold text-navy mb-1 md:mb-2 text-base md:text-lg">Fast Processing</h3>
                  <p className="text-gray-600 text-xs md:text-sm">Get your visa approved quickly with our expedited service options.</p>
                </div>
                
                <div className="text-center p-3 md:p-4">
                  <div className="bg-teal/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-teal" />
                  </div>
                  <h3 className="font-bold text-navy mb-1 md:mb-2 text-base md:text-lg">100% Success Rate</h3>
                  <p className="text-gray-600 text-xs md:text-sm">Our experienced team ensures your application meets all requirements.</p>
                </div>
                
                <div className="text-center p-3 md:p-4">
                  <div className="bg-teal/10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-teal" />
                  </div>
                  <h3 className="font-bold text-navy mb-1 md:mb-2 text-base md:text-lg">24/7 Support</h3>
                  <p className="text-gray-600 text-xs md:text-sm">Our visa experts are always available to answer your questions.</p>
                </div>
              </div>
            </section>
            
            {/* FAQ Section - Condensed for mobile */}
            <section className="bg-white rounded-xl md:rounded-2xl shadow-sm p-5 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-navy mb-5 md:mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div className="border-b pb-3 md:pb-4">
                  <h3 className="font-semibold text-navy mb-1 md:mb-2 text-sm md:text-base">How long does it take to process a {country.name} visa?</h3>
                  <p className="text-gray-600 text-xs md:text-sm">Standard processing time for a {country.name} visa is {country.processing_time || '3-5 business days'}, but this can vary based on the type of visa and your specific circumstances.</p>
                </div>
                
                <div className="border-b pb-3 md:
