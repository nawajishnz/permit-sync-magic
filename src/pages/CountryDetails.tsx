
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-navy mb-2">Loading Country Details</h1>
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-navy mb-4">Country not found</h1>
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Enhanced Banner with multiple images */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-blue-500">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        
        {/* Image Grid */}
        <div className="relative h-96">
          {images.length > 1 ? (
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
          <div className="container mx-auto max-w-7xl px-6 py-8">
            <div className="flex flex-col space-y-4 text-white">
              <Link to="/countries" className="flex items-center text-white/90 w-fit hover:text-white transition-colors">
                <ChevronLeft className="h-5 w-5 mr-1" />
                <span>Back to Countries</span>
              </Link>

              <div className="flex items-center mb-1">
                <span className="text-5xl mr-4">
                  {country.flag && country.flag.includes('http') ? (
                    <img src={country.flag} alt={country.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <span>{getCountryEmoji(country.name)}</span>
                  )}
                </span>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{country.name} Visa</h1>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center mr-4">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="font-medium">4.8</span>
                      <span className="mx-1 text-white/70">•</span>
                      <span className="text-white/70">821 Reviews</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-teal-500/90 text-white text-sm font-medium">
                      98% Success Rate
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 mt-4">
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Calendar className="h-4 w-4 mr-2 text-white/70" />
                  <span>Stay: <strong>{country.length_of_stay || 'Up to 90 days'}</strong></span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock className="h-4 w-4 mr-2 text-white/70" />
                  <span>Processing: <strong>{country.processing_time || '3-5 days'}</strong></span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Globe className="h-4 w-4 mr-2 text-white/70" />
                  <span>Entry: <strong>{country.entry_type || 'Single/Multiple'}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Two-column layout */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - scrollable content */}
          <div className="w-full lg:w-2/3 space-y-8">
            {/* Visa Overview Section */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-navy mb-6">Visa Overview</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-500 mb-2">
                    <CreditCard className="h-5 w-5 mr-2" />
                    <span className="text-sm">Visa Type:</span>
                  </div>
                  <p className="font-medium">{country.name} Visa</p>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-500 mb-2">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="text-sm">Length of Stay:</span>
                  </div>
                  <p className="font-medium">{country.length_of_stay || 'Up to 90 days'}</p>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-500 mb-2">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="text-sm">Validity:</span>
                  </div>
                  <p className="font-medium">{country.validity || 'Up to 180 days'}</p>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center text-gray-500 mb-2">
                    <Globe className="h-5 w-5 mr-2" />
                    <span className="text-sm">Entry:</span>
                  </div>
                  <p className="font-medium">{country.entry_type || 'Single/Multiple'}</p>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-600">{country.description || 'This country offers various visa options for tourists, students, workers, and immigrants. Each visa type has specific requirements and application procedures.'}</p>
              </div>
            </section>
            
            {/* Visa Types Section */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-navy mb-6">Available Visa Types</h2>
              
              {visaTypes.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-500">Visa type information coming soon</h3>
                  <p className="text-gray-400 mt-2">Our team is currently updating the available visa types</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {visaTypes.map((visaType: any) => (
                    <Card key={visaType.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="p-6 flex-1">
                            <h3 className="font-bold text-lg text-navy mb-2">{visaType.name}</h3>
                            <div className="flex flex-col space-y-2 text-sm text-gray-600 mb-4">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-indigo-600" />
                                <span>Processing Time: <span className="font-medium">{visaType.processing_time}</span></span>
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 text-indigo-600" />
                                <span>Fee: <span className="font-medium">{visaType.fee}</span></span>
                              </div>
                            </div>
                            
                            {visaType.visa_requirements && visaType.visa_requirements.length > 0 && (
                              <div>
                                <h4 className="font-medium text-navy mb-2">Requirements:</h4>
                                <ul className="space-y-1 text-sm">
                                  {visaType.visa_requirements.map((req: any) => (
                                    <li key={req.id} className="flex items-start">
                                      <Check className="h-4 w-4 text-teal mt-0.5 mr-2 flex-shrink-0" />
                                      <span>{req.requirement_text}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          <div className="bg-indigo-50 p-6 flex flex-col justify-center items-center md:w-64">
                            <span className="text-2xl font-bold text-indigo-600 mb-2">{visaType.fee}</span>
                            <Button className="w-full mt-2">
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
                <div className="mt-6 text-center">
                  <Button variant="outline" className="group">
                    <span>View all visa options</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              )}
            </section>
            
            {/* Documents Required Section */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-navy mb-6">Required Documents</h2>
              
              {requiredDocuments.length === 0 ? (
                <ul className="space-y-3">
                  {(country.documentsRequired || [
                    'Valid passport with at least 6 months validity',
                    'Completed visa application form',
                    'Recent passport-sized photographs',
                    'Proof of accommodation',
                    'Proof of sufficient funds',
                    'Return ticket',
                    'Travel insurance'
                  ]).map((doc, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-teal flex-shrink-0 mr-3 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-3">
                  {requiredDocuments.map((doc: any) => (
                    <li key={doc.id} className="flex items-start">
                      <Check className="h-5 w-5 text-teal flex-shrink-0 mr-3 mt-0.5" />
                      <span>{doc.document_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            
            {/* Processing Timeline */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-navy mb-6">Processing Timeline</h2>
              
              <div className="space-y-6">
                <div className="relative pl-8 pb-6 border-l-2 border-teal">
                  <div className="absolute left-[-8px] top-0 h-4 w-4 rounded-full bg-teal"></div>
                  <h3 className="font-semibold text-navy mb-1">Application Submission</h3>
                  <p className="text-gray-600">Complete and submit your visa application with all required documents.</p>
                </div>
                
                <div className="relative pl-8 pb-6 border-l-2 border-teal">
                  <div className="absolute left-[-8px] top-0 h-4 w-4 rounded-full bg-teal"></div>
                  <h3 className="font-semibold text-navy mb-1">Document Verification</h3>
                  <p className="text-gray-600">Your documents will be reviewed by our team and the embassy.</p>
                </div>
                
                <div className="relative pl-8 pb-6 border-l-2 border-teal">
                  <div className="absolute left-[-8px] top-0 h-4 w-4 rounded-full bg-teal"></div>
                  <h3 className="font-semibold text-navy mb-1">Processing</h3>
                  <p className="text-gray-600">Your application is processed by the embassy or consulate.</p>
                </div>
                
                <div className="relative pl-8">
                  <div className="absolute left-[-8px] top-0 h-4 w-4 rounded-full bg-teal"></div>
                  <h3 className="font-semibold text-navy mb-1">Visa Issuance</h3>
                  <p className="text-gray-600">Receive your visa within the standard processing time of {country.processing_time || '3-5 business days'}.</p>
                </div>
              </div>
            </section>
            
            {/* Testimonials or Additional Info */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-navy mb-6">Why Choose Us</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="bg-teal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-teal" />
                  </div>
                  <h3 className="font-bold text-navy mb-2">Fast Processing</h3>
                  <p className="text-gray-600 text-sm">Get your visa approved quickly with our expedited service options.</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="bg-teal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="h-8 w-8 text-teal" />
                  </div>
                  <h3 className="font-bold text-navy mb-2">100% Success Rate</h3>
                  <p className="text-gray-600 text-sm">Our experienced team ensures your application meets all requirements.</p>
                </div>
                
                <div className="text-center p-4">
                  <div className="bg-teal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-teal" />
                  </div>
                  <h3 className="font-bold text-navy mb-2">24/7 Support</h3>
                  <p className="text-gray-600 text-sm">Our visa experts are always available to answer your questions.</p>
                </div>
              </div>
            </section>
            
            {/* FAQ Section */}
            <section className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-navy mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-navy mb-2">How long does it take to process a {country.name} visa?</h3>
                  <p className="text-gray-600">Standard processing time for a {country.name} visa is {country.processing_time || '3-5 business days'}, but this can vary based on the type of visa and your specific circumstances.</p>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-navy mb-2">Can I expedite my visa application?</h3>
                  <p className="text-gray-600">Yes, we offer premium processing options that can expedite your visa application. Our Express and Premium packages include faster processing times.</p>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-navy mb-2">What happens if my visa is denied?</h3>
                  <p className="text-gray-600">If your visa is denied, we offer a 100% money-back guarantee on our service fees. We will also provide guidance on reapplying or exploring alternative options.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-navy mb-2">Do I need to visit an embassy in person?</h3>
                  <p className="text-gray-600">For most visa types, you can complete the entire application process online without visiting an embassy. However, some visa categories may require an in-person interview.</p>
                </div>
              </div>
            </section>
          </div>
          
          {/* Right column - sticky packages section */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24">
              {/* New Package Card based on the reference design */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                {/* Date selector */}
                <div className="flex mb-2">
                  <div className="flex-1 bg-indigo-600 text-white py-3 px-4 flex items-center rounded-t-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white text-indigo-600 rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{shortGuaranteedDate}</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-100 py-3 px-4 flex items-center">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <span>{previousDate}</span>
                    </div>
                  </div>
                </div>
                
                {/* Package details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy mb-2">Get Your Visa by {shortGuaranteedDate}</h3>
                  <p className="text-teal font-medium mb-4">Guaranteed approval or money back</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Processing Time</span>
                      <span className="font-medium">{visaPackage.processing_time}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Visa Type</span>
                      <span className="font-medium">{country.name} Visa</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">24/7 Support</span>
                      <span className="font-medium text-teal flex items-center">
                        <Check className="h-4 w-4 mr-1" /> Included
                      </span>
                    </div>
                  </div>
                  
                  {/* Package selector */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-700 mb-2">Select Package:</div>
                    <div className="grid grid-cols-3 gap-2">
                      {visaPackages.length > 0 ? (
                        visaPackages.map((pkg: any, index: number) => (
                          <button
                            key={pkg.id}
                            onClick={() => setSelectedPackage(index)}
                            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                              selectedPackage === index
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {pkg.name.split(' ')[0]}
                          </button>
                        ))
                      ) : (
                        <>
                          <button
                            onClick={() => setSelectedPackage(0)}
                            className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium"
                          >
                            Standard
                          </button>
                          <button
                            onClick={() => setSelectedPackage(1)}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 px-4 rounded-lg text-sm font-medium"
                          >
                            Express
                          </button>
                          <button
                            onClick={() => setSelectedPackage(2)}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 px-4 rounded-lg text-sm font-medium"
                          >
                            Premium
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Travellers counter */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Number of Travellers</span>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={handleDecreaseTravellers}
                          disabled={travellers <= 1}
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            travellers <= 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-xl font-semibold w-6 text-center">{travellers}</span>
                        <button 
                          onClick={handleIncreaseTravellers}
                          className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing */}
                  <div className="bg-gray-50 p-4 rounded-xl mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <BadgeIndianRupee className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-gray-600">Visa Fee ({travellers} {travellers === 1 ? 'person' : 'people'})</span>
                      </div>
                      <span>₹{basePrice * travellers}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <FileCheck className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-gray-600">Service Fee</span>
                      </div>
                      <span>Included</span>
                    </div>
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="text-xl font-bold text-navy">₹{totalAmount}</span>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <Link to={`/apply/${id}/${selectedPackage}`} className="w-full">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                      Start Application
                    </Button>
                  </Link>
                  
                  {/* Money Back Guarantee */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-teal mr-1" />
                      100% Money Back Guarantee if not approved
                    </p>
                  </div>
                  
                  {/* Chat support */}
                  <div className="mt-6 flex justify-center">
                    <Button variant="outline" size="sm" className="text-gray-600 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" /> Chat with Visa Expert
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Statistics Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <h3 className="font-bold text-navy mb-4">Visa Statistics</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Success Rate</span>
                    <div className="flex items-center">
                      <span className="font-medium text-teal mr-1">98%</span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full ml-2">
                        <div className="w-[98%] h-full bg-teal rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Processing</span>
                    <span className="font-medium">{country.processing_time || '3-5 days'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Visas Issued Monthly</span>
                    <span className="font-medium">5,000+</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Customer Rating</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-1">4.8</span>
                      <div className="flex text-yellow-400">
                        <Star className="h-4 w-4 fill-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400" />
                        <Star className="h-4 w-4 fill-yellow-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Help Card */}
              <div className="bg-indigo-50 rounded-2xl p-6">
                <h3 className="font-bold text-navy mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">Our visa experts are ready to assist you with any questions about your {country.name} visa application.</p>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-white">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>Live Chat</span>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start bg-white">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>Call Us</span>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start bg-white">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>Email Support</span>
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

function Phone(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function Mail(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
