
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useCountriesQuery = () => {
  return useQuery({
    queryKey: ['adminCountries'],
    queryFn: async () => {
      console.log('Fetching countries data');
      
      try {
        // First test if supabase connection is working
        console.log('Testing supabase connection...');
        const { data: testData, error: testError } = await supabase
          .from('countries')
          .select('count')
          .limit(1);
          
        if (testError) {
          console.error('Supabase connection test failed:', testError);
          throw testError;
        }
        
        console.log('Supabase connection test successful:', testData);
        
        const { data: countriesData, error: countriesError } = await supabase
          .from('countries')
          .select('*');
          
        if (countriesError) {
          console.error('Error fetching countries:', countriesError);
          throw countriesError;
        }
        
        console.log('Countries data fetched:', countriesData?.length || 0, 'countries');
        
        if (!countriesData || countriesData.length === 0) {
          console.warn('No countries found in database');
          return [];
        }
        
        const countriesWithPackages = await Promise.all(
          countriesData.map(async (country) => {
            try {
              const { data: packageData } = await supabase
                .from('visa_packages')
                .select('*')
                .eq('country_id', country.id)
                .maybeSingle();
                
              return {
                ...country,
                visa_packages: packageData ? [packageData] : [],
                has_visa_package: !!packageData
              };
            } catch (err) {
              console.warn(`Could not fetch package for country ${country.id}:`, err);
              return {
                ...country,
                visa_packages: [],
                has_visa_package: false
              };
            }
          })
        );
        
        console.log('Fetched countries with packages:', countriesWithPackages);
        return countriesWithPackages;
      } catch (err) {
        console.error('Error in countries query function:', err);
        throw err;
      }
    },
    staleTime: 0, // Don't cache this data
    retry: 2, // Try up to 3 times (initial + 2 retries)
    refetchOnMount: true, // Always fetch fresh data when component mounts
    refetchOnWindowFocus: true // Refresh when window regains focus
  });
};
