
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, Home, ArrowRight, GraduationCap, Briefcase, 
  Heart, Clock, CalendarDays, Compass, CheckCircle2, 
  MapPin, Globe, Award, ShieldCheck, Timer
} from 'lucide-react';

const VisaFinder = () => {
  const { toast } = useToast();
  const [fromCountry, setFromCountry] = useState("");
  const [toCountry, setToCountry] = useState("");
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("");
  const [resultsVisible, setResultsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Popular destinations with flags - would normally come from API
  const popularDestinations = [
    { id: 'us', name: 'United States', flag: '🇺🇸' },
    { id: 'ca', name: 'Canada', flag: '🇨🇦' },
    { id: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
    { id: 'au', name: 'Australia', flag: '🇦🇺' },
    { id: 'jp', name: 'Japan', flag: '🇯🇵' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!fromCountry || !toCountry || !purpose || !duration) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields to find your visa options.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsLoading(false);
      setResultsVisible(true);
      
      // Scroll to results
      document.getElementById('results-section')?.scrollIntoView({ 
        behavior: 'smooth'
      });
      
      toast({
        title: "Visa options found!",
        description: "We've found visa options matching your criteria.",
      });
    }, 1500);
  };

  const nextStep = () => {
    if (formStep < 2) {
      setFormStep(formStep + 1);
    }
  };

  const prevStep = () => {
    if (formStep > 0) {
      setFormStep(formStep - 1);
    }
  };

  // Sample visa results - would normally come from API
  const visaResults = [
    {
      id: 1,
      name: "Tourist Visa (B-2)",
      description: "For tourism, pleasure, or visiting friends and family",
      processingTime: "2-3 weeks",
      validityPeriod: "Up to 6 months",
      price: "₹12,000",
      successRate: "97%",
      requirements: [
        "Valid passport",
        "Completed application form",
        "Proof of financial means",
        "Return ticket",
        "Travel itinerary"
      ],
      tags: ["Fast processing", "Multiple entry"]
    },
    {
      id: 2,
      name: "Business Visa (B-1)",
      description: "For business-related activities, meetings, and conferences",
      processingTime: "2-3 weeks",
      validityPeriod: "Up to 6 months",
      price: "₹12,000",
      successRate: "95%",
      requirements: [
        "Valid passport",
        "Completed application form",
        "Invitation letter",
        "Company letter",
        "Proof of financial means"
      ],
      tags: ["Business approved", "Conference valid"]
    },
    {
      id: 3,
      name: "Electronic Travel Authorization (ETA)",
      description: "Quick online pre-authorization for eligible travelers",
      processingTime: "72 hours",
      validityPeriod: "Up to 2 years (multiple entry)",
      price: "₹2,175",
      successRate: "99%",
      requirements: [
        "Valid passport",
        "Valid email address",
        "Credit/debit card for payment",
        "Recent travel history"
      ],
      tags: ["Instant approval", "No embassy visit"]
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // Auto-start hero animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero section with animated background */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/public/lovable-uploads/9cefbbbd-7e23-448d-8283-5eeeaa1fc977.png')] bg-cover bg-center opacity-10"></div>
          </div>
          
          {/* Animated circles */}
          <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-10 left-1/3 w-40 h-40 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium">98% visa approval rate</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">Perfect Visa</span> for Your Journey
              </h1>
              
              <p className="text-lg md:text-xl opacity-90 mb-8 max-w-xl">
                Answer a few simple questions and we'll help you find the ideal visa for your travel needs, with personalized recommendations.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
                >
                  <Globe className="h-4 w-4 text-blue-300" />
                  <span className="text-sm">190+ countries covered</span>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
                >
                  <Timer className="h-4 w-4 text-blue-300" />
                  <span className="text-sm">Fast processing times</span>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
                >
                  <ShieldCheck className="h-4 w-4 text-blue-300" />
                  <span className="text-sm">Expert assistance</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Popular destinations */}
        <div className="container mx-auto px-4 py-8">
          <div className="mb-12">
            <h2 className="text-lg font-medium text-gray-500 mb-4">Popular destinations</h2>
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
              {popularDestinations.map((destination) => (
                <motion.div
                  key={destination.id}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0"
                >
                  <Button 
                    variant="outline" 
                    className="rounded-full border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                    onClick={() => setToCountry(destination.id)}
                  >
                    <span className="mr-2 text-xl">{destination.flag}</span>
                    {destination.name}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Visa finder form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* Progress bar */}
                <div className="w-full h-1 bg-gray-100">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 ease-in-out"
                    style={{ width: `${(formStep + 1) * (100/3)}%` }}
                  ></div>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 md:p-8">
                  <AnimatePresence mode="wait">
                    {formStep === 0 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Where are you traveling?</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div>
                            <Label htmlFor="fromCountry" className="text-gray-700 mb-2 block">Your Citizenship</Label>
                            <Select value={fromCountry} onValueChange={setFromCountry}>
                              <SelectTrigger id="fromCountry" className="mt-1 border-gray-300 bg-white focus:ring-indigo-500 focus:border-indigo-500">
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="us">United States</SelectItem>
                                <SelectItem value="ca">Canada</SelectItem>
                                <SelectItem value="uk">United Kingdom</SelectItem>
                                <SelectItem value="au">Australia</SelectItem>
                                <SelectItem value="in">India</SelectItem>
                                <SelectItem value="br">Brazil</SelectItem>
                                <SelectItem value="fr">France</SelectItem>
                                <SelectItem value="de">Germany</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="toCountry" className="text-gray-700 mb-2 block">Destination Country</Label>
                            <Select value={toCountry} onValueChange={setToCountry}>
                              <SelectTrigger id="toCountry" className="mt-1 border-gray-300 bg-white focus:ring-indigo-500 focus:border-indigo-500">
                                <SelectValue placeholder="Select destination" />
                              </SelectTrigger>
                              <SelectContent className="max-h-80">
                                <SelectItem value="us">United States</SelectItem>
                                <SelectItem value="ca">Canada</SelectItem>
                                <SelectItem value="uk">United Kingdom</SelectItem>
                                <SelectItem value="au">Australia</SelectItem>
                                <SelectItem value="jp">Japan</SelectItem>
                                <SelectItem value="sg">Singapore</SelectItem>
                                <SelectItem value="fr">France</SelectItem>
                                <SelectItem value="de">Germany</SelectItem>
                                <SelectItem value="nz">New Zealand</SelectItem>
                                <SelectItem value="ae">United Arab Emirates</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            onClick={nextStep} 
                            disabled={!fromCountry || !toCountry}
                            className="group bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600"
                          >
                            Continue <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                    
                    {formStep === 1 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Purpose of your travel</h3>
                        
                        <div className="mb-8">
                          <Label className="text-gray-700 mb-4 block">Select purpose of travel</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {[
                              { value: "tourism", icon: <Plane />, label: "Tourism" },
                              { value: "business", icon: <Briefcase />, label: "Business" },
                              { value: "study", icon: <GraduationCap />, label: "Study" },
                              { value: "work", icon: <Home />, label: "Work" },
                              { value: "family", icon: <Heart />, label: "Family Visit" },
                              { value: "residence", icon: <Home />, label: "Residence" },
                              { value: "transit", icon: <Plane />, label: "Transit" }
                            ].map((item) => (
                              <motion.div
                                key={item.value}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setPurpose(item.value)}
                                className={`border rounded-xl p-4 text-center cursor-pointer transition-all ${
                                  purpose === item.value 
                                    ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-500/20 shadow-sm text-indigo-700" 
                                    : "hover:border-gray-300 hover:shadow-sm"
                                }`}
                              >
                                <div className={`flex justify-center mb-3 ${purpose === item.value ? "text-indigo-600" : "text-gray-500"}`}>
                                  {item.icon}
                                </div>
                                <div className="text-sm font-medium">{item.label}</div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <Button 
                            variant="outline" 
                            onClick={prevStep}
                          >
                            Back
                          </Button>
                          
                          <Button 
                            onClick={nextStep} 
                            disabled={!purpose}
                            className="group bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600"
                          >
                            Continue <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                    
                    {formStep === 2 && (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Length of stay</h3>
                        
                        <div className="mb-8">
                          <Label className="text-gray-700 mb-4 block">How long will you stay?</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { value: "short", icon: <Clock />, label: "< 30 days" },
                              { value: "medium", icon: <CalendarDays />, label: "1-6 months" },
                              { value: "long", icon: <CalendarDays />, label: "6-12 months" },
                              { value: "extended", icon: <Home />, label: "> 1 year" }
                            ].map((item) => (
                              <motion.div
                                key={item.value}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setDuration(item.value)}
                                className={`border rounded-xl p-4 text-center cursor-pointer transition-all ${
                                  duration === item.value 
                                    ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-500/20 shadow-sm text-indigo-700" 
                                    : "hover:border-gray-300 hover:shadow-sm"
                                }`}
                              >
                                <div className={`flex justify-center mb-3 ${duration === item.value ? "text-indigo-600" : "text-gray-500"}`}>
                                  {item.icon}
                                </div>
                                <div className="text-sm font-medium">{item.label}</div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <Button 
                            variant="outline" 
                            onClick={prevStep}
                          >
                            Back
                          </Button>
                          
                          <Button 
                            type="submit" 
                            disabled={!duration || isLoading}
                            className="group relative bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 min-w-32"
                          >
                            {isLoading ? (
                              <>
                                <span className="opacity-0">Search</span>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                </div>
                              </>
                            ) : (
                              <>
                                Find Visa Options <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results section */}
          {resultsVisible && (
            <motion.div 
              id="results-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-16"
            >
              <div className="border-b pb-4 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full inline-flex items-center mb-3">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Results found</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Recommended Visa Options</h2>
                  <p className="text-gray-600">Based on your selections, here are the visa options available</p>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visaResults.map((visa, index) => (
                  <motion.div
                    key={visa.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index + 0.3, duration: 0.5 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <Card className="h-full group overflow-hidden border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
                              {visa.name}
                            </h3>
                            <p className="text-gray-600 text-sm">{visa.description}</p>
                          </div>
                          <div className="bg-indigo-100 text-indigo-700 rounded-full px-2 py-1 text-xs font-semibold">
                            {visa.successRate}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {visa.tags.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="space-y-3 mb-6 p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Processing time:</span>
                            <span className="font-medium text-sm">{visa.processingTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Validity:</span>
                            <span className="font-medium text-sm">{visa.validityPeriod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-sm">Price:</span>
                            <span className="font-medium text-sm">{visa.price}</span>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="font-medium mb-2 text-sm">Key Requirements</h4>
                          <ul className="text-sm space-y-1">
                            {visa.requirements.map((req, i) => (
                              <li key={i} className="flex items-start">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> 
                                <span className="text-gray-600">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
      <Link to={`/countries`}>
        <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 group">
          Apply Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 text-center"
              >
                <h3 className="text-gray-700 font-medium mb-4">Not sure which visa is right for you?</h3>
                <Button variant="outline" className="mr-4">Chat with an Expert</Button>
                <Button variant="outline">View All Visa Types</Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VisaFinder;
