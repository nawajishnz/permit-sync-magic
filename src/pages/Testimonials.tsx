
import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { getTestimonials, getApprovedVisas, type Testimonial, type ApprovedVisa } from '@/models/testimonials';
import { Star, MapPin, Calendar, Users, BarChart4 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useEmblaCarousel from 'embla-carousel-react';
import AutoPlay from 'embla-carousel-autoplay';
import { cn } from "@/lib/utils";

const TestimonialsPage = () => {
  const [activeTab, setActiveTab] = useState<string>('testimonials');
  
  const { data: testimonials, isLoading: isLoadingTestimonials } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => getTestimonials(true)
  });
  
  const { data: approvedVisas, isLoading: isLoadingVisas } = useQuery({
    queryKey: ['approvedVisas'],
    queryFn: getApprovedVisas
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', dragFree: true }, [
    AutoPlay({ delay: 3000, stopOnInteraction: false })
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-20 md:pt-24 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Success Stories</h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Discover how we've helped travelers around the world achieve their visa and travel documentation goals.
              </p>
              
              <div className="flex justify-center items-center mt-8 space-x-10">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-900 rounded-full p-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-2xl md:text-3xl">1,00,000+</p>
                    <p className="text-gray-500">Happy Users</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-gray-900 rounded-full p-3">
                    <BarChart4 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-2xl md:text-3xl">4.8 <span className="text-yellow-400">★</span></p>
                    <p className="text-gray-500">Google rating</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="testimonials" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-center mb-8">
                <TabsList className="grid grid-cols-2 w-full max-w-md">
                  <TabsTrigger value="testimonials">Client Testimonials</TabsTrigger>
                  <TabsTrigger value="visas">Approved Visas</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="testimonials">
                {isLoadingTestimonials ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : testimonials && testimonials.length > 0 ? (
                  <div>
                    <div className="overflow-hidden" ref={emblaRef}>
                      <div className="flex">
                        {testimonials.map((testimonial) => (
                          <div key={testimonial.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] px-3">
                            <TestimonialCard testimonial={testimonial} />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-8 gap-3">
                      <Button 
                        onClick={scrollPrev}
                        variant="outline" 
                        size="icon"
                        className="rounded-full border border-gray-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m15 18-6-6 6-6"/></svg>
                        <span className="sr-only">Previous</span>
                      </Button>
                      <Button 
                        onClick={scrollNext}
                        variant="outline"
                        size="icon" 
                        className="rounded-full border border-gray-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m9 18 6-6-6-6"/></svg>
                        <span className="sr-only">Next</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No testimonials available at the moment.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="visas">
                {isLoadingVisas ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : approvedVisas && approvedVisas.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {approvedVisas.map((visa) => (
                      <ApprovedVisaCard key={visa.id} visa={visa} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No approved visas available at the moment.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const initials = getInitials(testimonial.client_name);
  const bgColor = "#4263eb"; // You could randomize this or derive from name

  return (
    <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: bgColor }}
          >
            {testimonial.avatar_url ? (
              <img 
                src={testimonial.avatar_url} 
                alt={testimonial.client_name} 
                className="h-full w-full rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{testimonial.client_name}</h3>
            <p className="text-sm text-gray-500">{testimonial.country}</p>
            
            <div className="flex my-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "h-4 w-4",
                    i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
            
            <p className="text-gray-600 text-sm line-clamp-4">"{testimonial.comment}"</p>
            
            <div className="mt-2">
              <Badge variant="outline" className="text-blue-600">
                {testimonial.visa_type}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ApprovedVisaCard = ({ visa }: { visa: ApprovedVisa }) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="h-48 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
        <img 
          src={visa.image_url} 
          alt={`Approved visa`}
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
      </div>
      <CardContent className="p-4">
        <Badge className="mb-2 bg-green-100 text-green-800 hover:bg-green-200">
          Approved
        </Badge>
        <div className="mt-2 text-sm text-gray-600 flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {visa.destination || visa.country}
        </div>
        <div className="mt-1 text-sm text-gray-600 flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(visa.approval_date).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialsPage;
