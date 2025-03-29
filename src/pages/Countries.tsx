
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useLocation } from 'react-router-dom';
import { Search, Filter, MapPin, Globe, Flag, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

const CountriesPage = () => {
  const [continent, setContinent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState([]);
  const { toast } = useToast();
  const location = useLocation();
  
  // Extract search term from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);

  // Use react-query to fetch countries
  const { 
    data: countries = [], 
    isLoading, 
    isError,
    error
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
    }
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
    
    // Filter by continent (simplified approach since we don't have continent in the database)
    // In a real implementation, you would have a continent field in your database
    if (continent && continent !== 'all') {
      // This is a placeholder. For now, we're not filtering by continent
      // since that data isn't in our database
      console.log('Continent filtering not implemented yet:', continent);
    }
    
    setFilteredCountries(result);
  }, [searchTerm, continent, countries]);

  // Get visa types for a country (placeholder function)
  const getVisaTypes = (country) => {
    // This would normally come from the database
    // For now, we'll generate some based on entry_type
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-navy-500 to-navy-700 text-white">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Explore Visa Requirements Worldwide</h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
                Find the perfect destination for your next trip or relocation and get all the visa information you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link to="/visa-finder">
                  <Button variant="gradient" size="lg" className="rounded-full w-full sm:w-auto">
                    <Globe className="mr-2 h-5 w-5" />
                    View Popular Destinations
                  </Button>
                </Link>
                <Link to="/visa-finder">
                  <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-full w-full sm:w-auto">
                    Find Your Ideal Visa
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Wave divider */}
          <div className="h-24 md:h-32 bg-white relative overflow-hidden">
            <svg className="absolute -top-1 left-0 w-full text-navy-500 fill-current" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
            </svg>
          </div>
        </div>

        {/* Search and filters */}
        <div className="container mx-auto px-4 -mt-20 mb-16 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-4">
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
        <div className="container mx-auto px-4 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-700">Browse Countries</h2>
            <p className="text-gray-500">{filteredCountries.length} countries available</p>
          </div>
        </div>

        {/* Countries grid */}
        <div className="container mx-auto px-4 pb-20">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-navy-500" />
              <span className="ml-3 text-lg text-navy-700">Loading countries...</span>
            </div>
          ) : filteredCountries.length === 0 ? (
            <div className="text-center py-20">
              <Globe className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No countries found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? `No countries match "${searchTerm}"` : 'No countries available yet'}
              </p>
              {countries.length === 0 && (
                <div className="max-w-md mx-auto">
                  <p className="text-sm text-gray-500 mb-4">
                    If you're an administrator, you need to add countries in the admin dashboard.
                  </p>
                  <Link to="/admin/countries">
                    <Button variant="outline" className="mr-4">
                      Go to Admin Dashboard
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCountries.map((country) => (
                <Link to={`/country/${country.id}`} key={country.id}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 rounded-2xl border-none group">
                    <div className="relative">
                      <AspectRatio ratio={16/9} className="bg-gray-100 overflow-hidden">
                        <img 
                          src={country.banner || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000'} 
                          alt={`${country.name} landscape`} 
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
                      </AspectRatio>
                      
                      {/* Country name and continent */}
                      <div className="absolute bottom-4 left-4 z-20">
                        <h3 className="font-semibold text-xl text-white mb-1">{country.name}</h3>
                        <div className="flex items-center text-sm text-white/90 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                          <MapPin size={14} className="mr-1" /> 
                          <span>{getContinent(country.name)}</span>
                        </div>
                      </div>
                      
                      {/* Flag at top right */}
                      <div className="absolute top-3 right-3 z-20 bg-white/20 backdrop-blur-md rounded-full p-1 shadow-lg border border-white/30">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img 
                            src={getCountryFlagUrl(country)}
                            alt={`${country.name} flag`} 
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://flagcdn.com/w320/us.png';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {getVisaTypes(country).map((type, i) => (
                          <span key={i} className="text-xs bg-navy-50 text-navy-700 px-3 py-1 rounded-full">
                            {type}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
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
