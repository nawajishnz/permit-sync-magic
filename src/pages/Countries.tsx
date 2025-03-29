
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Link, useLocation } from 'react-router-dom';
import { Search, Filter, MapPin, Globe, Flag, Loader2, Calendar, Plane, BadgeCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const CountriesPage = () => {
  const [continent, setContinent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState([]);
  const { toast } = useToast();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Extract search term from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);

  // Use react-query to fetch countries with better caching
  const { 
    data: countries = [], 
    isLoading, 
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      console.log('Fetching countries from the database...');
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name');
          
      if (error) {
        console.error('Error fetching countries:', error);
        throw error;
      }
        
      console.log('Countries fetched:', data?.length);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minute cache
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: true, // Ensure fresh data on component mount
  });

  // Show error toast if query fails
  useEffect(() => {
    if (isError && error instanceof Error) {
      toast({
        title: "Error loading countries",
        description: error.message || "Failed to load countries data",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  // Filter countries based on search term and continent
  useEffect(() => {
    let result = countries;
    
    // Filter by search term
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(country => 
        country.name?.toLowerCase().includes(lowerCaseSearch) ||
        country.entry_type?.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // Filter by continent
    if (continent && continent !== 'all') {
      console.log('Continent filtering not implemented yet:', continent);
    }
    
    setFilteredCountries(result);
  }, [searchTerm, continent, countries]);

  // Get visa types for a country (placeholder function)
  const getVisaTypes = (country) => {
    const visaType = country.entry_type || 'Tourist';
    return [visaType, 'Business', 'Student'];
  };

  // Determine continent based on country name (placeholder)
  const getContinent = (countryName) => {
    const continentMap = {
      'United States': 'North America',
      'Canada': 'North America',
      'United Kingdom': 'Europe',
      'Australia': 'Oceania',
      'Japan': 'Asia',
      'Germany': 'Europe',
      'France': 'Europe',
      'Singapore': 'Asia',
    };
    
    return continentMap[countryName] || 'Unknown';
  };

  // Helper function to get correct flag URL format based on country name
  const getCountryFlagUrl = (country) => {
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
    
    const isoCode = countryIsoMap[country.name] || 'xx';
    return `https://flagcdn.com/w320/${isoCode.toLowerCase()}.png`;
  };

  // Generate faux prices and visa numbers for display
  const getCountryDetails = (country: any) => {
    // Create realistic looking but fictional price based on country
    let price = '';
    let visaCount = '';
    let entryDate = '';
    let flightInfo = '';
    
    switch(country.name) {
      case 'United States':
        price = '₹11,950';
        visaCount = '25K+';
        entryDate = 'Get on 29 Jun, 11:48 PM';
        flightInfo = '2 direct flights from ₹90k';
        break;
      case 'Japan':
        price = '₹2,340';
        visaCount = '21K+';
        entryDate = 'Get on 08 May, 09:52 PM';
        flightInfo = '2 direct flights from ₹56k';
        break;
      case 'Singapore':
        price = '₹3,200';
        visaCount = '11K+';
        entryDate = 'Get on 14 Apr, 10:08 PM';
        flightInfo = '10 direct flights from ₹44k';
        break;
      case 'Australia':
        price = '₹10,500';
        visaCount = '7K+';
        entryDate = 'Get on 28 Apr, 11:14 PM';
        flightInfo = '1 direct flight from ₹99k';
        break;
      default:
        // Generate some plausible values for other countries
        const priceBase = Math.floor(Math.random() * 5 + 1) * 1000;
        price = `₹${priceBase.toLocaleString('en-IN')}`;
        const visaBase = Math.floor(Math.random() * 20 + 5);
        visaCount = `${visaBase}K+`;
        
        // Random date within next 3 months
        const date = new Date();
        date.setDate(date.getDate() + Math.floor(Math.random() * 90));
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const hours = Math.floor(Math.random() * 12 + 1);
        const minutes = Math.floor(Math.random() * 60);
        const ampm = Math.random() > 0.5 ? 'AM' : 'PM';
        entryDate = `Get on ${day} ${month}, ${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
        
        // Random flight info
        const flightCount = Math.floor(Math.random() * 8 + 1);
        const flightPrice = Math.floor(Math.random() * 50 + 20);
        flightInfo = `${flightCount} direct flight${flightCount > 1 ? 's' : ''} from ₹${flightPrice}k`;
    }
    
    return { price, visaCount, entryDate, flightInfo };
  };

  // Force refetch if countries array is empty
  useEffect(() => {
    if (!isLoading && countries.length === 0) {
      // Auto-retry after a short delay
      const timer = setTimeout(() => {
        console.log('Auto-retrying countries fetch due to empty results');
        refetch();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [countries, isLoading, refetch]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white overflow-x-hidden">
      <Header />
      <main className="flex-grow">
        {/* Hero section - more compact on mobile */}
        <div className="bg-gradient-to-r from-navy-500 to-navy-700 text-white">
          <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight">Explore Visa Requirements Worldwide</h1>
              <p className="text-base md:text-xl opacity-90 max-w-2xl mx-auto mb-6 md:mb-8">
                Find the perfect destination for your next trip or relocation and get all the visa information you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mt-6 md:mt-8">
                <Link to="/visa-finder">
                  <Button variant="gradient" size={isMobile ? "default" : "lg"} className="rounded-full w-full sm:w-auto">
                    <Globe className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    View Popular Destinations
                  </Button>
                </Link>
                <Link to="/visa-finder">
                  <Button variant="outline" size={isMobile ? "default" : "lg"} className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-full w-full sm:w-auto mt-3 sm:mt-0">
                    Find Your Ideal Visa
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Wave divider */}
          <div className="h-16 md:h-24 lg:h-32 bg-white relative overflow-hidden">
            <svg className="absolute -top-1 left-0 w-full text-navy-500 fill-current" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
            </svg>
          </div>
        </div>

        {/* Search and filters - stacked on mobile */}
        <div className="container mx-auto px-4 -mt-12 md:-mt-20 mb-8 md:mb-16 relative z-10">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search countries..." 
                  className="pl-10 w-full rounded-full border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={continent} onValueChange={setContinent}>
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Continent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Continents</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="south-america">South America</SelectItem>
                    <SelectItem value="africa">Africa</SelectItem>
                    <SelectItem value="oceania">Oceania</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="rounded-full flex gap-2 md:w-auto">
                <Filter size={18} />
                <span>More Filters</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Section title */}
        <div className="container mx-auto px-4 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-xl md:text-3xl font-bold text-navy-700 mb-2 sm:mb-0">Browse Countries</h2>
            <p className="text-gray-500 text-sm md:text-base">{filteredCountries.length} countries available</p>
          </div>
        </div>

        {/* Countries grid */}
        <div className="container mx-auto px-4 pb-12 md:pb-20">
          {isLoading ? (
            <div className="flex justify-center items-center py-16 md:py-20">
              <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-navy-500" />
              <span className="ml-3 text-base md:text-lg text-navy-700">Loading countries...</span>
            </div>
          ) : filteredCountries.length === 0 ? (
            <div className="text-center py-16 md:py-20">
              <Globe className="h-12 w-12 md:h-16 md:w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">No countries found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? `No countries match "${searchTerm}"` : 'We\'re updating our database with new countries. Please check back soon!'}
              </p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm('')} variant="outline">
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCountries.map((country, index) => {
                const { price, visaCount, entryDate, flightInfo } = getCountryDetails(country);
                
                return (
                  <motion.div
                    key={country.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Link to={`/country/${country.id}`}>
                      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer rounded-xl border-none shadow-md group">
                        <div className="relative">
                          <AspectRatio ratio={16/9} className="bg-gray-100">
                            <img 
                              src={country.banner || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000'} 
                              alt={country.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
                          </AspectRatio>
                          
                          {/* Visa count badge */}
                          <Badge className="absolute top-3 left-3 bg-blue-600/90 text-white border-0 py-1.5 px-3 rounded-full backdrop-blur-sm">
                            {visaCount} Visas on Time
                          </Badge>
                          
                          {/* Special label for certain countries */}
                          {country.name === 'Japan' && (
                            <div className="absolute top-3 right-3">
                              <div className="bg-yellow-400/90 text-xs font-bold px-3 py-1.5 rounded-full text-navy-900 flex items-center">
                                <BadgeCheck className="w-3.5 h-3.5 mr-1" /> 
                                Sticker Visa
                              </div>
                            </div>
                          )}
                          
                          {/* Country name and continent */}
                          <div className="absolute bottom-3 left-3 z-20">
                            <h3 className="font-semibold text-xl text-white mb-1">{country.name}</h3>
                            <div className="flex items-center text-sm text-white/90 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                              <MapPin size={12} className="mr-1" /> 
                              <span>{getContinent(country.name)}</span>
                            </div>
                          </div>
                          
                          {/* Flag at top right */}
                          <div className="absolute bottom-3 right-3 z-20 bg-white/20 backdrop-blur-md rounded-full p-1 shadow-lg border border-white/30">
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <img 
                                src={getCountryFlagUrl(country)}
                                alt={`${country.name} flag`} 
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/320x160?text=Flag';
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                              <span className="truncate">{entryDate}</span>
                            </div>
                            <span className="font-bold text-blue-600">{price}</span>
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <Plane className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                            <span className="truncate">{flightInfo}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {getVisaTypes(country).map((type, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {/* Pagination or load more */}
          {filteredCountries.length > 0 && (
            <div className="mt-12 text-center">
              <Button variant="outline" className="rounded-full border-gray-200 px-8">
                Load More Countries
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CountriesPage;
