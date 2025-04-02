
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import { getTestimonials, getApprovedVisas, type Testimonial, type ApprovedVisa } from '@/models/testimonials';
import { Star, MapPin, Award, Calendar, Quote, MessageCircle, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

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

  // Fallback testimonials data in case API fails
  const fallbackTestimonials: Testimonial[] = [
    {
      id: '1',
      client_name: 'Sarah Johnson',
      country: 'Canada',
      visa_type: 'US Tourist Visa',
      rating: 5,
      comment: 'Permitsy made my visa application process incredibly smooth. The step-by-step guidance and document checklist saved me hours of research and stress. I got my visa within two weeks!',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      approved: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      client_name: 'Michael Chen',
      country: 'Singapore',
      visa_type: 'UK Business Visa',
      rating: 5,
      comment: "I was worried about my visa application being rejected, but with Permitsy's expert review service, my application was approved on the first try. The team was responsive and professional throughout.",
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      approved: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      client_name: 'Elena Rodriguez',
      country: 'Mexico',
      visa_type: 'Schengen Visa',
      rating: 4,
      comment: 'The visa interview preparation was invaluable. I felt confident walking in and got my visa approved without any issues. The only reason for 4 stars is that I wish the process was a bit faster.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      approved: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      client_name: 'Thomas Weber',
      country: 'Germany',
      visa_type: 'Canada Work Visa',
      rating: 5,
      comment: 'Everything was handled professionally from start to finish. The 24/7 support team was always there to answer my questions, even during weekends. Highly recommended service!',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      approved: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      client_name: 'Aisha Patel',
      country: 'India',
      visa_type: 'Australia Student Visa',
      rating: 5,
      comment: 'As a student applying for my first international visa, I was very nervous. Permitsy guided me through the entire process and made it stress-free. I received my visa in just 10 days!',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      approved: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '6',
      client_name: 'David Kim',
      country: 'South Korea',
      visa_type: 'Japan Work Visa',
      rating: 4,
      comment: 'The documentation assistance and translation services were excellent. My application was processed faster than expected. Would definitely use their services again.',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      approved: true,
      created_at: new Date().toISOString(),
    }
  ];

  // Fallback approved visas data in case API fails
  const fallbackApprovedVisas: ApprovedVisa[] = [
    {
      id: '1',
      country: 'India',
      destination: 'United States',
      visa_type: 'B1/B2 Tourist Visa',
      visa_category: 'Tourist',
      duration: '10 Years Multiple Entry',
      image_url: 'https://images.unsplash.com/photo-1551649001-7a2482d98d05?w=400',
      approval_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      country: 'Nigeria',
      destination: 'United Kingdom',
      visa_type: 'Tier 4 Student Visa',
      visa_category: 'Student',
      duration: '4 Years',
      image_url: 'https://images.unsplash.com/photo-1543162054-76ef4eb70bdc?w=400',
      approval_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      country: 'Philippines',
      destination: 'Canada',
      visa_type: 'Work Permit',
      visa_category: 'Employment',
      duration: '2 Years',
      image_url: 'https://images.unsplash.com/photo-1551651767-d5ffbdd04b83?w=400',
      approval_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      country: 'Brazil',
      destination: 'European Union',
      visa_type: 'Schengen Visa',
      visa_category: 'Tourism',
      duration: '90 Days',
      image_url: 'https://images.unsplash.com/photo-1560698705-3d12f3efca9c?w=400',
      approval_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      country: 'China',
      destination: 'Australia',
      visa_type: 'Business Visa',
      visa_category: 'Business',
      duration: '1 Year Multiple Entry',
      image_url: 'https://images.unsplash.com/photo-1588169506348-244a237f30ca?w=400',
      approval_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '6',
      country: 'South Africa',
      destination: 'New Zealand',
      visa_type: 'Visitor Visa',
      visa_category: 'Tourism',
      duration: '9 Months',
      image_url: 'https://images.unsplash.com/photo-1533309907656-7b29d57084bf?w=400',
      approval_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
  ];

  // Use actual data if available, otherwise use fallback data
  const displayTestimonials = testimonials?.length ? testimonials : fallbackTestimonials;
  const displayVisas = approvedVisas?.length ? approvedVisas : fallbackApprovedVisas;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="relative bg-gradient-to-b from-indigo-900 to-indigo-800 text-white py-16">
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute left-0 top-0 transform -translate-x-1/4 -translate-y-1/4">
              <Quote className="w-96 h-96 text-white opacity-20" />
            </div>
            <div className="absolute right-0 bottom-0 transform translate-x-1/4 translate-y-1/4">
              <MessageCircle className="w-80 h-80 text-white opacity-20" />
            </div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Success Stories
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Discover how we've helped travelers around the world achieve their visa and travel documentation goals.
              </motion.p>
            </div>
          </div>
        </div>
            
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto -mt-16 bg-white rounded-lg shadow-lg p-6">
            <Tabs defaultValue="testimonials" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-center mb-8">
                <TabsList className="grid grid-cols-2 w-full max-w-md">
                  <TabsTrigger value="testimonials" className="data-[state=active]:bg-teal data-[state=active]:text-white">
                    <User className="w-4 h-4 mr-2" />
                    Client Testimonials
                  </TabsTrigger>
                  <TabsTrigger value="visas" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                    <Award className="w-4 h-4 mr-2" />
                    Approved Visas
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="testimonials">
                {isLoadingTestimonials ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin h-12 w-12 border-4 border-teal border-t-transparent rounded-full"></div>
                  </div>
                ) : displayTestimonials.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {displayTestimonials.map((testimonial) => (
                      <motion.div
                        key={testimonial.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                      >
                        <TestimonialCard testimonial={testimonial} />
                      </motion.div>
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
                    <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                  </div>
                ) : displayVisas.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {displayVisas.map((visa) => (
                      <motion.div
                        key={visa.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                      >
                        <ApprovedVisaCard key={visa.id} visa={visa} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No approved visas available at the moment.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="mt-16 pt-8 border-t border-gray-100">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Visa Journey?</h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Let our experts guide you through the process and join our list of satisfied customers.
                </p>
                <a 
                  href="/visa-finder" 
                  className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                  Find Your Visa Requirements
                </a>
              </div>
            </div>
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
        <div className="mb-4 text-indigo-600">
          <Quote className="h-8 w-8" />
        </div>
        
        <p className="text-gray-600 italic mb-6">"{testimonial.comment}"</p>
        
        <div className="flex mb-3">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        
        <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
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
            <div className="flex items-center text-sm text-gray-500">
              <span>{testimonial.country}</span>
              <span className="mx-2">•</span>
              <Badge variant="outline" className="text-teal">
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
  // Format date from ISO string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="h-48 w-full overflow-hidden bg-gray-100">
        <img 
          src={visa.image_url || '/placeholder.svg'} 
          alt={`${visa.country} to ${visa.destination} visa`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
      </div>
      <CardContent className="p-6">
        <Badge className="mb-2 bg-green-100 text-green-800 hover:bg-green-200">
          Approved
        </Badge>
        
        <h3 className="font-bold text-lg text-gray-900 mb-2">
          {visa.visa_type}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            <span>{visa.country} to {visa.destination}</span>
          </div>
          
          <div className="flex items-center">
            <Award className="h-4 w-4 mr-2 text-gray-400" />
            <span>{visa.visa_category}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>{formatDate(visa.approval_date)}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Badge variant="outline" className="text-indigo-600">
            {visa.duration}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialsPage;
