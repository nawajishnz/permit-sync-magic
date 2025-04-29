
import { useQueryClient } from '@tanstack/react-query';

export const useCountryQueries = (queryClient?: any) => {
  const localQueryClient = useQueryClient();
  const activeClient = queryClient || localQueryClient;
  
  const invalidateQueries = (countryId: string) => {
    // Invalidate all relevant queries to ensure fresh data
    activeClient.invalidateQueries({ queryKey: ['adminCountries'] });
    activeClient.invalidateQueries({ queryKey: ['countryDetail'] });
    activeClient.invalidateQueries({ queryKey: ['countries'] });
    activeClient.invalidateQueries({ queryKey: ['countryVisaPackage'] });
    activeClient.invalidateQueries({ queryKey: ['documents'] });
    activeClient.invalidateQueries({ queryKey: ['popularDestinations'] });
    
    // Invalidate country-specific queries
    if (countryId) {
      activeClient.invalidateQueries({ queryKey: ['country', countryId] });
      activeClient.invalidateQueries({ queryKey: ['countryDetail', countryId] });
      activeClient.invalidateQueries({ queryKey: ['documents', countryId] });
      activeClient.invalidateQueries({ queryKey: ['countryVisaPackage', countryId] });
    }
  };
  
  return {
    invalidateQueries,
    queryClient: activeClient
  };
};
