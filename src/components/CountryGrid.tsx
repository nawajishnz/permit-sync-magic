
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface CountryGridProps {
  limit?: number;
}

interface CountryData {
  id: string;
  name: string;
  flag?: string;
  min_price?: number | null;
  popularity?: number;
}

const CountryGrid: React.FC<CountryGridProps> = ({ limit }) => {
  const { data: countries, isLoading, error } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const query = supabase
        .from('countries')
        .select('id, name, flag, popularity');
      
      if (limit) {
        query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data) return [];
      
      // Transform the data to include min_price with a default value
      // since the column doesn't exist in the database
      return data.map(country => ({
        ...country,
        min_price: 99 // Default price if not available
      })) as CountryData[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: limit || 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-t-lg" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {countries.map((country) => (
        <Link to={`/countries/${country.id}`} key={country.id}>
          <Card className="overflow-hidden h-full transition-shadow hover:shadow-md">
            {country.flag && (
              <div className="h-24 overflow-hidden relative">
                <img 
                  src={country.flag} 
                  alt={`Flag of ${country.name}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
              </div>
            )}
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 flex items-center justify-between">
                {country.name}
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </h3>
              <p className="text-sm text-gray-500">From ${country.min_price || 99}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default CountryGrid;
