import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, Check, ArrowLeft, Calendar, File, Shield, 
  RefreshCw, HelpCircle, Download, ChevronDown, ChevronUp,
  Hotel, Plane, FileText, FileCheck
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AddonService, getAddonServiceById, getAddonServices } from '@/models/addon_services';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

const AddonServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Fetch the specific addon service
  const { 
    data: service,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['addon-service', id],
    queryFn: () => id ? getAddonServiceById(id) : Promise.reject('No ID provided'),
    enabled: !!id,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error loading service",
          description: "We couldn't load the requested service. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  // Fetch all addon services for related services section
  const { data: allServices = [] } = useQuery({
    queryKey: ['addon-services'],
    queryFn: getAddonServices,
  });

  // Get appropriate icon based on service type
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
    return <IconComponent className="h-5 w-5 mr-2 text-indigo-600" />;
  };

  // Handle order now button click
  const handleOrderNow = () => {
    toast({
      title: "Order Initiated",
      description: `Your ${service?.name} order has been initiated. Redirecting to payment.`,
    });
    
    // Navigate to a dummy checkout page or actual checkout
    setTimeout(() => {
      navigate('/visa-application/usa/0', { 
        state: { 
          serviceOrder: true,
          serviceName: service?.name,
          servicePrice: service?.price
        } 
      });
    }, 1500);
  };

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <Skeleton className="h-8 w-28" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full rounded-xl mb-6" />
                <Skeleton className="h-10 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-8" />
              </div>
              
              <div>
                <Skeleton className="h-64 w-full rounded-xl mb-6" />
                <Skeleton className="h-10 w-full rounded mb-4" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 py-12 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
            <p className="text-gray-600 mb-6">The service you're looking for doesn't exist or has been removed.</p>
            <Link to="/addon-services">
              <Button>Browse All Services</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get related services excluding current one (up to 3)
  const relatedServices = allServices
    .filter(s => s.id !== service.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* Service Hero */}
        <section className="pt-12 pb-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Link to="/addon-services" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Back to All Services</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Service Details */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative rounded-xl overflow-hidden mb-8">
                    {service.discount_percentage && service.discount_percentage > 0 && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold z-10">
                        {service.discount_percentage}% DISCOUNT
                      </div>
                    )}
                    <img 
                      src={service.image_url || `https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80`} 
                      alt={service.name} 
                      className="w-full h-96 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80`; 
                      }}
                    />
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{service.name}</h1>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <Badge variant="outline" className="flex items-center px-3 py-1 bg-indigo-50 border-indigo-200 text-indigo-700">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.delivery_days} Days Delivery
                    </Badge>
                    <Badge variant="outline" className="flex items-center px-3 py-1 bg-green-50 border-green-200 text-green-700">
                      <Check className="h-4 w-4 mr-1" />
                      Official Documentation
                    </Badge>
                    <Badge variant="outline" className="flex items-center px-3 py-1 bg-blue-50 border-blue-200 text-blue-700">
                      <Shield className="h-4 w-4 mr-1" />
                      Visa Authority Accepted
                    </Badge>
                  </div>
                  
                  <div className="prose prose-lg max-w-none mb-10">
                    <p className="text-gray-600 mb-4">{service.long_description || service.description}</p>
                    
                    <p className="text-gray-600">Our {service.name.toLowerCase()} service is designed to meet the highest standards required by visa authorities worldwide. All documents are thoroughly verified and authenticated to ensure a smooth visa application process.</p>
                  </div>
                  
                  <Tabs defaultValue="requirements" className="mb-8">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="requirements">Requirements</TabsTrigger>
                      <TabsTrigger value="process">Process</TabsTrigger>
                      <TabsTrigger value="faq">FAQ</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="requirements" className="p-6 bg-white rounded-b-lg shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What You'll Need</h3>
                      {service.requirements && service.requirements.length > 0 ? (
                        <ul className="space-y-3">
                          {service.requirements.map((req, index) => (
                            <li key={index} className="flex items-start">
                              <div className="flex-shrink-0 mr-2 mt-1">
                                <Check className="h-5 w-5 text-green-500" />
                              </div>
                              <span className="text-gray-700">{req}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <div className="flex-shrink-0 mr-2 mt-1">
                              <Check className="h-5 w-5 text-green-500" />
                            </div>
                            <span className="text-gray-700">Valid passport with at least 6 months validity</span>
                          </li>
                          <li className="flex items-start">
                            <div className="flex-shrink-0 mr-2 mt-1">
                              <Check className="h-5 w-5 text-green-500" />
                            </div>
                            <span className="text-gray-700">Visa application reference number</span>
                          </li>
                          <li className="flex items-start">
                            <div className="flex-shrink-0 mr-2 mt-1">
                              <Check className="h-5 w-5 text-green-500" />
                            </div>
                            <span className="text-gray-700">Personal details as per passport</span>
                          </li>
                          <li className="flex items-start">
                            <div className="flex-shrink-0 mr-2 mt-1">
                              <Check className="h-5 w-5 text-green-500" />
                            </div>
                            <span className="text-gray-700">Travel itinerary and accommodation details</span>
                          </li>
                        </ul>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="process" className="p-6 bg-white rounded-b-lg shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h3>
                      {service.process && service.process.length > 0 ? (
                        <ol className="space-y-6 relative border-l border-gray-200 pl-6 ml-3">
                          {service.process.map((step, index) => (
                            <li key={index} className="relative">
                              <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center border border-white">
                                {index + 1}
                              </div>
                              <h4 className="text-lg font-medium text-gray-900">{step}</h4>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <ol className="space-y-6 relative border-l border-gray-200 pl-6 ml-3">
                          <li className="relative">
                            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center border border-white">
                              1
                            </div>
                            <h4 className="text-lg font-medium text-gray-900">Submit your request</h4>
                            <p className="text-gray-600">Complete our online form with all required details</p>
                          </li>
                          <li className="relative">
                            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center border border-white">
                              2
                            </div>
                            <h4 className="text-lg font-medium text-gray-900">Document preparation</h4>
                            <p className="text-gray-600">Our experts prepare your documents according to official requirements</p>
                          </li>
                          <li className="relative">
                            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center border border-white">
                              3
                            </div>
                            <h4 className="text-lg font-medium text-gray-900">Verification and processing</h4>
                            <p className="text-gray-600">Documents undergo thorough verification and legal processing</p>
                          </li>
                          <li className="relative">
                            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center border border-white">
                              4
                            </div>
                            <h4 className="text-lg font-medium text-gray-900">Delivery</h4>
                            <p className="text-gray-600">Final documents delivered to you electronically and physically</p>
                          </li>
                        </ol>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="faq" className="p-6 bg-white rounded-b-lg shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
                      {service.faqs && service.faqs.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                          {service.faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`faq-${index}`}>
                              <AccordionTrigger className="text-left font-medium text-gray-800">
                                {faq.question}
                              </AccordionTrigger>
                              <AccordionContent className="text-gray-600">
                                {faq.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="faq-1">
                            <AccordionTrigger className="text-left font-medium text-gray-800">
                              How long does it take to process my request?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600">
                              Standard processing takes {service.delivery_days} business days. For urgent requirements, we offer express service at an additional cost.
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="faq-2">
                            <AccordionTrigger className="text-left font-medium text-gray-800">
                              Are these documents accepted by all embassies?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600">
                              Yes, our documents are prepared according to international standards and are accepted by all embassies and visa authorities worldwide.
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="faq-3">
                            <AccordionTrigger className="text-left font-medium text-gray-800">
                              Can I make changes after submitting my request?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600">
                              Minor changes can be accommodated before processing begins. Major changes may require a new application and additional fees.
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </div>
              
              {/* Order Card */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="sticky top-24 border-2 border-gray-200 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Service Summary</h3>
                        <p className="text-gray-600">Complete official documentation service</p>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500">Price</span>
                        <div className="text-right">
                          {service.discount_percentage && service.discount_percentage > 0 ? (
                            <>
                              <span className="text-gray-400 line-through text-sm mr-2">
                                ₹{Math.round(Number(service.price) * (1 + service.discount_percentage / 100))}
                              </span>
                              <span className="font-bold text-xl text-gray-900">₹{service.price}</span>
                            </>
                          ) : (
                            <span className="font-bold text-xl text-gray-900">₹{service.price}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-500">Delivery Time</span>
                        </div>
                        <span className="font-medium text-gray-900">{service.delivery_days} business days</span>
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mt-1 mr-2" />
                          <span className="text-gray-700">Embassy approved documentation</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mt-1 mr-2" />
                          <span className="text-gray-700">Express processing available</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mt-1 mr-2" />
                          <span className="text-gray-700">100% satisfaction guarantee</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mt-1 mr-2" />
                          <span className="text-gray-700">24/7 customer support</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleOrderNow}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white mb-4 py-6 text-lg"
                      >
                        Order Now
                      </Button>
                      
                      <p className="text-center text-sm text-gray-500">
                        No obligations until payment is completed
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
            
            {/* Related Services */}
            {relatedServices.length > 0 && (
              <section className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedServices.map((relatedService) => (
                    <motion.div
                      key={relatedService.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
                        <div className="relative h-48">
                          <img 
                            src={relatedService.image_url || `https://images.unsplash.com/photo-${1618160702438 + relatedService.id * 10000}-9b02ab6515c9?auto=format&fit=crop&w=800&q=80`} 
                            alt={relatedService.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://images.unsplash.com/photo-${1618160702438 + relatedService.id * 10000}-9b02ab6515c9?auto=format&fit=crop&w=800&q=80`;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white text-lg font-semibold">{relatedService.name}</h3>
                          </div>
                        </div>
                        
                        <CardContent className="p-4 flex-grow flex flex-col">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-gray-900">₹{relatedService.price}</span>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{relatedService.delivery_days} days</span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-4 flex-grow">{relatedService.description}</p>
                          
                          <Link to={`/addon-services/${relatedService.id}`} className="mt-auto">
                            <Button variant="outline" className="w-full">View Details</Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AddonServiceDetail;
