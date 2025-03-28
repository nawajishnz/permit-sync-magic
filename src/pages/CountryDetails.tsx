
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Globe, FileText, Clock, DollarSign, Users, Check } from 'lucide-react';

// Country data - in a real app this would come from an API
const countryData = {
  usa: {
    name: 'United States',
    flag: '🇺🇸',
    banner: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
    description: 'The United States offers various visa options for tourists, students, workers, and immigrants. Each visa type has specific requirements and application procedures.',
    visaTypes: [
      { name: 'Tourist Visa (B-2)', processingTime: '2-4 weeks', fee: '$160', requirements: ['Valid passport', 'DS-160 form', 'Proof of funds', 'Intent to return'] },
      { name: 'Student Visa (F-1)', processingTime: '3-5 weeks', fee: '$160', requirements: ['I-20 from school', 'SEVIS fee payment', 'Academic records'] },
      { name: 'Work Visa (H-1B)', processingTime: '3-6 months', fee: '$190', requirements: ['Employer petition', 'Educational credentials', 'Relevant experience'] },
      { name: 'Business Visa (B-1)', processingTime: '2-4 weeks', fee: '$160', requirements: ['Business invitation', 'Meeting agenda', 'Business credentials'] },
      { name: 'Transit Visa (C)', processingTime: '2-3 weeks', fee: '$160', requirements: ['Onward ticket', 'Visa for destination', 'Travel itinerary'] },
      { name: 'Crew Member Visa (D)', processingTime: '2-4 weeks', fee: '$160', requirements: ['Employer letter', "Seaman's book", 'Shipping company letter'] },
    ]
  },
  canada: {
    name: 'Canada',
    flag: '🇨🇦',
    banner: 'https://images.unsplash.com/photo-1517935706615-2717063c2225',
    description: 'Canada offers temporary and permanent visas for visitors, students, workers, and immigrants. The application process varies depending on your nationality and purpose of visit.',
    visaTypes: [
      { name: 'Visitor Visa', processingTime: '2-3 weeks', fee: 'CAD $100', requirements: ['Valid passport', 'Financial proof', 'Travel history', 'Purpose of visit'] },
      { name: 'Study Permit', processingTime: '3-6 weeks', fee: 'CAD $150', requirements: ['Acceptance letter', 'Proof of funds', 'Intent to leave'] },
      { name: 'Work Permit', processingTime: '4-8 weeks', fee: 'CAD $155', requirements: ['Job offer', 'Labor market impact assessment', 'Qualifications'] },
      { name: 'Express Entry', processingTime: '6 months', fee: 'CAD $1,325', requirements: ['Education credentials', 'Language tests', 'Work experience'] }
    ]
  },
  uk: {
    name: 'United Kingdom',
    flag: '🇬🇧',
    banner: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
    description: 'The United Kingdom offers various visa categories for tourists, students, workers, and family members. Each visa has specific eligibility criteria and documentation requirements.',
    visaTypes: [
      { name: 'Standard Visitor Visa', processingTime: '3 weeks', fee: '£95', requirements: ['Valid passport', 'Proof of funds', 'Accommodation details', 'Return ticket'] },
      { name: 'Student Visa', processingTime: '3-4 weeks', fee: '£348', requirements: ['CAS from institution', 'Proof of funds', 'English language test'] },
      { name: 'Skilled Worker Visa', processingTime: '3-8 weeks', fee: '£610+', requirements: ['Certificate of sponsorship', 'Appropriate skill level', 'English language test'] },
      { name: 'Family Visa', processingTime: '6-12 weeks', fee: '£1,523', requirements: ['Relationship proof', 'Financial requirement', 'Accommodation details'] },
      { name: 'Transit Visa', processingTime: '1-2 weeks', fee: '£35', requirements: ['Valid onward journey', 'Short stay proof', 'No intention to stay'] }
    ]
  },
  schengen: {
    name: 'Schengen Area',
    flag: '🇪🇺',
    banner: 'https://images.unsplash.com/photo-1499856871958-5b9357976b82',
    description: 'The Schengen visa allows travel to 26 European countries. Depending on your nationality and purpose of visit, you may apply for different types of Schengen visas.',
    visaTypes: [
      { name: 'Tourist Visa (C)', processingTime: '10-15 days', fee: '€80', requirements: ['Valid passport', 'Travel insurance', 'Itinerary', 'Proof of funds'] },
      { name: 'Business Visa', processingTime: '10-15 days', fee: '€80', requirements: ['Business invitation', 'Company letter', 'Proof of funds'] },
      { name: 'Student Visa', processingTime: '10-15 days', fee: '€80', requirements: ['Acceptance letter', 'Accommodation proof', 'Financial support'] }
    ]
  },
  australia: {
    name: 'Australia',
    flag: '🇦🇺',
    banner: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be',
    description: 'Australia offers numerous visa options for visitors, students, workers, and immigrants. Most visa applications are processed online through the ImmiAccount portal.',
    visaTypes: [
      { name: 'Visitor Visa (600)', processingTime: '20-50 days', fee: 'AUD $145', requirements: ['Valid passport', 'Sufficient funds', 'Health insurance', 'Character requirements'] },
      { name: 'Student Visa (500)', processingTime: '4-6 weeks', fee: 'AUD $620', requirements: ['CoE from institution', 'Health insurance', 'Financial requirements'] },
      { name: 'Working Holiday Visa (417/462)', processingTime: '14-40 days', fee: 'AUD $485', requirements: ['Age 18-30', 'Sufficient funds', 'Health insurance'] },
      { name: 'Skilled Visa (189/190/491)', processingTime: '6-18 months', fee: 'AUD $4,045+', requirements: ['Skills assessment', 'Points test', 'English proficiency'] }
    ]
  },
  uae: {
    name: 'UAE',
    flag: '🇦🇪',
    banner: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    description: 'The United Arab Emirates offers various visa types for tourists, business visitors, workers, and residents. The process and requirements vary based on nationality and purpose.',
    visaTypes: [
      { name: 'Tourist Visa', processingTime: '3-5 days', fee: '$90-$180', requirements: ['Valid passport', 'Return ticket', 'Hotel booking', 'Sufficient funds'] },
      { name: 'Visit Visa', processingTime: '3-5 days', fee: '$180-$270', requirements: ['Host invitation', 'Valid passport', 'Photographs'] },
      { name: 'Employment Visa', processingTime: '2-3 weeks', fee: 'Varies', requirements: ['Job offer', 'Medical test', 'Educational certificates'] }
    ]
  },
  japan: {
    name: 'Japan',
    flag: '🇯🇵',
    banner: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989',
    description: 'Japan offers various visa categories for short-term visits, business, study, work, and long-term residency. Application procedures depend on your nationality and purpose of visit.',
    visaTypes: [
      { name: 'Tourist Visa', processingTime: '5-7 days', fee: '¥3,000', requirements: ['Valid passport', 'Itinerary', 'Sufficient funds', 'Return ticket'] },
      { name: 'Business Visa', processingTime: '5-7 days', fee: '¥3,000', requirements: ['Business invitation', 'Company letter', 'Itinerary'] }
    ]
  },
  singapore: {
    name: 'Singapore',
    flag: '🇸🇬',
    banner: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
    description: 'Singapore offers various visa options for tourists, business visitors, students, and workers. Many nationalities enjoy visa-free entry for short visits.',
    visaTypes: [
      { name: 'Tourist Visa', processingTime: '3-5 days', fee: 'SGD $30', requirements: ['Valid passport', 'Return ticket', 'Proof of funds', 'Travel itinerary'] },
      { name: 'Business Visa', processingTime: '3-5 days', fee: 'SGD $30', requirements: ['Business invitation', 'Company letter', 'Meeting schedule'] }
    ]
  }
};

const CountryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const country = id && countryData[id as keyof typeof countryData];
  
  if (!country) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-navy mb-4">Country not found</h1>
            <Link to="/">
              <Button>Return to home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Banner */}
        <div className="relative h-64 md:h-80">
          <div className="absolute inset-0">
            <img 
              src={country.banner}
              alt={country.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="container mx-auto">
              <div className="flex items-center">
                <Link to="/" className="mr-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center">
                  <span className="text-4xl mr-3">{country.flag}</span>
                  <h1 className="text-3xl md:text-4xl font-bold">{country.name}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">Overview</h2>
            <p className="text-gray-600">{country.description}</p>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-navy">Available Visa Types</h2>
              <Link to="/visa-finder">
                <Button variant="outline" className="border-teal text-teal hover:bg-teal hover:text-white">
                  <Globe className="mr-2 h-4 w-4" />
                  Use Visa Finder
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {country.visaTypes.map((visa, index) => (
                <Card key={index} className="overflow-hidden h-full">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-navy text-lg mb-2">{visa.name}</h3>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start">
                        <Clock className="h-4 w-4 text-gray-500 mt-1 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Processing Time</p>
                          <p className="font-medium">{visa.processingTime}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <DollarSign className="h-4 w-4 text-gray-500 mt-1 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Visa Fee</p>
                          <p className="font-medium">{visa.fee}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Key Requirements</p>
                      <ul className="space-y-1">
                        {visa.requirements.map((req, i) => (
                          <li key={i} className="text-sm flex items-start">
                            <Check className="h-4 w-4 text-teal mr-2 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-4">
                      <Link to="/apply-now">
                        <Button className="w-full bg-teal hover:bg-teal-600 text-white">
                          <FileText className="mr-2 h-4 w-4" />
                          Apply Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-navy mb-3">Need Help with Your {country.name} Visa?</h2>
            <p className="text-gray-600 mb-4">
              Our visa experts can guide you through the entire application process and increase your chances of approval.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact">
                <Button variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
                  <Users className="mr-2 h-4 w-4" />
                  Speak to an Expert
                </Button>
              </Link>
              <Link to="/apply-now">
                <Button className="bg-teal hover:bg-teal-600 text-white">
                  Start Your Application
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CountryDetails;
