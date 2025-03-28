
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, MapPin, Compass, CalendarClock, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-24">
      {/* Background gradient elements */}
      <div className="absolute top-0 -left-20 w-[600px] h-[600px] rounded-full bg-blue-400/20 blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-3xl opacity-20"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Hero content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="inline-flex items-center px-3 py-1.5 mb-6 rounded-full bg-indigo-50 border border-indigo-100">
              <span className="text-xs font-medium text-indigo-600 mr-2">98% Success Rate</span>
              <div className="h-1 w-1 rounded-full bg-indigo-300"></div>
              <span className="text-xs ml-2 text-indigo-500">4.9 ★ (1.2k+ reviews)</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Global Visa Solutions
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
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-full w-full sm:w-auto shadow-md">
                  Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Hero image/card section - Make sure it's first on desktop but second on mobile */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={`order-1 lg:order-2 ${isMobile ? 'mb-8' : ''}`}
          >
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-56 h-56 rounded-full bg-indigo-100 opacity-60 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-blue-100 opacity-60 blur-3xl"></div>
              
              {/* 3D floating cards */}
              <div className="relative z-10">
                {/* Main visa card */}
                <motion.div 
                  className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-all duration-300"
                  whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">🇺🇸</span>
                        <h3 className="text-xl font-semibold">US Tourist Visa</h3>
                      </div>
                      <p className="text-indigo-600 font-medium">B-2 Visitor Visa</p>
                    </div>
                    <div className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                      98% Approval
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Processing Time</p>
                      <p className="font-medium">7-14 days</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Validity</p>
                      <p className="font-medium">10 years</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {[
                      'Complete document preparation',
                      'Expert application review',
                      'Interview preparation',
                      '24/7 customer support'
                    ].map((item, i) => (
                      <motion.li 
                        key={i} 
                        className="flex items-start text-sm"
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * i }}
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mt-0.5 mr-3">
                          <Check className="h-3 w-3" />
                        </div>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">From</p>
                      <p className="text-2xl font-bold">$149</p>
                    </div>
                    <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700">
                      Apply Now
                    </Button>
                  </div>
                </motion.div>
                
                {/* Secondary card positioned behind main card */}
                <div className="absolute -bottom-8 -left-6 w-3/4 h-44 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-lg -z-10 transform -rotate-6"></div>
                
                {/* Small decorative elements */}
                <motion.div 
                  className="absolute top-1/2 -right-5 w-12 h-12 bg-yellow-400 rounded-lg shadow-lg transform rotate-12"
                  animate={{ 
                    rotate: [12, 8, 12],
                    y: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                ></motion.div>
                <motion.div 
                  className="absolute -bottom-4 right-10 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center transform -rotate-12"
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
                  <span className="text-3xl">✈️</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
