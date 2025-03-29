
import React from 'react';
import { Card } from '@/components/ui/card';
import { Globe, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

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

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 sm:px-0">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">Countries We Cover</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide visa services for {countries.length > 0 ? countries.length + '+' : 'many'} countries worldwide. Explore our top destinations below.
          </p>
        </div>
        
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {countries.map((country) => (
              <Link to={`/country/${country.id}`} key={country.id}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow p-4 cursor-pointer h-full flex flex-col group">
                  <div className="flex items-center space-x-3">
                    {country.flag && country.flag.includes('http') ? (
                      <img 
                        src={country.flag} 
                        alt={country.name} 
                        className="w-10 h-10 rounded-full object-cover transition-transform group-hover:scale-110" 
                      />
                    ) : (
                      <span className="text-3xl">{getCountryEmoji(country.name)}</span>
                    )}
                    <div>
                      <h3 className="font-medium text-navy">{country.name}</h3>
                      <p className="text-sm text-gray-500">{country.entry_type || 'Tourist'} visa</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
        
        <div className="text-center mt-8">
          <Link to="/countries" className="inline-flex items-center text-teal hover:text-teal-600 font-medium">
            <Globe className="mr-2 h-4 w-4" />
            View all countries
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularCountries;
