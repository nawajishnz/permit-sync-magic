
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plane, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

const PopularDestinations = () => {
  const { toast } = useToast();

  // Use react-query to fetch destinations
  const { 
    data: destinations = [],
    isLoading, 
    error,
  } = useQuery({
    queryKey: ['popularDestinations'],
    queryFn: async () => {
      console.log('Fetching popular destinations from Supabase...');
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('name')
        .limit(4);
      
      if (error) {
        console.error('Error fetching destinations:', error);
        throw error;
      }
      
      console.log('Destinations fetched:', data?.length);
      
      // Transform the data to match the expected format
      return data.map(country => ({
        id: country.id,
        name: country.name,
        imageUrl: country.banner || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000',
        processingTime: country.processing_time || '2-4 weeks',
        startingPrice: country.name === 'United States' ? '$1,950' :
                      country.name === 'Japan' ? '$2,340' :
                      country.name === 'Singapore' ? '$3,200' : '$1,800',
        visaCount: country.name === 'United States' ? '25K+' :
                  country.name === 'Japan' ? '21K+' :
                  country.name === 'Singapore' ? '11K+' : '15K+',
        date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        directFlights: country.name === 'United States' ? '2 direct flights from $90k' :
                      country.name === 'Japan' ? '2 direct flights from $56k' :
                      country.name === 'Singapore' ? '10 direct flights from $44k' : '5 direct flights from $60k'
      }));
    },
    // Add error handling
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Show toast if error occurs
  useEffect(() => {
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-navy">Popular Destinations</h2>
          <div className="flex space-x-2">
            <button className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full font-medium text-sm">All</button>
            <button className="text-gray-500 px-4 py-1 rounded-full font-medium text-sm hover:bg-gray-100">Instant</button>
            <button className="text-gray-500 px-4 py-1 rounded-full font-medium text-sm hover:bg-gray-100">In a week</button>
            <button className="text-gray-500 px-4 py-1 rounded-full font-medium text-sm hover:bg-gray-100">In a month</button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-3 text-gray-700">Loading destinations...</span>
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No destinations available yet.</p>
            <p className="text-sm text-gray-400">
              Check the Supabase database to ensure countries are added in the 'countries' table.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((destination) => (
              <Link to={`/country/${destination.id}`} key={destination.id}>
                <Card className="overflow-hidden h-full rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <div className="relative h-64 w-full overflow-hidden">
                      <img 
                        src={destination.imageUrl} 
                        alt={destination.name}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
                    </div>
                    
                    {/* Visa count badge */}
                    <Badge className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-sm text-white border-0 py-1.5">
                      {destination.visaCount} Visas on Time
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg">{destination.name}</h3>
                      <span className="text-indigo-700 font-bold">{destination.startingPrice}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <span>Get on</span>
                        <span className="text-indigo-600 font-medium">{destination.date}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Plane className="h-3.5 w-3.5 mr-1" />
                      <span>{destination.directFlights}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        
        <div className="text-center mt-10">
          <Link to="/countries" className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center">
            View all destinations
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
