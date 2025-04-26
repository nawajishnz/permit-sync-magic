import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar, Loader2, ArrowRight, BadgeCheck, Clock, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import type { Database } from '@/integrations/supabase/types';

type Destination = {
  id: string;
  name: string;
  imageUrl: string;
  startingPrice: number;
  visaCount: string;
  date: string;
  processingDays: number;
  hasSpecialVisa: boolean;
};

const PopularDestinations = () => {
  const { toast } = useToast();

  const { 
    data: destinations = [],
    isLoading, 
    error,
  } = useQuery<Destination[], Error>({
    queryKey: ['popularDestinations'],
    queryFn: async () => {
      console.log('Fetching popular destinations using simplified approach...');
      
      try {
        const { data: countriesData, error: countriesError } = await supabase
          .from('countries')
          .select('id, name, banner')
          .order('name')
          .limit(8);
        
        if (countriesError) {
          console.error('Countries query error:', countriesError);
          throw new Error(`Failed to fetch destinations: ${countriesError.message}`);
        }
        
        if (!countriesData || countriesData.length === 0) {
          console.log('No countries found in database');
          return [];
        }
        
        const destinationsWithPricing = await Promise.all(
          countriesData.map(async (country) => {
            const { data: packageData, error: packageError } = await supabase
              .from('visa_packages')
              .select('total_price, processing_days')
              .eq('country_id', country.id)
              .limit(1);
              
            if (packageError) {
              console.warn(`Could not fetch packages for country ${country.id}:`, packageError);
            }
            
            const visaPackage = packageData && packageData.length > 0 ? packageData[0] : null;
            const processingDays = visaPackage?.processing_days || 15;
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + processingDays);
            
            return {
              id: country.id,
              name: country.name || 'Unknown Country',
              imageUrl: country.banner || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000',
              startingPrice: visaPackage?.total_price || 1999,
              visaCount: '15K+',
              date: `Get on ${futureDate.getDate()} ${futureDate.toLocaleString('en-US', { month: 'short' })}`,
              processingDays: processingDays,
              hasSpecialVisa: country.name === 'Japan'
            };
          })
        );
        
        return destinationsWithPricing;
      } catch (err) {
        console.error('Error in data fetch:', err);
        toast({
          title: "Error loading destinations",
          description: err instanceof Error ? err.message : "Failed to load destinations",
          variant: "destructive",
        });
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  React.useEffect(() => {
    if (error) {
      console.error('Error in useQuery:', error);
      toast({
        title: "Error loading destinations",
        description: error instanceof Error ? error.message : "Failed to load destinations",
        variant: "destructive",
      });
    }
  }, [error, toast]);

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
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-3 text-gray-700">Loading destinations...</span>
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-gray-500 mb-4">No destinations available yet.</p>
            <p className="text-sm text-gray-400">
              Please check back soon for exciting new destinations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-0">
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
                      
                      <Badge className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white border-0 py-1.5 px-3 rounded-full">
                        {destination.visaCount} Visas on Time
                      </Badge>
                      
                      {destination.hasSpecialVisa && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-yellow-400/90 text-xs font-bold px-3 py-1.5 rounded-full text-navy-900 flex items-center">
                            <BadgeCheck className="w-3.5 h-3.5 mr-1" /> 
                            Sticker Visa
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute bottom-3 left-3 z-20">
                        <h3 className="font-semibold text-xl text-white">{destination.name}</h3>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span className="truncate">{destination.date}</span>
                        </div>
                        <span className="font-bold text-blue-600">₹{destination.startingPrice.toLocaleString('en-IN')}</span>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span>{destination.processingDays} business days</span>
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
            <ArrowRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularDestinations;
