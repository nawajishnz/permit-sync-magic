
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, Check, ArrowLeft, Calendar, File, Shield, 
  RefreshCw, HelpCircle, Download, ChevronDown, ChevronUp
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
import { AddonService, getAddonServiceById } from '@/models/addon_services';
import { useToast } from '@/hooks/use-toast';

const AddonServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<AddonService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setIsError(false);
        const data = await getAddonServiceById(id);
        setService(data);
      } catch (error) {
        console.error(`Error fetching service with id ${id}:`, error);
        setIsError(true);
        toast({
          title: "Error loading service",
          description: "We couldn't load the requested service. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchService();
  }, [id, toast]);

  // Fallback data in case of error or for preview
  const fallbackService: AddonService = {
    id: '1',
    name: 'Rental Agreement',
    description: 'Legal documentation for property rental with verified attestation',
    long_description: 'Our Rental Agreement service provides legally binding documentation for your property rental needs. Each agreement is prepared by legal experts and includes all necessary clauses to protect both parties. The document is officially notarized and includes embassy attestation when required for visa applications.',
    price: '1200',
    delivery_days: 3,
    discount_percentage: 20,
    image_url: '/placeholder.svg',
    requirements: [
      'Valid passport copy',
      'Visa application number',
      'Property details',
      'Landlord contact information',
      'Intended period of stay'
    ],
    process: [
      'Submit your details through our online form',
      'Our legal team prepares the rental agreement',
      'Document is sent for official notarization',
      'Final verification and quality check',
      'Digital copy delivered to your email',
      'Original document delivered to your address'
    ],
    faqs: [
      {
        question: 'Is this rental agreement legally valid for visa applications?',
        answer: 'Yes, our rental agreements are legally valid and accepted by all embassies and visa authorities. They include all required attestations and notarizations.'
      },
      {
        question: 'How quickly can I get the rental agreement?',
        answer: 'Standard processing time is 3 business days. For urgent requirements, we offer express service at an additional cost, which delivers within 24 hours.'
      },
      {
        question: 'Can I make changes to the agreement after it\'s prepared?',
        answer: 'Minor changes can be accommodated before final notarization. Major changes may require a new document and additional fees.'
      },
      {
        question: 'Will I get a physical copy of the agreement?',
        answer: 'Yes, you'll receive both a digital copy via email and a physical copy delivered to your preferred address.'
      }
    ]
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

  const displayService = service || fallbackService;

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
                    {displayService.discount_percentage && displayService.discount_percentage > 0 && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold z-10">
                        {displayService.discount_percentage}% DISCOUNT
                      </div>
                    )}
                    <img 
                      src={displayService.image_url || '/placeholder.svg'} 
                      alt={displayService.name} 
                      className="w-full h-96 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{displayService.name}</h1>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <Badge variant="outline" className="flex items-center px-3 py-1 bg-indigo-50 border-indigo-200 text-indigo-700">
                      <Clock className="h-4 w-4 mr-1" />
                      {displayService.delivery_days} Days Delivery
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
                    <p className="text-gray-600 mb-4">{displayService.long_description || displayService.description}</p>
                    
                    <p className="text-gray-600">Our {displayService.name.toLowerCase()} service is designed to meet the highest standards required by visa authorities worldwide. All documents are thoroughly verified and authenticated to ensure a smooth visa application process.</p>
                  </div>
                  
                  <Tabs defaultValue="requirements" className="mb-8">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="requirements">Requirements</TabsTrigger>
                      <TabsTrigger value="process">Process</TabsTrigger>
                      <TabsTrigger value="faq">FAQ</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="requirements" className="p-6 bg-white rounded-b-lg shadow-sm">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">What You'll Need</h3>
                      {displayService.requirements && displayService.requirements.length > 0 ? (
                        <ul className="space-y-3">
                          {displayService.requirements.map((req, index) => (
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
                      {displayService.process && displayService.process.length > 0 ? (
                        <ol className="space-y-6 relative border-l border-gray-200 pl-6 ml-3">
                          {displayService.process.map((step, index) => (
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
                      {displayService.faqs && displayService.faqs.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                          {displayService.faqs.map((faq, index) => (
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
                              Standard processing takes {displayService.delivery_days} business days. For urgent requirements, we offer express service at an additional cost.
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
                          <AccordionItem value="faq-4">
                            <AccordionTrigger className="text-left font-medium text-gray-800">
                              What happens if my visa application is rejected?
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600">
                              Our documents meet all visa requirements. If your visa is rejected due to documentation issues related to our service, we offer a full refund.
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
                          {displayService.discount_percentage && displayService.discount_percentage > 0 ? (
                            <>
                              <span className="text-gray-400 line-through text-sm mr-2">
                                ₹{Math.round(Number(displayService.price) * (1 + displayService.discount_percentage / 100))}
                              </span>
                              <span className="font-bold text-xl text-gray-900">₹{displayService.price}</span>
                            </>
                          ) : (
                            <span className="font-bold text-xl text-gray-900">₹{displayService.price}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-500">Delivery Time</span>
                        </div>
                        <span className="font-medium text-gray-900">{displayService.delivery_days} business days</span>
                      </div>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">Embassy approved documentation</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">Digital & physical copies provided</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">24/7 support throughout the process</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">100% money-back guarantee</span>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6 mb-4">
                        Order Now
                      </Button>
                      
                      <Button variant="outline" className="w-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Schedule Consultation</span>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Related Services Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Other Services You Might Need</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  id: '2',
                  name: 'Hotel Booking',
                  description: 'Premium hotel reservation service with guaranteed confirmation',
                  price: '800',
                  delivery_days: 2,
                  image_url: '/placeholder.svg'
                },
                {
                  id: '3',
                  name: 'Flight Tickets',
                  description: 'Discounted international flight booking with flexible changes',
                  price: '800',
                  delivery_days: 1,
                  image_url: '/placeholder.svg'
                },
                {
                  id: '5',
                  name: 'Document Attestation',
                  description: 'Professional attestation service for all document types',
                  price: '1500',
                  delivery_days: 5,
                  image_url: '/placeholder.svg'
                },
                {
                  id: '7',
                  name: 'Travel Insurance',
                  description: 'Comprehensive travel insurance with worldwide coverage',
                  price: '600',
                  delivery_days: 1,
                  image_url: '/placeholder.svg'
                }
              ].filter(s => s.id !== id).slice(0, 4).map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="h-full"
                >
                  <Card className="overflow-hidden h-full flex flex-col border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                    <div className="relative">
                      <img 
                        src={service.image_url || '/placeholder.svg'} 
                        alt={service.name} 
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute bottom-0 w-full bg-indigo-900 py-3 px-4 text-white font-semibold text-center">
                        {service.name}
                      </div>
                    </div>
                    
                    <CardContent className="p-4 flex-grow flex flex-col">
                      <div className="flex justify-between items-center mb-2 mt-2">
                        <span className="font-bold text-lg text-gray-900">₹{service.price}</span>
                        <div className="flex items-center text-gray-700 text-sm">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{service.delivery_days}d</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 flex-grow">{service.description}</p>
                      
                      <Link to={`/addon-services/${service.id}`}>
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
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

export default AddonServiceDetail;
