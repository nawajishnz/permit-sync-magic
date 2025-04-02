
import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, Loader2, Sparkles, Globe, X, Bookmark } from 'lucide-react';
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

  // Load saved countries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedCountries');
    if (saved) {
      setSavedCountries(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage when changes occur
  useEffect(() => {
    localStorage.setItem('savedCountries', JSON.stringify(savedCountries));
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
    setFilteredCountries(filteredAndSortedCountries);
  }, [filteredAndSortedCountries]);

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white overflow-x-hidden">
      <Header />
      <main className="flex-grow">
        {/* Hero section - more compact on mobile */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full filter blur-3xl animate-blob"></div>
            <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-10 right-1/3 w-72 h-72 bg-indigo-400/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1 
                className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Explore Visa Requirements Worldwide
              </motion.h1>
              <motion.p 
                className="text-base md:text-xl opacity-90 max-w-2xl mx-auto mb-6 md:mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Find the perfect destination for your next trip or relocation and get all the visa information you need.
              </motion.p>
              
              <motion.form 
                className="mt-8 flex flex-col md:flex-row gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                onSubmit={handleSearch}
              >
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Search countries or visa types..." 
                    className="pl-10 w-full h-12 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/70 rounded-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="h-12 px-6 md:px-8 rounded-full bg-white text-indigo-700 hover:bg-white/90"
                >
                  Find Visas
                </Button>
              </motion.form>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-2 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {['United States', 'Canada', 'Australia', 'UK', 'Japan'].map((country, index) => (
                  <Button 
                    key={country} 
                    variant="ghost" 
                    className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs"
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

          {/* Wave divider */}
          <div className="h-16 md:h-24 lg:h-32 bg-white relative overflow-hidden">
            <svg className="absolute -top-1 left-0 w-full text-indigo-600 fill-current" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
            </svg>
          </div>
        </div>

        {/* Tabs and filters section */}
        <div className="container mx-auto px-4 -mt-12 md:-mt-20 mb-8 md:mb-16 relative z-10">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6 lg:p-8">
            <div className="flex flex-col space-y-4">
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
                      size="sm"
                      className="rounded-md"
                      onClick={() => setViewMode('grid')}
                    >
                      <div className={`p-1 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-md"
                      onClick={() => setViewMode('list')}
                    >
                      <div className={`p-1 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="rounded-full flex gap-2 md:w-auto"
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
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const allTab = document.querySelector('[data-state="inactive"][value="all"]');
                          if (allTab instanceof HTMLElement) {
                            allTab.click();
                          }
                        }}
                      >
                        Browse Countries
                      </Button>
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
                <Link to="/visa-finder">
                  <Button className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 shadow-md">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Find My Ideal Visa
                  </Button>
                </Link>
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
