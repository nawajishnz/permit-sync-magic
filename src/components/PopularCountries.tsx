
import React from 'react';
import { Card } from '@/components/ui/card';
import { Globe, Loader2, Calendar, Plane, MapPin, ArrowRight, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const PopularCountries = () => {
  const { toast } = useToast();

  // Use React Query for better caching and optimized fetching
  const { data: countries = [], isLoading, error } = useQuery({
    queryKey: ['popularCountries'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('countries')
          .select('*')
          .order('name')
          .limit(8);
        
        if (error) {
          console.error('Error fetching countries:', error);
          throw error;
        }
        
        return data || [];
      } catch (err) {
        console.error('Error in fetchCountries:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: true, // Ensure data is fresh when component mounts
  });

  // Show error toast if query fails
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading countries",
        description: error instanceof Error ? error.message : "Something went wrong while loading countries",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Get country emoji flag (placeholder function)
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
      'India': '🇮🇳',
      'China': '🇨🇳',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸'
    };
    
    return emojiMap[countryName] || '🏳️';
  };

  // Helper function to get correct flag URL format based on country name
  const getCountryFlagUrl = (country: any) => {
    // If there's already a valid flag URL stored, use that
    if (country.flag && country.flag.includes('http')) {
      return country.flag;
    }
    
    // Convert country name to ISO code for flag CDN usage
    const countryIsoMap: {[key: string]: string} = {
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

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-0">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">Countries We Cover</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide visa services for {countries.length > 0 ? countries.length + '+' : 'many'} countries worldwide. Explore our top destinations below.
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-navy-500" />
            <span className="ml-3 text-navy-700">Loading countries...</span>
          </div>
        ) : countries.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">We're working on adding more countries. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {countries.map((country, index) => {
              const { price, visaCount, entryDate, flightInfo } = getCountryDetails(country);
              
              return (
                <motion.div
                  key={country.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={`/country/${country.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col group rounded-xl border-0 shadow-md">
                      <div className="relative">
                        <AspectRatio ratio={16/9} className="bg-gray-100">
                          <img 
                            src={country.banner || `https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000`}
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
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{country.name}</h3>
                          <span className="font-bold text-blue-600">{price}</span>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span className="truncate">{entryDate}</span>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Plane className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span className="truncate">{flightInfo}</span>
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-1">
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                            {country.entry_type || 'Tourist'} visa
                          </span>
                          {country.processing_time && (
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                              {country.processing_time}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
        
        <motion.div 
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link to="/countries">
            <Button variant="outline" className="rounded-full border-gray-200 group">
              <Globe className="mr-2 h-4 w-4" />
              View all countries
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularCountries;
