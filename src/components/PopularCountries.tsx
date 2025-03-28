
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Globe, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PopularCountries = () => {
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('countries')
          .select('*')
          .order('name')
          .limit(8);
        
        if (error) {
          console.error('Error fetching countries:', error);
          toast({
            title: "Error loading countries",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        setCountries(data || []);
      } catch (err) {
        console.error('Error in fetchCountries:', err);
        toast({
          title: "Error loading countries",
          description: "Something went wrong while loading countries",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, [toast]);

  // Get country emoji flag (placeholder function)
  const getCountryEmoji = (countryName) => {
    const emojiMap = {
      'United States': '🇺🇸',
      'Canada': '🇨🇦',
      'United Kingdom': '🇬🇧',
      'Australia': '🇦🇺',
      'Japan': '🇯🇵',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Singapore': '🇸🇬',
    };
    
    return emojiMap[countryName] || '🏳️';
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">Countries We Cover</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide visa services for {countries.length}+ countries worldwide. Explore our top destinations below.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-navy-500" />
            <span className="ml-3 text-navy-700">Loading countries...</span>
          </div>
        ) : countries.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No countries available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {countries.map((country) => (
              <Link to={`/country/${country.id}`} key={country.id}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow p-4 cursor-pointer h-full flex flex-col">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getCountryEmoji(country.name)}</span>
                    <div>
                      <h3 className="font-medium text-navy">{country.name}</h3>
                      <p className="text-sm text-gray-500">{country.entry_type} visa</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
        
        <div className="text-center mt-10">
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
