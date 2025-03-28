
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plane } from 'lucide-react';

// Enhanced destination data
const destinations = [
  {
    id: 'usa',
    name: 'United States',
    imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
    processingTime: '2-4 weeks',
    startingPrice: '$1,950',
    visaCount: '25K+',
    date: '29 Jun, 12:19 AM',
    directFlights: '2 direct flights from $90k'
  },
  {
    id: 'japan',
    name: 'Japan',
    imageUrl: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3',
    processingTime: '10-15 days',
    startingPrice: '$2,340',
    visaCount: '21K+',
    date: '07 May, 09:52 PM',
    directFlights: '2 direct flights from $56k'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
    processingTime: '3-5 weeks',
    startingPrice: '$3,200',
    visaCount: '11K+',
    date: '14 Apr, 10:08 PM',
    directFlights: '10 direct flights from $44k'
  },
  {
    id: 'uae',
    name: 'United Arab Emirates',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    processingTime: '2-3 weeks',
    startingPrice: '$6,500',
    visaCount: '53K+',
    date: '08 Apr, 11:42 AM',
    directFlights: '25 direct flights from $32k'
  }
];

const PopularDestinations = () => {
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
