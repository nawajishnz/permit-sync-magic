import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BadgeCheck, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CountryGridProps {
  limit?: number;
}

interface CountryData {
  id: string;
  name: string;
  banner: string;
  total_price: number;
  processing_days: number;
  has_special_visa: boolean;
}

const CountryGrid: React.FC<CountryGridProps> = ({ limit }) => {
  const { data: countries, isLoading, error } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      try {
        const query = supabase
          .from('countries')
          .select('id, name, banner')
          .order('name');
        
        if (limit) {
          query.limit(limit);
        }
        
        const { data: countriesData, error: countriesError } = await query;
        
        if (countriesError) {
          console.error("Supabase query error:", countriesError);
          throw countriesError;
        }
        
        if (!countriesData) return [];
        
        const countriesWithData = await Promise.all(
          countriesData.map(async (country) => {
            const { data: packageData } = await supabase
              .from('visa_packages')
              .select('total_price, processing_days')
              .eq('country_id', country.id)
              .limit(1);
            
            const visaPackage = packageData && packageData[0];
            
            return {
              ...country,
              total_price: visaPackage?.total_price || 1999,
              processing_days: visaPackage?.processing_days || 15,
              has_special_visa: country.name === 'Japan'
            };
          })
        );
        
        return countriesWithData;
      } catch (err) {
        console.error("Error in countries query:", err);
        throw err;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: limit || 6 }).map((_, i) => (
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
    );
  }

  if (error || !countries) {
    return (
      <div className="text-center p-4 bg-red-50 text-red-600 rounded">
        Failed to load countries. Please try again later.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {countries.map((country, index) => (
        <motion.div
          key={country.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Link to={`/country/${country.id}`}>
            <Card className="overflow-hidden h-full rounded-xl border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="relative">
                <AspectRatio ratio={16/9} className="bg-gray-100">
                  <img 
                    src={country.banner} 
                    alt={country.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
                </AspectRatio>
                
                {country.has_special_visa && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-yellow-400/90 text-xs font-bold px-3 py-1.5 rounded-full text-navy-900 flex items-center">
                      <BadgeCheck className="w-3.5 h-3.5 mr-1" /> 
                      Sticker Visa
                    </div>
                  </div>
                )}
                
                <div className="absolute bottom-3 left-3 z-20">
                  <h3 className="font-semibold text-xl text-white">{country.name}</h3>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-indigo-500" />
                    <span>{country.processing_days} business days</span>
                  </div>
                  <span className="font-bold text-blue-600">₹{country.total_price.toLocaleString('en-IN')}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default CountryGrid;
