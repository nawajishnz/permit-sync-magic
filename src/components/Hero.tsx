import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Compass, CalendarClock, Search, Zap, FileText, CreditCard, Globe, MapPin, Shield, Award } from 'lucide-react';
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
      title: "Complete Application & Payment", 
      icon: FileText,
      description: "Fill out your tourist visa application with all required details and make a secure payment"
    },
    { 
      id: 2, 
      title: "Document Verification", 
      icon: Zap,
      description: "Our AI-powered system verifies your documents and ensures compliance with embassy requirements"
    },
    { 
      id: 3, 
      title: "Expert Processing", 
      icon: Globe,
      description: "Visa specialists ensure your application meets all country-specific requirements"
    },
    { 
      id: 4, 
      title: "Visa Delivery", 
      icon: CreditCard,
      description: "Receive your approved tourist visa digitally or by mail, ready for your travels"
    }
  ];
  
  return (
    <section className="relative overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20">
      {/* Background gradient elements */}
      <div className="absolute top-0 -left-20 w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Hero content - Always rendered first in DOM for mobile priority */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-1 max-w-xl mx-auto lg:mx-0 text-center lg:text-left"
          >
            <div className="inline-flex items-center px-3 py-1.5 mb-5 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm">
              <span className="text-xs font-medium text-indigo-600 mr-2">98% Success Rate</span>
              <div className="h-1 w-1 rounded-full bg-indigo-300"></div>
              <span className="text-xs ml-2 text-indigo-500 font-medium">4.9 ★ (1.2k+ reviews)</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4 sm:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Tourist Visa
              </span>
              <span className="block mt-1">Made Simple</span>
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Get your tourist visa in just 4 easy steps. No embassy visits, no paperwork hassles, just seamless travel preparation.
            </p>
            
            {/* Country Dropdown */}
            <div className="relative mb-8 sm:mb-10 max-w-md mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-grow">
                  <Select value={selectedCountry} onValueChange={handleCountrySelect}>
                    <SelectTrigger className="w-full h-12 pl-12 rounded-lg border-gray-200 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-white">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-indigo-500" />
                      </div>
                      <SelectValue placeholder="Where do you want to travel?" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto bg-white">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Search className="h-4 w-4 mr-2 animate-spin text-indigo-600" />
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
                  size="default"
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-md h-12 px-6 rounded-lg transition-all duration-200"
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
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 md:gap-x-8 max-w-md mx-auto lg:mx-0 mb-8">
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
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 mr-3 shadow-sm">
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
            
            {/* CTA buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to="/countries" className="shadow-md border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-lg w-full sm:w-auto text-sm py-2 px-6 font-medium transition-all duration-200">
                Browse Countries
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Application Process Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-2 lg:order-2 mt-10 lg:mt-0"
          >
            <div className="relative max-w-md mx-auto lg:max-w-full">
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-64 h-64 rounded-full bg-indigo-100 opacity-60 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-blue-100 opacity-60 blur-3xl"></div>
              
              {/* Card with sticky header */}
              <motion.div 
                className="bg-white rounded-2xl shadow-lg border border-gray-100 relative z-10 flex flex-col"
                initial="hidden"
                animate="visible"
                variants={dashboardVariants}
                whileHover={{ y: -3, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              >
                {/* Sticky Header */}
                <div className="bg-indigo-600 p-4 flex items-center justify-between sticky top-0 z-20">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-400/60 w-3 h-3 rounded-full"></div>
                    <div className="bg-indigo-400/60 w-3 h-3 rounded-full"></div>
                    <div className="bg-indigo-400/60 w-3 h-3 rounded-full"></div>
                    <div className="bg-indigo-400/60 w-3 h-3 rounded-full"></div>
                  </div>
                  <div className="text-white font-medium text-base">Visa Application Platform</div>
                  <div className="w-16"></div> {/* Spacer for balance */}
                </div>
                
                {/* Scrollable Content Container */}
                <div className="h-[450px] overflow-y-auto">
                  <div className="p-5">
                    {/* Active Application Step View */}
                    <motion.div
                      variants={itemVariant}
                      className="mb-6"
                    >
                      <div className="flex items-start gap-5 mb-5">
                        <div className="shrink-0 w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
                          <Zap className="h-7 w-7 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm text-indigo-600 font-medium mb-1">Step 2 of 4</div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-1">Getting your documents</h3>
                          <p className="text-sm text-gray-600">Smart document processing ⚡</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-14 bg-gray-200 rounded flex items-center justify-center mb-2">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-500">Form.pdf</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-2 border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                              <Search className="h-5 w-5 text-indigo-500" />
                            </div>
                          </div>
                          <span className="text-sm text-indigo-600 font-medium">Processing</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-14 bg-gray-200 rounded flex items-center justify-center mb-2">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-500">Visa.pdf</span>
                        </div>
                      </div>
                    </motion.div>
                  
                    {/* Divider line */}
                    <div className="w-full h-px bg-gray-200 mb-6"></div>
                  
                    {/* Application Progress Steps */}
                    <div className="mb-6">
                      <div className="relative mb-5">
                        <div className="absolute top-4 left-3 right-3 h-0.5 bg-gray-200"></div>
                        <div className="flex justify-between relative">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white">
                              <Check className="h-4 w-4" />
                            </div>
                            <span className="text-xs mt-2 text-center font-medium">Complete</span>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white">
                              <Check className="h-4 w-4" />
                            </div>
                            <span className="text-xs mt-2 text-center font-medium">Docum...</span>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white">
                              <span className="text-xs font-medium">3</span>
                            </div>
                            <span className="text-xs mt-2 text-center font-medium">Expert</span>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500">
                              <span className="text-xs font-medium">4</span>
                            </div>
                            <span className="text-xs mt-2 text-center font-medium">Visa</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-700">Estimated completion:</div>
                        <div className="text-green-600 text-sm font-medium">3-5 business days</div>
                      </div>
                    </div>
                    
                    {/* Divider line */}
                    <div className="w-full h-px bg-gray-200 mb-6"></div>
                    
                    {/* Step description */}
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-800 mb-3 text-lg">
                        Sit back as we handle your visa application
                      </h4>
                      <p className="text-sm text-gray-600">
                        Our advanced system is scanning and preparing your documents while our experts are standing by to review
                      </p>
                    </div>
                    
                    {/* Extra content to demonstrate scrolling */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-700">Additional Information</h4>
                        <p className="text-sm text-gray-600">
                          Our visa professionals will review all your documents thoroughly to ensure compliance with embassy requirements.
                          The processing times may vary based on destination country and visa type.
                        </p>
                        <p className="text-sm text-gray-600">
                          You will receive email notifications at each stage of your application process.
                          Feel free to contact our support team if you have any questions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating element - plane */}
              <motion.div 
                className="absolute -bottom-3 right-8 w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center transform -rotate-12"
                animate={{ 
                  rotate: [-12, -6, -12],
                  y: [0, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <span className="text-lg">✈️</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
