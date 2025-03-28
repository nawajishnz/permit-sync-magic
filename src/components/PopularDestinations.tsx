
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

// Popular destination data
const destinations = [
  {
    id: 'usa',
    name: 'United States',
    imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
    processingTime: '2-4 weeks',
    startingPrice: '$149'
  },
  {
    id: 'schengen',
    name: 'Schengen Area',
    imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9357976b82',
    processingTime: '10-15 days',
    startingPrice: '$99'
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    processingTime: '3-5 weeks',
    startingPrice: '$129'
  },
  {
    id: 'canada',
    name: 'Canada',
    imageUrl: 'https://images.unsplash.com/photo-1517935706615-2717063c2225',
    processingTime: '2-3 weeks',
    startingPrice: '$119'
  }
];

const PopularDestinations = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">Popular Destinations</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our most requested visa services. Fast processing times with high approval rates.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <Link to={`/country/${destination.id}`} key={destination.id}>
              <Card className="overflow-hidden card-hover h-full">
                <div className="relative h-48 w-full">
                  <img 
                    src={destination.imageUrl} 
                    alt={destination.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-white font-bold text-xl">{destination.name}</h3>
                </div>
                <CardContent className="pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Processing Time</span>
                    <span className="font-medium">{destination.processingTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Starting from</span>
                    <span className="text-teal font-bold text-lg">{destination.startingPrice}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link to="/countries" className="text-teal hover:text-teal-600 font-medium inline-flex items-center">
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
