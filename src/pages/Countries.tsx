
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const [continent, setContinent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-navy-500 to-navy-700 text-white">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Explore Visa Requirements Worldwide</h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
                Find the perfect destination for your next trip or relocation and get all the visa information you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button variant="gradient" size="lg" className="rounded-full">
                  <Globe className="mr-2 h-5 w-5" />
                  View Popular Destinations
                </Button>
                <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-full">
                  Find Your Ideal Visa
                </Button>
              </div>
            </div>
          </div>

          {/* Wave divider */}
          <div className="h-24 md:h-32 bg-white relative overflow-hidden">
            <svg className="absolute -top-1 left-0 w-full text-navy-500 fill-current" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"></path>
            </svg>
          </div>
        </div>

        {/* Search and filters */}
        <div className="container mx-auto px-4 -mt-20 mb-16 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search countries..." 
                  className="pl-10 w-full rounded-full border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={continent} onValueChange={setContinent}>
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Continent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Continents</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="south-america">South America</SelectItem>
                    <SelectItem value="africa">Africa</SelectItem>
                    <SelectItem value="oceania">Oceania</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="rounded-full flex gap-2 md:w-auto">
                <Filter size={18} />
                <span>More Filters</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Section title */}
        <div className="container mx-auto px-4 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-700">Browse Countries</h2>
            <p className="text-gray-500">{countries.length} countries available</p>
          </div>
        </div>

        {/* Countries grid */}
        <div className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {countries.map((country) => (
              <Link to={`/country/${country.id}`} key={country.id}>
                <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 rounded-2xl border-none">
                  <div className="aspect-video relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 z-10" />
                    <img 
                      src={country.flagUrl} 
                      alt={`${country.name} flag`} 
                      className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute bottom-4 left-4 z-20">
                      <div className="flex items-center text-sm text-white bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                        <MapPin size={14} className="mr-1" /> 
                        <span>{country.continent}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg text-navy-700 mb-3">{country.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {country.visaTypes.map((type, i) => (
                        <span key={i} className="text-xs bg-navy-50 text-navy-700 px-3 py-1 rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          {/* Pagination or load more */}
          <div className="mt-12 text-center">
            <Button variant="outline" className="rounded-full border-gray-200 px-8">
              Load More Countries
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CountriesPage;
