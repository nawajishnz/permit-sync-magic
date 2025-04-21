import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plane, Loader2, ArrowRight, BadgeCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import type { Database } from '@/integrations/supabase/types';

type CountryWithPackages = Database['public']['Tables']['countries']['Row'] & {
  visa_packages: Array<Database['public']['Tables']['visa_packages']['Row']>
};

type Destination = {
  id: string;
  name: string;
  imageUrl: string;
  startingPrice: string;
  visaCount: string;
  date: string;
  directFlights: string;
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
        // Simple direct query - no RPC, no complex joins
        const { data, error } = await supabase
          .from('countries')
          .select('id, name, banner')
          .order('name')
          .limit(8);
        
        if (error) {
          console.error('Countries query error:', error);
          throw new Error(`Failed to fetch destinations: ${error.message}`);
        }
        
        if (!data || data.length === 0) {
          console.log('No countries found in database');
          return [];
        }
        
        console.log('Successfully fetched countries:', data);
        
        // Now fetch visa packages separately for each country
        const destinationsWithPricing = await Promise.all(
          data.map(async (country) => {
            // Try to fetch visa package for this country
            const { data: packageData, error: packageError } = await supabase
              .from('visa_packages')
              .select('government_fee, service_fee, processing_days')
              .eq('country_id', country.id)
              .limit(1);
              
            if (packageError) {
              console.warn(`Could not fetch packages for country ${country.id}:`, packageError);
            }
            
            // Set default pricing if no package found
            const visaPackage = packageData && packageData.length > 0 ? packageData[0] : null;
            const governmentFee = visaPackage?.government_fee ?? 0;
            const serviceFee = visaPackage?.service_fee ?? 0;
            const totalPrice = governmentFee + serviceFee || 1999;
            
            return {
              id: country.id,
              name: country.name || 'Unknown Country',
              imageUrl: country.banner || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000',
              startingPrice: `₹${totalPrice.toLocaleString('en-IN')}`,
              visaCount: '15K+',
              date: `Get on ${new Date().getDate() + Math.floor(Math.random() * 90)} ${new Date().toLocaleString('en-US', { month: 'short' })}`,
              directFlights: '5 direct flights from ₹60k',
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

  // Show toast if error occurs
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
                      
                      {/* Visa count badge */}
                      <Badge className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white border-0 py-1.5 px-3 rounded-full">
                        {destination.visaCount} Visas on Time
                      </Badge>
                      
                      {/* Special label for certain countries */}
                      {destination.hasSpecialVisa && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-yellow-400/90 text-xs font-bold px-3 py-1.5 rounded-full text-navy-900 flex items-center">
                            <BadgeCheck className="w-3.5 h-3.5 mr-1" /> 
                            Sticker Visa
                          </div>
                        </div>
                      )}
                      
                      {/* Country name at bottom */}
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
                        <span className="font-bold text-blue-600">{destination.startingPrice}</span>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Plane className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">{destination.directFlights}</span>
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
