import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PopularDestinations from '@/components/PopularDestinations';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import PopularCountries from '@/components/PopularCountries';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Shield, Users, Clock, Award, Globe, Zap, ArrowRight, LightbulbIcon, MapPin, FileCheck, ChevronRight } from 'lucide-react';
import WhyChooseUs from '@/components/WhyChooseUs';
import TrustedPartners from '@/components/TrustedPartners';
import ApplicationSteps from '@/components/ApplicationSteps';
import { useIsMobile } from '@/hooks/use-mobile';
import VisaComparisonSection from '@/components/VisaComparisonSection';
import TravelTipsSection from '@/components/TravelTipsSection';
import VisaDocumentChecklist from '@/components/VisaDocumentChecklist';
import AddonServicesSection from '@/components/countries/AddonServicesSection';
import { getAddonServices, AddonService } from '@/models/addon_services';
import ApprovedVisas from '@/components/ApprovedVisas';

const Index = () => {
  const isMobile = useIsMobile();
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };
  
  const [addonServices, setAddonServices] = useState<AddonService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const services = await getAddonServices();
        setAddonServices(services.slice(0, 4)); // Get first 4 services for the homepage
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching addon services:", error);
        // Fallback to sample data if there's an error or no services found
        if (addonServices.length === 0) {
          setAddonServices(sampleAddonServices);
        }
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  // Sample add-on services data as fallback
  const sampleAddonServices: AddonService[] = [
    {
      id: '1',
      name: 'Rental Agreement',
      description: 'Legal documentation for property rental with verified attestation',
      price: '1200',
      delivery_days: 3,
      discount_percentage: 20,
      image_url: 'https://images.pexels.com/photos/955395/pexels-photo-955395.jpeg'
    },
    {
      id: '2',
      name: 'Hotel Booking',
      description: 'Premium hotel reservation service with guaranteed confirmation',
      price: '800',
      delivery_days: 2,
      discount_percentage: 15,
      image_url: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'
    },
    {
      id: '3',
      name: 'Flight Tickets',
      description: 'Discounted international flight booking with flexible changes',
      price: '800',
      delivery_days: 1,
      discount_percentage: 10,
      image_url: 'https://images.pexels.com/photos/62623/wing-plane-flying-airplane-62623.jpeg'
    },
    {
      id: '4',
      name: 'Police Clearance Certificate',
      description: 'Official criminal record verification from authorities',
      price: '2500',
      delivery_days: 7,
      discount_percentage: 5,
      image_url: 'https://images.pexels.com/photos/4021256/pexels-photo-4021256.jpeg'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50/30 overflow-x-hidden">
      <Header />
      <main className="flex-grow">
        <Hero />
        
        {/* Why Travelers Trust Permitsy - Modern Redesign */}
        <section className="py-20 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-white/90"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-indigo-100 rounded-full opacity-10 blur-3xl"></div>
          
          <div className="container relative mx-auto px-4 z-10">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.span 
                className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                Our Success Metrics
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-700">Why Travelers Trust Permitsy</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">Our proven track record speaks for itself - join thousands of satisfied travelers who've simplified their visa journey with us.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              {[
                { 
                  icon: Shield, 
                  count: '98%', 
                  label: 'Success Rate', 
                  description: 'Applications approved on first submission',
                  color: 'from-blue-500 to-blue-600',
                  bgColor: 'bg-blue-50',
                  textColor: 'text-blue-600' 
                },
                { 
                  icon: Users, 
                  count: '50k+', 
                  label: 'Happy Travelers', 
                  description: 'Satisfied customers worldwide',
                  color: 'from-indigo-500 to-indigo-600',
                  bgColor: 'bg-indigo-50',
                  textColor: 'text-indigo-600' 
                },
                { 
                  icon: Clock, 
                  count: '10x', 
                  label: 'Faster Processing', 
                  description: 'Compared to traditional methods',
                  color: 'from-teal-500 to-teal-600',
                  bgColor: 'bg-teal-50',
                  textColor: 'text-teal-600' 
                }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/50 rounded-2xl transform group-hover:-translate-y-2 transition-all duration-300 blur-sm opacity-0 group-hover:opacity-100"></div>
                  <div className="flex flex-col h-full items-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 relative z-10 hover:shadow-2xl transition-all duration-300">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-6 shadow-lg`}>
                      <stat.icon className="h-9 w-9 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-2 relative">
                      {stat.count}
                      <div className="absolute -top-1 -right-4 w-3 h-3 rounded-full bg-indigo-500 opacity-70 animate-pulse"></div>
                    </h3>
                    <p className="text-xl font-semibold text-gray-800 mb-3">{stat.label}</p>
                    <p className="text-gray-600 text-center">{stat.description}</p>
                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.bgColor} rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link to="/countries">
                <Button variant="gradient" size="lg">
                  Browse Destination Countries
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <ApplicationSteps />
        
        {/* Document Checklist - New Section */}
        <VisaDocumentChecklist />
        
        <div className="py-12 md:py-20 bg-white px-4">
          <PopularDestinations />
        </div>
        
        <HowItWorks />
        
        {/* Visa Comparison - New Section */}
        <VisaComparisonSection />
        
        <WhyChooseUs />
        
        <TravelTipsSection />

        {/* Addon Services Section */}
        <AddonServicesSection />
        
        {/* Approved Visas Section */}
        <div className="bg-white py-4">
          <ApprovedVisas />
        </div>
        
        <div className="py-12 md:py-20 bg-gradient-to-b from-blue-50/60 to-white px-4">
          <Testimonials />
        </div>
        
        <TrustedPartners />
        
        <div className="py-12 md:py-20 bg-white px-4">
          <PopularCountries />
        </div>
        
        {/* Admin login section */}
        <motion.div 
          className="py-12 bg-gray-50 border-t border-gray-200 px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Portal</h2>
              <p className="text-gray-600 mb-6">
                If you're an administrator, access the admin dashboard to manage countries, visa applications, and more.
              </p>
              <Link to="/admin-login">
                <Button variant="default">
                  Access Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
