import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { getTestimonials, getApprovedVisas, type Testimonial, type ApprovedVisa } from '@/models/testimonials';
import { Star, MapPin, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-20 md:pt-24 bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Success Stories</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover how we've helped travelers around the world achieve their visa and travel documentation goals.
              </p>
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
                    <div className="animate-spin h-12 w-12 border-4 border-teal border-t-transparent rounded-full"></div>
                  </div>
                ) : testimonials && testimonials.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial) => (
                      <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                    ))}
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
                    <div className="animate-spin h-12 w-12 border-4 border-teal border-t-transparent rounded-full"></div>
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
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 rounded-full overflow-hidden mr-4 bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
            {testimonial.avatar_url ? (
              <img 
                src={testimonial.avatar_url} 
                alt={testimonial.client_name} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            ) : (
              testimonial.client_name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{testimonial.client_name}</h3>
            <p className="text-sm text-gray-500">{testimonial.country}</p>
          </div>
        </div>
        
        <div className="flex mb-3">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        
        <p className="text-gray-600 italic mb-4">"{testimonial.comment}"</p>
        
        <div className="mt-auto">
          <Badge variant="outline" className="text-teal">
            {testimonial.visa_type}
          </Badge>
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
      </CardContent>
    </Card>
  );
};

export default TestimonialsPage;
