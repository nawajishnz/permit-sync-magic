
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, MapPin, Compass, CalendarClock, Search, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  
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
  
  return (
    <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-24">
      {/* Background gradient elements */}
      <div className="absolute top-0 -left-20 w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Hero content - Always rendered first in DOM for mobile priority */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:order-1"
          >
            <div className="inline-flex items-center px-3 py-1.5 mb-6 rounded-full bg-indigo-50 border border-indigo-100">
              <span className="text-xs font-medium text-indigo-600 mr-2">98% Success Rate</span>
              <div className="h-1 w-1 rounded-full bg-indigo-300"></div>
              <span className="text-xs ml-2 text-indigo-500">4.9 ★ (1.2k+ reviews)</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Travel Visas
              </span>
              <span className="block mt-1">Simplified For You</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Skip the embassy lines and paperwork. Apply for your tourist or visit visa online and get approved in days, not months.
            </p>
            
            {/* Search box */}
            <div className="relative mb-10 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                type="text" 
                placeholder="Where do you want to travel?" 
                className="w-full pl-12 pr-36 py-3 rounded-full border-gray-200 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-14"
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <Button size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-700 pr-4">
                  <Search className="h-4 w-4 mr-1" /> Search
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
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
                  <span className="text-gray-600">{feature.text}</span>
                </motion.div>
              ))}
            </div>
            
            {/* CTA buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to="/visa-finder">
                <Button size="lg" variant="outline" className="shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-full w-full sm:w-auto">
                  Find My Visa
                </Button>
              </Link>
              <Link to="/apply-now">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-full w-full sm:w-auto shadow-md group transition-all duration-300">
                  Apply Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Animated platform demo section - Now always second in the DOM for mobile priority */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:order-2"
          >
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-56 h-56 rounded-full bg-indigo-100 opacity-60 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-blue-100 opacity-60 blur-3xl"></div>
              
              {/* Animated Platform Workflow Visualization */}
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
                
                {/* Platform content */}
                <div className="p-6">
                  {/* Step 1: Country Selection */}
                  <motion.div 
                    className="mb-6"
                    variants={itemVariant}
                  >
                    <div className="text-sm text-gray-500 mb-2 flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 mr-2 text-xs font-medium">1</span>
                      Select Destination Country
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="grid grid-cols-3 gap-2">
                        {["🇺🇸", "🇨🇦", "🇬🇧"].map((flag, i) => (
                          <motion.div 
                            key={i}
                            className={`flex items-center justify-center p-2 rounded-md ${i === 0 ? 'bg-indigo-50 border border-indigo-100' : 'bg-white border border-gray-100'}`}
                            whileHover={{ scale: 1.05, backgroundColor: "#EEF2FF" }}
                          >
                            <span className="text-xl mr-1">{flag}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Step 2: Visa Type */}
                  <motion.div 
                    className="mb-6"
                    variants={itemVariant}
                  >
                    <div className="text-sm text-gray-500 mb-2 flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 mr-2 text-xs font-medium">2</span>
                      Select Visa Type
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                      <div className="bg-white rounded-md p-2 border border-gray-100 flex items-center">
                        <div className="h-4 w-4 rounded-full bg-indigo-600 mr-2 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm">Tourist Visa (B-2)</span>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Step 3: Form Completion */}
                  <motion.div
                    variants={itemVariant}
                  >
                    <div className="text-sm text-gray-500 mb-2 flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 mr-2 text-xs font-medium">3</span>
                      Complete Application
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-green-500"
                            initial={{ width: "0%" }}
                            animate={{ width: "75%" }}
                            transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatDelay: 4 }}
                          ></motion.div>
                        </div>
                        <span className="text-xs text-gray-500">75% Complete</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded-full w-full"></div>
                        <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Video demo button */}
                  <motion.div 
                    className="mt-6 flex justify-center"
                    variants={itemVariant}
                  >
                    <Button 
                      variant="ghost"
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center text-sm"
                    >
                      <div className="bg-indigo-100 w-6 h-6 rounded-full flex items-center justify-center mr-2">
                        <Play className="h-3 w-3 text-indigo-600" />
                      </div>
                      Watch how it works
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Floating elements */}
              <motion.div 
                className="absolute -bottom-4 right-10 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center transform -rotate-12"
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
                <span className="text-2xl">✈️</span>
              </motion.div>
              
              <motion.div 
                className="absolute top-1/3 -right-5 w-12 h-12 bg-green-400 rounded-lg shadow-lg flex items-center justify-center transform rotate-12"
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
                <Check className="h-6 w-6 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
