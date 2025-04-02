
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, FileCheck, Award, ArrowRight, CheckCircle, HelpCircle 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AddonService } from '@/models/addon_services';

const AddonServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<AddonService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('addon_services')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setService(data as AddonService);
        } else {
          setError("Service not found");
        }
      } catch (err) {
        console.error("Error fetching addon service:", err);
        setError("Error loading service details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading service details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-lg mx-auto text-center">
              <div className="text-red-500 mb-4">
                <FileCheck className="h-16 w-16 mx-auto" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
              <p className="text-gray-600 mb-8">
                We couldn't find the add-on service you're looking for.
              </p>
              <Link to="/">
                <Button>
                  Return to Home <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Service Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl overflow-hidden shadow-md">
                <div className="relative">
                  <img 
                    src={service.image_url || '/placeholder.svg'} 
                    alt={service.name} 
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg'; // Fallback image
                    }}
                  />
                  {service.discount_percentage && service.discount_percentage > 0 && (
                    <Badge className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1">
                      {service.discount_percentage}% OFF
                    </Badge>
                  )}
                </div>
                
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h1>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm font-medium">
                      <Clock className="h-4 w-4 mr-1" />
                      Delivery in {service.delivery_days} days
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6">{service.description}</p>
                  
                  {service.long_description && (
                    <div className="mt-4 mb-6">
                      <h2 className="text-lg font-bold text-gray-900 mb-3">Detailed Description</h2>
                      <p className="text-gray-700">{service.long_description}</p>
                    </div>
                  )}
                  
                  {service.process && service.process.length > 0 && (
                    <div className="mt-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-4">How It Works</h2>
                      <div className="space-y-3">
                        {service.process.map((step, index) => (
                          <div key={index} className="flex">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal flex items-center justify-center text-white font-semibold">
                              {index + 1}
                            </div>
                            <div className="ml-4">
                              <p className="text-gray-700">{step}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {service.requirements && service.requirements.length > 0 && (
                    <div className="mt-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
                      <ul className="space-y-2">
                        {service.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-teal mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              {/* FAQs Section */}
              {service.faqs && service.faqs.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 mt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {(service.faqs as {question: string, answer: string}[]).map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-start">
                            <HelpCircle className="h-5 w-5 text-teal mr-2 flex-shrink-0 mt-0.5" />
                            <span>{faq.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-7 text-gray-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </div>
            
            {/* Order Card */}
            <div>
              <Card className="sticky top-8 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Service Summary</CardTitle>
                  <CardDescription>Complete details and pricing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                      <span className="text-gray-600">Service Price</span>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">₹{service.price}</div>
                        <div className="text-sm text-gray-500">Per person/document</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                      <span className="text-gray-600">Delivery Time</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="font-medium">{service.delivery_days} days</span>
                      </div>
                    </div>
                    
                    {service.discount_percentage && service.discount_percentage > 0 && (
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <span className="text-gray-600">Discount</span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          {service.discount_percentage}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button className="w-full bg-teal hover:bg-teal/90">
                    Add to Application
                  </Button>
                  <Button variant="outline" className="w-full">
                    Contact for Questions
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddonServiceDetail;
