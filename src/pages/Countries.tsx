import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, Loader2, Sparkles, Globe, X, Bookmark, RefreshCw, Grid, List } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CountryFilters from '@/components/countries/CountryFilters';
import CountryCard from '@/components/countries/CountryCard';
import EmptyState from '@/components/countries/EmptyState';

// Add visa package type
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

const SAMPLE_COUNTRIES = [
  {
    id: '1',
    name: 'United States',
    flag: 'https://www.countryflagicons.com/FLAT/64/US.png',
    banner: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=1200&h=600&q=80',
    description: 'The United States is a diverse country with attractions ranging from the skyscrapers of New York and Chicago, to the natural wonders of Yellowstone and Alaska, to the warm beaches of Florida and Hawaii.',
    entry_type: 'Visa Required',
    validity: '10 years',
    processing_time: '3-5 business days',
    length_of_stay: 'Up to 180 days per entry'
  },
  {
    id: '2',
    name: 'United Kingdom',
    flag: 'https://www.countryflagicons.com/FLAT/64/GB.png',
    banner: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&h=600&q=80',
    description: 'The United Kingdom offers a rich history, vibrant cities, and beautiful countryside. Visit historic landmarks in London, explore the rolling hills of the Lake District, or discover the scenic coastlines of Scotland and Wales.',
    entry_type: 'Visa Required',
    validity: '6 months',
    processing_time: '15 working days',
    length_of_stay: 'Up to 180 days'
  },
  {
    id: '3',
    name: 'Canada',
    flag: 'https://www.countryflagicons.com/FLAT/64/CA.png',
    banner: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&h=600&q=80',
    description: 'Canada is known for its stunning natural landscapes, from the Rocky Mountains to Niagara Falls. The country offers vibrant cities like Toronto and Vancouver, as well as opportunities for outdoor adventures in its many national parks.',
    entry_type: 'eTA',
    validity: '5 years',
    processing_time: '72 hours',
    length_of_stay: 'Up to 6 months'
  }
];

const CountriesPage = () => {
  const [continent, setContinent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [visaType, setVisaType] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [savedCountries, setSavedCountries] = useState<string[]>([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
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
      try {
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('Supabase key available:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
        
        // Use the anon role explicitly, avoid any potential admin role usage
        const { data, error } = await supabase
          .from('countries')
          .select('*')
          .order('name');
            
        if (error) {
          console.error('Supabase error fetching countries:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          
          // Return fallback data if database is not accessible
          console.log('Using fallback sample data instead');
          return SAMPLE_COUNTRIES;
        }
          
        console.log('Countries fetched successfully:', data?.length, data);
        return data?.length ? data : SAMPLE_COUNTRIES;
      } catch (err) {
        console.error('Error in countries query:', err);
        if (err instanceof Error) {
          console.error('Error stack:', err.stack);
        }
        
        // Return fallback data on error
        console.log('Using fallback sample data instead');
        return SAMPLE_COUNTRIES;
      }
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't keep the data in cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 5000 // Refetch every 5 seconds while the component is mounted
  });

  // Fetch visa packages to associate with countries
  const { data: visaPackages = [] } = useQuery({
    queryKey: ['visa-packages'],
    queryFn: async () => {
      try {
        console.log('Fetching visa packages...');
        
        const { data, error } = await supabase
          .from('visa_packages')
          .select('*');
            
        if (error) {
          console.error('Supabase error fetching visa packages:', error);
          return [];
        }
          
        console.log('Visa packages fetched successfully:', data?.length);
        return data || [];
      } catch (err) {
        console.error('Error in visa packages query:', err);
        return [];
      }
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
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

  // Load saved countries from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedCountries');
      if (saved) {
        setSavedCountries(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Error loading saved countries:', err);
    }
  }, []);

  // Save to localStorage when changes occur
  useEffect(() => {
    try {
      localStorage.setItem('savedCountries', JSON.stringify(savedCountries));
    } catch (err) {
      console.error('Error saving countries to localStorage:', err);
    }
  }, [savedCountries]);

  // Toggle saved country
  const toggleSaveCountry = (countryId: string) => {
    setSavedCountries(prev => {
      if (prev.includes(countryId)) {
        toast({
          title: "Removed from saved",
          description: "Country removed from your saved list",
        });
        return prev.filter(id => id !== countryId);
      } else {
        toast({
          title: "Added to saved",
          description: "Country added to your saved list",
        });
        return [...prev, countryId];
      }
    });
  };

  // Filter countries based on search term, continent, and visa type
  const filteredAndSortedCountries = useMemo(() => {
    if (!countries || countries.length === 0) return [];
    
    let result = [...countries];
    
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
      result = result.filter(country => getContinent(country.name) === continent);
    }

    // Filter by visa type
    if (visaType && visaType !== 'all') {
      result = result.filter(country => 
        country.entry_type?.toLowerCase() === visaType.toLowerCase() ||
        getVisaTypes(country).some(type => type.toLowerCase() === visaType.toLowerCase())
      );
    }
    
    return result;
  }, [searchTerm, continent, visaType, countries]);

  // Update filtered countries when computed value changes
  useEffect(() => {
    // Enhance countries with visa package data
    const countriesWithPackages = filteredAndSortedCountries.map(country => {
      const visaPackage = visaPackages.find(pkg => pkg.country_id === country.id);
      return {
        ...country,
        visaPackage
      };
    });
    
    setFilteredCountries(countriesWithPackages);
  }, [filteredAndSortedCountries, visaPackages]);

  // Get visa types for a country (placeholder function)
  const getVisaTypes = (country) => {
    return ['Tourist Visa'];
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
      'India': 'Asia',
      'China': 'Asia',
      'Brazil': 'South America',
      'Mexico': 'North America',
      'South Africa': 'Africa',
      'Nigeria': 'Africa',
      'Egypt': 'Africa',
      'Russia': 'Europe',
      'Italy': 'Europe',
      'Spain': 'Europe',
      'UAE': 'Asia',
    };
    
    return continentMap[countryName] || 'Unknown';
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setContinent('');
    setVisaType('');
    // Update URL to remove search parameter
    navigate('/countries');
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Update URL with search parameter
    if (searchTerm) {
      navigate(`/countries?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/countries');
    }
  };

  // Added error boundary render
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error loading countries</h2>
          <p className="mb-6">Something went wrong while loading countries</p>
          
          {/* Debug error information */}
          <div className="bg-red-50 p-4 rounded-md mb-6 text-left mx-auto max-w-lg">
            <p className="text-sm text-red-700 mb-2">Error details:</p>
            <pre className="text-xs overflow-auto p-2 bg-red-100 rounded">
              {error instanceof Error 
                ? `${error.name}: ${error.message}\n${error.stack}` 
                : JSON.stringify(error, null, 2)}
            </pre>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button onClick={() => refetch()} className="bg-indigo-600 hover:bg-indigo-700">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Add a fallback data notice if we are using sample data
  const usingSampleData = countries.length > 0 && countries[0].id === '1' && countries[0].name === 'United States' && countries.length === SAMPLE_COUNTRIES.length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white overflow-x-hidden">
      <Header />
      
      {usingSampleData && (
        <div className="container mx-auto px-4 py-3 mt-16">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p className="text-amber-800">
              <strong>Note:</strong> Unable to connect to the database. Showing sample data instead.
              {" "}
              <Button variant="link" className="text-amber-600 underline p-0 h-auto" onClick={() => refetch()}>
                Try connecting again
              </Button>
            </p>
          </div>
        </div>
      )}
      
      <main className="flex-grow pt-20 md:pt-24">
        {/* Hero section - more modern and professional */}
        <div className="bg-gradient-to-br from-indigo-700 via-blue-600 to-purple-700 text-white relative overflow-hidden">
          {/* 3D Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-400/30 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute top-10 right-10 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl animate-blob"></div>
            <div className="absolute bottom-10 right-1/3 w-72 h-72 bg-purple-400/30 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
            
            {/* Decorative patterns */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 bg-[size:40px_40px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]"></div>
            
            {/* Globe illustration */}
            <div className="absolute right-0 top-0 opacity-10 md:opacity-20 transform translate-x-1/4 -translate-y-1/4">
              <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <circle cx="300" cy="300" r="280" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
                <circle cx="300" cy="300" r="230" stroke="currentColor" strokeWidth="2" />
                <circle cx="300" cy="300" r="180" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M300 20 C300 580 300 580 300 20" stroke="currentColor" strokeWidth="1" />
                <path d="M20 300 C580 300 580 300 20 300" stroke="currentColor" strokeWidth="1" />
                <path d="M155 88 C445 512 445 512 155 88" stroke="currentColor" strokeWidth="1" />
                <path d="M88 445 C512 155 512 155 88 445" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
          </div>
          
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-xs font-medium text-white/90 mb-6 animate-pulse">
                <span className="flex h-2 w-2 rounded-full bg-teal-400"></span>
                <span>Explore 195+ Countries</span>
              </div>
              
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Explore Tourist Visa Requirements Worldwide
              </motion.h1>
              <motion.p 
                className="text-base md:text-xl opacity-90 max-w-2xl mx-auto mb-8 md:mb-10 text-blue-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Find the perfect destination for your next trip or relocation and get all the visa information you need.
              </motion.p>
              
              <motion.form 
                className="mt-8 relative max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                onSubmit={handleSearch}
              >
                <div className="flex flex-col md:flex-row gap-3 relative z-10">
                  <div className="relative flex-grow md:min-w-[400px]">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-300" />
                    <Input 
                      placeholder="Search countries or visa types..." 
                      className="pl-12 py-6 w-full h-14 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/70 rounded-full shadow-xl focus:ring-2 focus:ring-white/30 transition-all duration-300"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="h-14 px-8 md:px-10 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-base border-0"
                  >
                    Find Visas
                  </Button>
                </div>
                
                {/* Search bar highlight effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              </motion.form>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-2 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <span className="text-xs text-white/70 mr-1 self-center">Popular:</span>
                {['United States', 'Canada', 'Australia', 'UK', 'Japan'].map((country, index) => (
                  <Button 
                    key={country} 
                    variant="ghost" 
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs rounded-full px-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                    onClick={() => {
                      setSearchTerm(country);
                      navigate(`/countries?search=${encodeURIComponent(country)}`);
                    }}
                  >
                    {country}
                  </Button>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Modern wave divider */}
          <div className="relative h-24 md:h-32 lg:h-40">
            <svg className="absolute -bottom-px left-0 w-full fill-white" preserveAspectRatio="none" viewBox="0 0 1440 120">
              <path d="M0,96L48,80C96,64,192,32,288,26.7C384,21,480,43,576,58.7C672,75,768,85,864,80C960,75,1056,53,1152,42.7C1248,32,1344,32,1392,32L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
            </svg>
          </div>
        </div>

        {/* Tabs and filters section */}
        <div className="container mx-auto px-4 -mt-12 md:-mt-20 mb-8 md:mb-16 relative z-10">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 lg:p-8">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-navy-800">Explore Countries</h1>
                
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                  
                  {!isMobile && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setViewMode('grid')}
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        className="p-2"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => setViewMode('list')}
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        className="p-2"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <Tabs defaultValue="all" className="w-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                  <TabsList className="bg-gray-100 p-1 rounded-lg h-auto">
                    <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-white">
                      All Countries
                    </TabsTrigger>
                    <TabsTrigger value="saved" className="rounded-md data-[state=active]:bg-white">
                      Saved <Bookmark className="ml-1 h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      className="flex gap-2 md:w-auto"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter size={18} />
                      <span className="hidden md:inline">Filters</span>
                      {(searchTerm || continent || visaType) && (
                        <Badge className="ml-1 bg-indigo-600 text-white">
                          {(searchTerm ? 1 : 0) + (continent ? 1 : 0) + (visaType ? 1 : 0)}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-4"
                    >
                      <CountryFilters
                        searchTerm={searchTerm}
                        continent={continent}
                        visaType={visaType}
                        onSearchChange={setSearchTerm}
                        onContinentChange={setContinent}
                        onVisaTypeChange={setVisaType}
                        onClearFilters={clearFilters}
                        className="bg-gray-50"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <TabsContent value="all">
                  {/* All Countries Content */}
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16 md:py-20">
                      <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-indigo-500" />
                      <span className="ml-3 text-base md:text-lg text-gray-700">Loading countries...</span>
                    </div>
                  ) : filteredCountries.length === 0 ? (
                    <EmptyState 
                      searchTerm={searchTerm} 
                      onClearSearch={() => setSearchTerm('')} 
                    />
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-500">
                          Showing <span className="font-medium">{filteredCountries.length}</span> {filteredCountries.length === 1 ? 'country' : 'countries'}
                          {searchTerm && <span> for "<span className="font-medium">{searchTerm}</span>"</span>}
                          {continent && <span> in <span className="font-medium">{continent}</span></span>}
                          {visaType && <span> with <span className="font-medium">{visaType}</span> visa</span>}
                        </p>
                      </div>
                      
                      <div className={viewMode === 'grid' 
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "flex flex-col gap-4"
                      }>
                        <AnimatePresence>
                          {filteredCountries.map((country, index) => (
                            <motion.div
                              key={country.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <CountryCard 
                                country={country}
                                viewMode={viewMode}
                                isSaved={savedCountries.includes(country.id)}
                                onToggleSave={() => toggleSaveCountry(country.id)}
                                getContinent={getContinent}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="saved">
                  {/* Saved Countries Content */}
                  {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                      <span className="ml-3 text-gray-700">Loading saved countries...</span>
                    </div>
                  ) : savedCountries.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                      <Bookmark className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No saved countries</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        When you find countries you're interested in, save them here for quick access.
                      </p>
                      <Link to="/countries" className="rounded-full px-8 border border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                        Browse Countries
                      </Link>
                    </div>
                  ) : (
                    <div className={viewMode === 'grid' 
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "flex flex-col gap-4"
                    }>
                      <AnimatePresence>
                        {countries
                          .filter(country => savedCountries.includes(country.id))
                          .map((country, index) => (
                            <motion.div
                              key={country.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <CountryCard 
                                country={country}
                                viewMode={viewMode}
                                isSaved={true}
                                onToggleSave={() => toggleSaveCountry(country.id)}
                                getContinent={getContinent}
                              />
                            </motion.div>
                          ))}
                      </AnimatePresence>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* Bottom CTA */}
        <div className="container mx-auto px-4 pb-16 md:pb-24">
          <motion.div 
            className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-200/50 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-200/50 rounded-full filter blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Not sure which visa is right for you?
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto mb-8">
                Our visa experts can help you determine the best visa options for your specific needs and guide you through the application process.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact">
                  <Button variant="outline" className="rounded-full px-8 border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                    Contact an Expert
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CountriesPage;

