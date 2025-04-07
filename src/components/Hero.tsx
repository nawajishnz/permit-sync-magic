import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Compass, CalendarClock, Search, Zap, FileText, CreditCard, Globe, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
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

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  
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
  
  // Animation variants for the dashboard preview
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
  
  const itemVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const applicationSteps = [
    { 
      id: 1, 
      title: "Fill Out Your Details & Pay", 
      icon: FileText,
      description: "Complete your application form with all required information and submit payment"
    },
    { 
      id: 2, 
      title: "Smart Documentation Review", 
      icon: Zap,
      description: "Our advanced system helps prepare and verify your documentation automatically"
    },
    { 
      id: 3, 
      title: "Expert Human Review", 
      icon: Globe,
      description: "Visa specialists double-check your application for accuracy and completeness"
    },
    { 
      id: 4, 
      title: "Receive Your Visa", 
      icon: CreditCard,
      description: "Your visa is delivered electronically or by mail, on time and hassle-free"
    }
  ];
  
  return (
    <section className="relative overflow-hidden pt-10 pb-12 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24">
      {/* Background gradient elements */}
      <div className="absolute top-0 -left-20 w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Hero content - Always rendered first in DOM for mobile priority */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-1 max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
          >
            <div className="inline-flex items-center px-3 py-1.5 mb-5 rounded-full bg-indigo-50 border border-indigo-100">
              <span className="text-xs font-medium text-indigo-600 mr-2">98% Success Rate</span>
              <div className="h-1 w-1 rounded-full bg-indigo-300"></div>
              <span className="text-xs ml-2 text-indigo-500">4.9 ★ (1.2k+ reviews)</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-gray-900 mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Visa Simplified
              </span>
              <span className="block mt-1">With Permitsy</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0">
              4 simple steps to apply for your visa. Skip the embassy lines and paperwork with our streamlined process.
            </p>
            
            {/* Country Dropdown */}
            <div className="relative mb-8 sm:mb-10 max-w-md mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-grow">
                  <Select value={selectedCountry} onValueChange={handleCountrySelect}>
                    <SelectTrigger className="w-full h-14 pl-12 rounded-full border-gray-200 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <SelectValue placeholder="Where do you want to travel?" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto bg-white">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Search className="h-5 w-5 mr-2 animate-spin text-indigo-600" />
                          <span>Loading countries...</span>
                        </div>
                      ) : countries.length > 0 ? (
                        countries.map((country) => (
                          <SelectItem key={country.id} value={country.id}>
                            {country.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">
                          No countries found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-md"
                  onClick={() => {
                    if (selectedCountry) {
                      navigate(`/country/${selectedCountry}`);
                    } else {
                      navigate("/countries");
                    }
                  }}
                >
                  <Search className="h-4 w-4 mr-1" /> Find
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-y-4 gap-x-6 md:gap-x-8 max-w-md mx-auto lg:mx-0">
              {[
                { icon: Compass, text: '190+ countries covered' },
                { icon: CalendarClock, text: 'Fast processing times' },
                { icon: Check, text: 'Expert document review' },
                { icon: MapPin, text: '24/7 support' }
              ].map((feature, i) => (
                <motion.div 
                  key={i} 
                  className="flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <span className="text-gray-600 text-sm sm:text-base">{feature.text}</span>
                </motion.div>
              ))}
            </div>
            
            {/* CTA buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mt-8 sm:mt-10 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to="/countries" className="shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-full w-full sm:w-auto">
                Browse Countries
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Application Process Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-2 lg:order-2 mt-8 lg:mt-0"
          >
            <div className="relative max-w-md mx-auto lg:max-w-full">
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-56 h-56 rounded-full bg-indigo-100 opacity-60 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-blue-100 opacity-60 blur-3xl"></div>
              
              {/* Application Process Flow Visualization */}
              <motion.div 
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative z-10"
                initial="hidden"
                animate="visible"
                variants={dashboardVariants}
                whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              >
                {/* Platform header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-white/20 w-3 h-3 rounded-full mr-2"></div>
                    <div className="bg-white/20 w-3 h-3 rounded-full mr-2"></div>
                    <div className="bg-white/20 w-3 h-3 rounded-full"></div>
                  </div>
                  <div className="text-white font-medium text-sm">Visa Application Platform</div>
                  <div className="w-16"></div> {/* Spacer for balance */}
                </div>
                
                {/* Application Process Steps */}
                <div className="p-4 sm:p-6">
                  {/* Active Application Step View */}
                  <motion.div
                    variants={itemVariant}
                    className="mb-6 sm:mb-8"
                  >
                    <div className="flex items-center mb-4">
                      <div className="mr-3 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-100 flex items-center justify-center">
                        <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs text-indigo-600 font-medium mb-1">Step 2 of 4</div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Getting your documents</h3>
                        <p className="text-xs sm:text-sm text-gray-500">Smart document processing ⚡</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 flex items-center justify-center">
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className="flex flex-col items-center"
                        >
                          <div className="w-10 h-12 sm:w-12 sm:h-14 bg-gray-200 rounded-md flex items-center justify-center mb-2">
                            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                          </div>
                          <span className="text-xs text-gray-500">Form.pdf</span>
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: 1, 
                            scale: [0.8, 1.1, 1],
                            rotate: [0, 5, -5, 0] 
                          }}
                          transition={{ delay: 0.5, duration: 0.8 }}
                          className="flex flex-col items-center"
                        >
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-2 border border-gray-100">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
                            </div>
                          </div>
                          <span className="text-xs text-indigo-600 font-medium">Processing</span>
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                          className="flex flex-col items-center"
                        >
                          <div className="w-10 h-12 sm:w-12 sm:h-14 bg-gray-200 rounded-md flex items-center justify-center mb-2">
                            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                          </div>
                          <span className="text-xs text-gray-500">Visa.pdf</span>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                
                  {/* Application Progress Steps */}
                  <motion.div
                    variants={itemVariant}
                    className="pt-4 border-t border-gray-100"
                  >
                    <div className="relative mb-4">
                      <div className="absolute top-4 left-4 sm:left-6 right-4 sm:right-6 h-0.5 bg-gray-200"></div>
                      <div className="flex justify-between relative">
                        {applicationSteps.map((step, index) => (
                          <div key={index} className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                              index < 2 ? 'bg-green-500 text-white' : 
                              index === 2 ? 'bg-indigo-600 text-white border-4 border-indigo-100' : 
                              'bg-gray-200 text-gray-500'
                            }`}>
                              {index < 2 ? (
                                <Check className="h-5 w-5" />
                              ) : (
                                <span className="text-xs font-medium">{step.id}</span>
                              )}
                            </div>
                            <span className="text-xs mt-2 text-center w-14 sm:w-16 truncate">{step.title.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 sm:mt-6">
                      <div className="text-xs sm:text-sm font-medium text-gray-700">Estimated completion:</div>
                      <div className="bg-green-50 px-2 sm:px-3 py-1 rounded-full text-green-700 text-xs sm:text-sm font-medium">
                        3-5 business days
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Step description - animates between steps */}
                  <motion.div
                    variants={itemVariant}
                    className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1 }}
                      className="text-center"
                    >
                      <h4 className="font-medium text-gray-800 mb-2 text-sm sm:text-base">
                        Sit back as we handle your visa application
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Our advanced system is scanning and preparing your documents while our experts are standing by to review
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Floating elements */}
              <motion.div 
                className="absolute -bottom-4 right-10 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl shadow-lg flex items-center justify-center transform -rotate-12"
                animate={{ 
                  rotate: [-12, -6, -12],
                  y: [0, -8, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <span className="text-xl sm:text-2xl">✈️</span>
              </motion.div>
              
              <motion.div 
                className="absolute top-1/3 -right-5 w-10 h-10 sm:w-12 sm:h-12 bg-green-400 rounded-lg shadow-lg flex items-center justify-center transform rotate-12"
                animate={{ 
                  rotate: [12, 8, 12],
                  y: [0, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Check className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
