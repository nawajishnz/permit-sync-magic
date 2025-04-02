
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Plane, BadgeCheck, MapPin, Heart, ChevronRight, Check, Clock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

type CountryCardProps = {
  country: any;
  viewMode: 'grid' | 'list';
  isSaved: boolean;
  onToggleSave: () => void;
  getContinent: (countryName: string) => string;
};

const CountryCard = ({ country, viewMode, isSaved, onToggleSave, getContinent }: CountryCardProps) => {
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

  // Generate faux prices and visa numbers for display
  const getCountryDetails = (country: any) => {
    // Create realistic looking but fictional price based on country
    let price = '';
    let visaCount = '';
    let entryDate = '';
    let flightInfo = '';
    let processingTime = '';
    
    switch(country.name) {
      case 'United States':
        price = '₹11,950';
        visaCount = '25K+';
        entryDate = 'Get on 29 Jun, 11:48 PM';
        flightInfo = '2 direct flights from ₹90k';
        processingTime = '7-10 business days';
        break;
      case 'Japan':
        price = '₹2,340';
        visaCount = '21K+';
        entryDate = 'Get on 08 May, 09:52 PM';
        flightInfo = '2 direct flights from ₹56k';
        processingTime = '5-7 business days';
        break;
      case 'Singapore':
        price = '₹3,200';
        visaCount = '11K+';
        entryDate = 'Get on 14 Apr, 10:08 PM';
        flightInfo = '10 direct flights from ₹44k';
        processingTime = '3-5 business days';
        break;
      case 'Australia':
        price = '₹10,500';
        visaCount = '7K+';
        entryDate = 'Get on 28 Apr, 11:14 PM';
        flightInfo = '1 direct flight from ₹99k';
        processingTime = '15-20 business days';
        break;
      default:
        // Generate some plausible values for other countries
        const priceBase = Math.floor(Math.random() * 5 + 1) * 1000;
        price = `₹${priceBase.toLocaleString('en-IN')}`;
        const visaBase = Math.floor(Math.random() * 20 + 5);
        visaCount = `${visaBase}K+`;
        
        // Random date within next 3 months
        const date = new Date();
        date.setDate(date.getDate() + Math.floor(Math.random() * 90));
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const hours = Math.floor(Math.random() * 12 + 1);
        const minutes = Math.floor(Math.random() * 60);
        const ampm = Math.random() > 0.5 ? 'AM' : 'PM';
        entryDate = `Get on ${day} ${month}, ${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
        
        // Random flight info
        const flightCount = Math.floor(Math.random() * 8 + 1);
        const flightPrice = Math.floor(Math.random() * 50 + 20);
        flightInfo = `${flightCount} direct flight${flightCount > 1 ? 's' : ''} from ₹${flightPrice}k`;
        
        // Random processing time
        const minDays = Math.floor(Math.random() * 7 + 3);
        const maxDays = minDays + Math.floor(Math.random() * 10 + 5);
        processingTime = `${minDays}-${maxDays} business days`;
    }
    
    return { price, visaCount, entryDate, flightInfo, processingTime };
  };

  // Get visa types for a country (placeholder function)
  const getVisaTypes = (country: any) => {
    const visaType = country.entry_type || 'Tourist';
    return [visaType, 'Business', 'Student'].slice(0, 2); // Only get 2 visa types for display
  };

  const { price, visaCount, entryDate, flightInfo, processingTime } = getCountryDetails(country);

  // Grid view card
  if (viewMode === 'grid') {
    return (
      <Link to={`/country/${country.id}`} className="block h-full">
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col group rounded-xl border-0 shadow-md">
          <div className="relative">
            <AspectRatio ratio={16/9} className="bg-gray-100">
              <img 
                src={country.banner || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000'} 
                alt={country.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
            </AspectRatio>
            
            {/* Visa count badge */}
            <Badge className="absolute top-3 left-3 bg-blue-600/90 text-white border-0 py-1.5 px-3 rounded-full backdrop-blur-sm">
              {visaCount} Visas on Time
            </Badge>
            
            {/* Special label for certain countries */}
            {country.name === 'Japan' && (
              <div className="absolute top-3 right-3">
                <div className="bg-amber-400/90 text-xs font-bold px-3 py-1.5 rounded-full text-gray-900 flex items-center backdrop-blur-sm">
                  <BadgeCheck className="w-3.5 h-3.5 mr-1" /> 
                  Fast Track
                </div>
              </div>
            )}
            
            {/* Country name and continent */}
            <div className="absolute bottom-3 left-3 z-20">
              <h3 className="font-semibold text-xl text-white mb-1">{country.name}</h3>
              <div className="flex items-center text-sm text-white/90 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                <MapPin size={12} className="mr-1" /> 
                <span>{getContinent(country.name)}</span>
              </div>
            </div>
            
            {/* Flag at bottom right */}
            <div className="absolute bottom-3 right-3 z-20 bg-white/20 backdrop-blur-md rounded-full p-1 shadow-lg border border-white/30">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img 
                  src={getCountryFlagUrl(country)}
                  alt={`${country.name} flag`} 
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/320x160?text=Flag';
                  }}
                />
              </div>
            </div>
            
            {/* Save button */}
            <Button
              size="sm"
              variant="ghost"
              className={`absolute top-11 right-3 z-20 rounded-full h-8 w-8 p-0 
                ${isSaved 
                  ? 'bg-pink-500/90 text-white hover:bg-pink-600/90 hover:text-white' 
                  : 'bg-black/30 text-white hover:bg-black/40 hover:text-white'
                } backdrop-blur-sm`}
              onClick={(e) => {
                e.preventDefault();
                onToggleSave();
              }}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          <div className="p-4 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-indigo-500" />
                <span className="truncate">{processingTime}</span>
              </div>
              <span className="font-bold text-indigo-600">{price}</span>
            </div>
            
            <div className="flex items-center text-xs text-gray-500 mb-3">
              <Plane className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-indigo-500" />
              <span className="truncate">{flightInfo}</span>
            </div>
            
            <div className="mt-auto">
              <div className="flex flex-wrap gap-1 mb-3">
                {getVisaTypes(country).map((type, i) => (
                  <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                    {type}
                  </span>
                ))}
              </div>
              
              <Button 
                size="sm" 
                className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      </Link>
    );
  }
  
  // List view card
  return (
    <Link to={`/country/${country.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm group">
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-1/4 lg:w-1/5">
            <AspectRatio ratio={16/9} className="md:h-full md:w-full bg-gray-100">
              <img 
                src={country.banner || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000'} 
                alt={country.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?q=80&w=1000';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent md:bg-gradient-to-b"></div>
              
              {/* Flag overlay */}
              <div className="absolute top-3 left-3 z-20 bg-white/20 backdrop-blur-md rounded-full p-1 shadow-lg border border-white/30 md:bottom-3 md:top-auto">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    src={getCountryFlagUrl(country)}
                    alt={`${country.name} flag`} 
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/320x160?text=Flag';
                    }}
                  />
                </div>
              </div>
              
              {/* Save button */}
              <Button
                size="sm"
                variant="ghost"
                className={`absolute top-3 right-3 z-20 rounded-full h-8 w-8 p-0 
                  ${isSaved 
                    ? 'bg-pink-500/90 text-white hover:bg-pink-600/90 hover:text-white' 
                    : 'bg-black/30 text-white hover:bg-black/40 hover:text-white'
                  } backdrop-blur-sm`}
                onClick={(e) => {
                  e.preventDefault();
                  onToggleSave();
                }}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
            </AspectRatio>
          </div>
          
          <div className="p-4 flex-grow flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="md:w-1/3">
              <div className="flex items-center">
                <h3 className="font-semibold text-lg text-gray-900">{country.name}</h3>
                {country.name === 'Japan' && (
                  <Badge className="ml-2 bg-amber-400 text-gray-900 border-0">Fast Track</Badge>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin size={14} className="mr-1" /> 
                <span>{getContinent(country.name)}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {getVisaTypes(country).map((type, i) => (
                  <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                    {type}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-3 md:mt-0 md:w-1/3">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Clock className="h-4 w-4 mr-1 flex-shrink-0 text-indigo-500" />
                <span>{processingTime}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="h-4 w-4 mr-1 flex-shrink-0 text-indigo-500" />
                <span>{visaCount} visas processed</span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center justify-between md:w-1/4 md:justify-end">
              <span className="font-bold text-lg text-indigo-600">{price}</span>
              <Button 
                size="sm" 
                className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white ml-4"
              >
                Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default CountryCard;
