import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Compass, CalendarClock, Search, Zap, FileText, CreditCard, Globe, MapPin, Shield, Award, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

// Mock expert data
const experts = [
  { 
    id: 1, 
    name: 'Ramya', 
    rate: '96%', 
    specialty: 'UK visas',
    image: '/images/experts/ramya.jpg',
    flags: ['uk', 'us', 'ca', 'sg']
  },
  { 
    id: 2, 
    name: 'Arjun', 
    rate: '98%', 
    specialty: 'Schengen visas',
    image: '/images/experts/arjun.jpg',
    flags: ['fr', 'de', 'it', 'es']
  },
  { 
    id: 3, 
    name: 'Priya', 
    rate: '94%', 
    specialty: 'Australia visas',
    image: '/images/experts/priya.jpg',
    flags: ['au', 'nz', 'jp', 'kr']
  },
];

// Mock successful clients data
const successfulClients = [
  { 
    id: 1, 
    name: 'Ramya S.', 
    journey: 'Trip to London',
    feedback: 'Got my UK visa in just 3 days!',
    image: 'https://randomuser.me/api/portraits/women/67.jpg',
    destination: 'United Kingdom',
    flags: ['uk'],
    dateReceived: '2 weeks ago'
  },
  { 
    id: 2, 
    name: 'Arjun K.', 
    journey: 'Euro trip adventure',
    feedback: 'Schengen visa approved within a week',
    image: 'https://randomuser.me/api/portraits/men/76.jpg',
    destination: 'Europe',
    flags: ['fr', 'de', 'it', 'es'],
    dateReceived: '5 days ago'
  },
  { 
    id: 3, 
    name: 'Priya M.', 
    journey: 'Business trip to Sydney',
    feedback: 'Smooth process, hassle-free approval',
    image: 'https://randomuser.me/api/portraits/women/50.jpg',
    destination: 'Australia',
    flags: ['au'],
    dateReceived: 'Yesterday'
  },
  { 
    id: 4, 
    name: 'Rahul T.', 
    journey: 'Vacation in Dubai',
    feedback: "Fastest visa process I've experienced",
    image: 'https://randomuser.me/api/portraits/men/41.jpg',
    destination: 'UAE',
    flags: ['ae'],
    dateReceived: '3 days ago'
  },
  { 
    id: 5, 
    name: 'Meera P.', 
    journey: 'Study abroad program',
    feedback: 'Excellent assistance with student visa',
    image: 'https://randomuser.me/api/portraits/women/31.jpg',
    destination: 'Canada',
    flags: ['ca'],
    dateReceived: '1 week ago'
  },
  { 
    id: 6, 
    name: 'Vikram S.', 
    journey: 'Family trip to Singapore',
    feedback: 'The whole family got visas in one go!',
    image: 'https://randomuser.me/api/portraits/men/23.jpg',
    destination: 'Singapore',
    flags: ['sg'],
    dateReceived: '4 days ago'
  },
  { 
    id: 7, 
    name: 'Ananya R.', 
    journey: 'Conference in Tokyo',
    feedback: 'Japan visa without any complications',
    image: 'https://randomuser.me/api/portraits/women/74.jpg',
    destination: 'Japan',
    flags: ['jp'],
    dateReceived: '10 days ago'
  },
  { 
    id: 8, 
    name: 'Nikhil D.', 
    journey: 'Backpacking in Thailand',
    feedback: 'Tourist visa approved in 24 hours',
    image: 'https://randomuser.me/api/portraits/men/65.jpg',
    destination: 'Thailand',
    flags: ['th'],
    dateReceived: '1 week ago'
  }
];

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [currentClient, setCurrentClient] = useState(0);
  
  // Change client every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentClient((prev) => (prev + 1) % successfulClients.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Dashboard animation variants
  const dashboardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.2
      } 
    }
  };
  
  // Use React Query for better caching and optimized fetching
  const { data: countries = [], isLoading } = useQuery({
    queryKey: ['heroCountries'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('countries')
          .select('id, name')
          .order('name');
          
        if (error) {
          console.error('Error fetching countries:', error);
          toast({
            title: "Error loading countries",
            description: "Could not load countries from database",
            variant: "destructive",
          });
          throw error;
        }
        
        console.log('Countries fetched for hero:', data?.length);
        return data || [];
      } catch (err) {
        console.error('Exception when fetching countries:', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
  
  const handleCountrySelect = (value: string) => {
    setSelectedCountry(value);
    if (value) {
      navigate(`/country/${value}`);
    }
  };
  
  return (
    <section className="relative overflow-hidden pt-6 pb-8 sm:pt-10 sm:pb-12 md:pt-12 md:pb-12 lg:pt-14 lg:pb-14">
      {/* Background elements */}
      <div className="absolute top-0 -left-20 w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-16 items-center">
          {/* Left side - Hero content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-1 max-w-lg mx-auto lg:mx-0 text-center lg:text-left px-2 lg:px-4"
          >
            <div className="inline-flex items-center px-3 py-1 mb-3 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm">
              <span className="text-xs font-medium text-indigo-600 mr-2">98% Success Rate</span>
              <div className="h-1 w-1 rounded-full bg-indigo-300"></div>
              <span className="text-xs ml-2 text-indigo-500 font-medium">4.9 ★ (1.2k+ reviews)</span>
            </div>
            
            <div className="mb-3">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base font-medium text-gray-700"
              >
                India's most loved visa platform <span className="text-red-500">❤️</span>
              </motion.p>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-3 sm:mb-4 leading-tight">
              <div className="flex flex-wrap items-baseline justify-center lg:justify-start">
                <span className="whitespace-nowrap mr-2">From application to approval,</span>
                <span className="mr-2">our</span> 
                <span className="text-blue-600">visa experts got you</span>
              </div>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '67%' }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-1 bg-blue-500 mt-2 mx-auto lg:mx-0"
              />
            </h1>
            
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Get your tourist visa in just 4 easy steps. No embassy visits, no paperwork hassles, just seamless travel preparation.
            </p>
            
            {/* Country Dropdown */}
            <div className="relative mb-5 sm:mb-6 max-w-md mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-grow">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
                    <Select value={selectedCountry} onValueChange={handleCountrySelect}>
                      <SelectTrigger className="text-left h-12 bg-white shadow-sm border-gray-200 pl-10 rounded-full">
                        <SelectValue placeholder="Where do you want to travel?" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country: any) => (
                          <SelectItem key={country.id} value={country.id.toString()}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  size="default"
                  variant="default"
                  className="shadow-md h-12 rounded-full px-5"
                  onClick={() => {
                    if (selectedCountry) {
                      navigate(`/country/${selectedCountry}`);
                    } else {
                      navigate("/countries");
                    }
                  }}
                >
                  <Search className="h-4 w-4 mr-2" /> Find Visa
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 md:gap-x-6 max-w-md mx-auto lg:mx-0 mb-5">
              {[
                { icon: Shield, text: '190+ countries covered' },
                { icon: CalendarClock, text: 'Fast 3-5 day processing' },
                { icon: Award, text: 'Expert visa specialists' },
                { icon: Globe, text: '24/7 traveler support' }
              ].map((feature, i) => (
                <motion.div 
                  key={i} 
                  className="flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 mr-2 shadow-sm">
                    <feature.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-gray-700 text-xs font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
            
            {/* CTA buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 mt-5 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to="/countries">
                <Button variant="default" size="default" className="h-10 rounded-full">
                  Browse Countries <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Right side - Visa Experts Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-2 lg:order-2 mt-6 lg:mt-0 px-2 lg:px-4"
          >
            <div className="relative w-full md:max-w-[500px] lg:max-w-[550px] mx-auto">
              {/* Meet Your Visa Experts Section */}
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 p-8 px-10 relative">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-bl-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-50/50 rounded-tr-[100px]"></div>
                
                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 relative z-10">
                  <span className="text-gray-700">Recent </span>
                  <span className="text-blue-600">Visa Approvals</span>
                </h2>
                
                {/* Expert Cards with Pagination */}
                <div className="relative py-3 z-10">
                  <AnimatePresence mode="wait">
                    {successfulClients.map((client, index) => (
                      index === currentClient && (
                        <motion.div
                          key={client.id}
                          className="bg-white rounded-xl overflow-hidden"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="p-5 px-7 flex">
                            {/* Expert Image */}
                            <div className="w-20 h-20 rounded-full overflow-hidden mr-6 flex-shrink-0 border-2 border-gray-100 shadow-md">
                              <img 
                                src={client.image} 
                                alt={client.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Expert Info */}
                            <div className="flex flex-col justify-center pl-3">
                              <h3 className="text-xl font-bold text-gray-800 mb-2">{client.name.split(' ')[0]}</h3>
                              <div className="flex items-center gap-1 mb-2">
                                <span className="text-blue-600 bg-blue-50 p-0.5 rounded-full"><Check className="h-3.5 w-3.5" /></span>
                                <span className="text-sm text-gray-600">Approved for {client.journey.includes('Euro') ? 'Schengen' : client.destination} visa {client.dateReceived}</span>
                              </div>
                              
                              <div className="mb-3 text-sm italic text-gray-600">"{client.feedback}"</div>
                              
                              {/* Countries Expertise */}
                              <div className="mt-1">
                                <div className="text-xs font-medium text-blue-700 mb-1">VISA ISSUED FOR</div>
                                <div className="flex items-center gap-1">
                                  {client.flags.map((flag, i) => (
                                    <div 
                                      key={i}
                                      className="w-6 h-4 rounded-sm overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50"
                                    >
                                      <span className="text-[8px] font-bold text-gray-700">{flag.toUpperCase()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
