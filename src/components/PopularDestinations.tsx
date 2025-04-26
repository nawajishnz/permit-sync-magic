import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Clock, Plane, MapPin, ChevronRight, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getCountryVisaPackage } from '@/services/visaPackageService';

type Destination = {
  id: string;
  name: string;
  imageUrl: string;
  totalPrice: number;
  processingDays: number;
  hasSpecialVisa: boolean;
};

const PopularDestinations = () => {
  const { toast } = useToast();

  const { 
    data: destinations = [],
    isLoading,
    error 
  } = useQuery<Destination[], Error>({
    queryKey: ['popularDestinations'],
    queryFn: async () => {
      try {
        const { data: countriesData, error: countriesError } = await supabase
          .from('countries')
          .select('id, name, banner')
          .order('name')
          .limit(8);

        if (countriesError) throw countriesError;

        if (!countriesData) return [];

        const destinationsWithPricing = await Promise.all(
          countriesData.map(async (country) => {
            const packageData = await getCountryVisaPackage(country.id);
            
            return {
              id: country.id,
              name: country.name,
              imageUrl: country.banner || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000',
              totalPrice: packageData?.total_price || packageData?.service_fee + packageData?.government_fee || 1999,
              processingDays: packageData?.processing_days || 15,
              hasSpecialVisa: country.name === 'Japan'
            };
          })
        );

        return destinationsWithPricing;
      } catch (err) {
        console.error('Error fetching destinations:', err);
        throw err;
      }
    },
  });

  const getCountryFlagUrl = (countryName: string) => {
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
    
    const isoCode = countryIsoMap[countryName] || 'xx';
    return `https://flagcdn.com/w320/${isoCode.toLowerCase()}.png`;
  };

  return (
    <section className="pt-2 pb-8">
      <div className="container mx-auto">
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-navy">Popular Destinations</h2>
        </motion.div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <AspectRatio ratio={16/9}>
                  <div className="w-full h-full bg-gray-200 rounded-t-lg" />
                </AspectRatio>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-gray-500 mb-4">No destinations available yet.</p>
            <p className="text-sm text-gray-400">Please check back soon for exciting new destinations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {destinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/country/${destination.id}`}>
                  <Card className="overflow-hidden h-full rounded-xl border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
                    <div className="relative">
                      <AspectRatio ratio={16/9} className="bg-gray-100">
                        <img 
                          src={destination.imageUrl}
                          alt={destination.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
                      </AspectRatio>
                      
                      <div className="absolute bottom-3 left-3 z-20">
                        <h3 className="font-semibold text-xl text-white">{destination.name}</h3>
                      </div>
                      
                      <div className="absolute bottom-3 right-3 z-20 bg-white/20 backdrop-blur-md rounded-full p-1 shadow-lg border border-white/30">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img 
                            src={getCountryFlagUrl(destination.name)}
                            alt={`${destination.name} flag`} 
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/320x160?text=Flag';
                            }}
                          />
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-11 right-3 z-20 h-8 w-8 p-0 bg-black/30 text-white hover:bg-black/40 hover:text-white backdrop-blur-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          // Save functionality can be added here
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-indigo-500" />
                          <span>{destination.processingDays} business days</span>
                        </div>
                        <span className="font-bold text-blue-600">₹{destination.totalPrice.toLocaleString('en-IN')}</span>
                      </div>
                      
                      <div className="mt-auto">
                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                            Tourist Visa
                          </span>
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        
        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/countries" className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center group">
            View all destinations
            <ChevronRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularDestinations;
