import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Search, FileText, Check, X, Hotel, Plane, Shield, FileCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AddonService, getAddonServices } from '@/models/addon_services';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

const AddonServices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Define categories based on service names
  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'document', name: 'Document Services' },
    { id: 'travel', name: 'Travel Services' },
    { id: 'legal', name: 'Legal Services' },
  ];

  // Fetch addon services using React Query
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['addon-services'],
    queryFn: getAddonServices,
  });
  
  // Filter services based on search term and active category
  const filteredServices = services.filter(service => {
    // Search filter
    const matchesSearch = !searchTerm || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    let matchesCategory = true;
    if (activeCategory !== 'all') {
      if (activeCategory === 'document') {
        matchesCategory = 
          service.name.toLowerCase().includes('document') || 
          service.name.toLowerCase().includes('certificate') ||
          service.name.toLowerCase().includes('attestation') ||
          service.name.toLowerCase().includes('transcript');
      } else if (activeCategory === 'travel') {
        matchesCategory = 
          service.name.toLowerCase().includes('hotel') || 
          service.name.toLowerCase().includes('flight') ||
          service.name.toLowerCase().includes('travel') ||
          service.name.toLowerCase().includes('insurance');
      } else if (activeCategory === 'legal') {
        matchesCategory = 
          service.name.toLowerCase().includes('agreement') || 
          service.name.toLowerCase().includes('legal') ||
          service.name.toLowerCase().includes('police') ||
          service.name.toLowerCase().includes('passport') ||
          service.name.toLowerCase().includes('registration');
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  // Get service icon based on service type
  const getServiceIcon = (serviceName: string) => {
    const icons: Record<string, React.ElementType> = {
      'Rental Agreement': FileText,
      'Hotel Booking': Hotel,
      'Flight Tickets': Plane,
      'Police Clearance Certificate': Shield,
      'Document Attestation': FileText,
      'Transcript': FileText,
      'Travel Insurance': Shield,
      'Passport Registration/Renew': FileCheck
    };
    
    const IconComponent = icons[serviceName] || FileText;
    return <IconComponent className="h-4 w-4 mr-1.5 text-green-500" />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="bg-indigo-600 py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-800 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Additional Services for Your Visa Journey
              </motion.h1>
              <motion.p 
                className="text-xl text-indigo-100 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Enhance your travel experience with our premium add-on services designed to make your visa application seamless and stress-free.
              </motion.p>
              
              <motion.div
                className="relative max-w-xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for services..."
                  className="w-full pl-10 py-6 text-lg rounded-full shadow-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Services Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <Tabs defaultValue="all" onValueChange={setActiveCategory}>
                <TabsList className="w-full md:w-auto mx-auto flex justify-center mb-8 bg-gray-100 p-1 rounded-full">
                  {categories.map(category => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="rounded-full px-6 py-2 text-sm font-medium"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {categories.map(category => (
                  <TabsContent key={category.id} value={category.id} className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {isLoading ? (
                        // Skeleton loading state
                        Array.from({ length: 8 }).map((_, index) => (
                          <Card key={`skeleton-${index}`} className="overflow-hidden h-full border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                            <Skeleton className="h-48 w-full" />
                            <CardContent className="p-4">
                              <Skeleton className="h-6 w-3/4 mb-2 mt-2" />
                              <Skeleton className="h-4 w-1/2 mb-4" />
                              <Skeleton className="h-20 w-full mb-4" />
                              <Skeleton className="h-10 w-full rounded" />
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        filteredServices.map((service) => {
                          // Convert service ID to a number for arithmetic operations
                          const serviceIdNumber = typeof service.id === 'number' ? 
                            service.id : Number(service.id) || 0;
                          
                          return (
                            <motion.div
                              key={service.id}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3 }}
                              whileHover={{ 
                                y: -5,
                                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                              }}
                              className="h-full"
                            >
                              <div className="bg-white rounded-xl overflow-hidden h-full flex flex-col border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative">
                                {/* Top section with image and discount badge */}
                                <div className="relative group">
                                  {service.discount_percentage && service.discount_percentage > 0 && (
                                    <div className="absolute top-4 right-4 z-20 flex items-center justify-center">
                                      <div className="relative">
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-full absolute animate-ping opacity-20"></div>
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center justify-center relative">
                                          <span className="text-lg font-extrabold">{service.discount_percentage}%</span>
                                          <span className="text-xs ml-0.5 font-medium">OFF</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <div className="h-[220px] overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200">
                                    <img 
                                      src={service.image_url}
                                      alt={service.name} 
                                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                    />
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300"></div>
                                  
                                  {/* Service type badge */}
                                  <div className="absolute top-4 left-4">
                                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-slate-800 shadow-sm flex items-center">
                                      {getServiceIcon(service.name)}
                                      <span className="ml-1.5">{
                                        service.name.includes('Document') ? 'Document' :
                                        service.name.includes('Hotel') ? 'Accommodation' :
                                        service.name.includes('Insurance') ? 'Insurance' :
                                        service.name.includes('Flight') ? 'Transportation' : 'Service'
                                      }</span>
                                    </div>
                                  </div>
                                  
                                  {/* Title with gradient overlay */}
                                  <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <h3 className="text-white text-xl font-bold drop-shadow-md group-hover:text-teal-200 transition-colors duration-300">{service.name}</h3>
                                  </div>
                                </div>
                                
                                {/* Content section */}
                                <div className="p-5 flex-grow flex flex-col">
                                  {/* Price and delivery time */}
                                  <div className="flex justify-between items-center mb-4">
                                    <div className="flex flex-col">
                                      <div className="flex items-baseline">
                                        <span className="font-bold text-2xl text-slate-800">₹{service.price}</span>
                                        {service.discount_percentage && service.discount_percentage > 0 && (
                                          <span className="text-sm font-medium text-gray-500 line-through ml-2">
                                            ₹{Math.round(Number(service.price) / (1 - Number(service.discount_percentage)/100))}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-500">Per person</span>
                                    </div>
                                    <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                                      <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                                      <span className="font-medium text-sm">{service.delivery_days} Days</span>
                                    </div>
                                  </div>
                                  
                                  {/* Description */}
                                  <p className="text-gray-600 mb-6 text-sm flex-grow line-clamp-3">{service.description}</p>
                                  
                                  {/* Features list */}
                                  <div className="mt-auto space-y-2.5 mb-5">
                                    <div className="flex items-center text-sm text-gray-700">
                                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2.5 flex-shrink-0">
                                        <Check className="h-3 w-3 text-green-600" />
                                      </div>
                                      <span>Embassy approved documentation</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-700">
                                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2.5 flex-shrink-0">
                                        <Check className="h-3 w-3 text-green-600" />
                                      </div>
                                      <span>Secure online processing</span>
                                    </div>
                                  </div>
                                  
                                  {/* Button */}
                                  <Link to={`/addon-services/${service.id}`} className="block">
                                    <Button className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white shadow-md group flex items-center justify-center h-11 border-0">
                                      View Details 
                                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                    
                    {/* empty state */}
                    {!isLoading && filteredServices.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No services found</h3>
                        <p className="text-gray-500 mb-6">We couldn't find any services matching your search criteria.</p>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchTerm('');
                            setActiveCategory('all');
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </section>
        
        {/* Why Choose Our Services */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                Our Commitment
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our Add-on Services
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We provide premium services to complement your visa application process with guaranteed satisfaction
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Verified Documentation",
                  description: "All documents are verified by legal experts ensuring 100% authenticity and compliance with regulations",
                  icon: <Check className="h-6 w-6 text-green-500" />,
                },
                {
                  title: "Express Processing",
                  description: "Fast-track service with priority processing to meet your urgent travel requirements",
                  icon: <Clock className="h-6 w-6 text-indigo-500" />,
                },
                {
                  title: "100% Success Rate",
                  description: "Our add-on services have a perfect track record of acceptance by visa authorities worldwide",
                  icon: <Badge className="h-6 w-6 text-blue-500" />,
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AddonServices;
