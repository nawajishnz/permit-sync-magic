
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin } from 'lucide-react';

const CountriesPage = () => {
  // Sample countries data - this would typically come from an API
  const countries = [
    { id: 1, name: 'United States', continent: 'North America', flagUrl: 'https://flagcdn.com/w320/us.png', visaTypes: ['Tourist', 'Business', 'Student'] },
    { id: 2, name: 'Canada', continent: 'North America', flagUrl: 'https://flagcdn.com/w320/ca.png', visaTypes: ['Tourist', 'Work', 'Express Entry'] },
    { id: 3, name: 'United Kingdom', continent: 'Europe', flagUrl: 'https://flagcdn.com/w320/gb.png', visaTypes: ['Visitor', 'Skilled Worker', 'Student'] },
    { id: 4, name: 'Australia', continent: 'Oceania', flagUrl: 'https://flagcdn.com/w320/au.png', visaTypes: ['Tourist', 'Work Holiday', 'Skilled Migration'] },
    { id: 5, name: 'Japan', continent: 'Asia', flagUrl: 'https://flagcdn.com/w320/jp.png', visaTypes: ['Tourist', 'Work', 'Student'] },
    { id: 6, name: 'Germany', continent: 'Europe', flagUrl: 'https://flagcdn.com/w320/de.png', visaTypes: ['Schengen', 'Work', 'Student'] },
    { id: 7, name: 'France', continent: 'Europe', flagUrl: 'https://flagcdn.com/w320/fr.png', visaTypes: ['Schengen', 'Long Stay', 'Student'] },
    { id: 8, name: 'Singapore', continent: 'Asia', flagUrl: 'https://flagcdn.com/w320/sg.png', visaTypes: ['Tourist', 'Work', 'Dependent'] },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-navy text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Browse Countries</h1>
            <p className="text-lg opacity-90 max-w-2xl">
              Explore visa requirements for countries around the world and find the perfect destination for your next trip or relocation.
            </p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search countries..." 
                className="pl-10 w-full"
              />
            </div>
            <Button variant="outline" className="flex gap-2">
              <Filter size={18} />
              <span>Filter</span>
            </Button>
          </div>

          {/* Countries grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {countries.map((country) => (
              <Link to={`/country/${country.id}`} key={country.id}>
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow card-hover">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={country.flagUrl} 
                      alt={`${country.name} flag`} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg">{country.name}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin size={14} className="mr-1" /> 
                        <span>{country.continent}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {country.visaTypes.map((type, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CountriesPage;
