
import React from 'react';
import { Card } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const countries = [
  {
    id: 'usa',
    name: 'United States',
    flag: '🇺🇸',
    visaCount: 6,
  },
  {
    id: 'canada',
    name: 'Canada',
    flag: '🇨🇦',
    visaCount: 4,
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    visaCount: 5,
  },
  {
    id: 'schengen',
    name: 'Schengen Area',
    flag: '🇪🇺',
    visaCount: 3,
  },
  {
    id: 'australia',
    name: 'Australia',
    flag: '🇦🇺',
    visaCount: 4,
  },
  {
    id: 'uae',
    name: 'UAE',
    flag: '🇦🇪',
    visaCount: 3,
  },
  {
    id: 'japan',
    name: 'Japan',
    flag: '🇯🇵',
    visaCount: 2,
  },
  {
    id: 'singapore',
    name: 'Singapore',
    flag: '🇸🇬',
    visaCount: 2,
  },
];

const PopularCountries = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">Countries We Cover</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide visa services for 100+ countries worldwide. Explore our top destinations below.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {countries.map((country) => (
            <Link to={`/country/${country.id}`} key={country.id}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow p-4 cursor-pointer h-full flex flex-col">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{country.flag}</span>
                  <div>
                    <h3 className="font-medium text-navy">{country.name}</h3>
                    <p className="text-sm text-gray-500">{country.visaCount} visa types</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        
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
