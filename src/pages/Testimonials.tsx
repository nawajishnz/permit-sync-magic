
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Calendar, MapPin, FileCheck, ArrowRight, User, Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTestimonials, getApprovedVisas } from '@/models/testimonials';

const TestimonialsPage = () => {
  const { data: testimonials = [], isLoading: testimonialsLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => getTestimonials()
  });

  const { data: approvedVisas = [], isLoading: visasLoading } = useQuery({
    queryKey: ['approved-visas'],
    queryFn: getApprovedVisas
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-indigo-900 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Client Success Stories</h1>
              <p className="text-xl text-blue-100">
                See what our clients are saying and explore our track record of successful visa approvals
              </p>
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <div className="container mx-auto px-4 py-12">
          <Tabs defaultValue="testimonials" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-gray-100 p-1">
                <TabsTrigger value="testimonials" className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600">
                  Client Testimonials
                </TabsTrigger>
                <TabsTrigger value="success-stories" className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600">
                  Approved Visas
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="testimonials">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What Our Clients Say</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Authentic feedback from travelers who have used our visa services
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonialsLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          <div className="mt-4 flex">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : testimonials.length === 0 ? (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-gray-500 mb-4">No testimonials available yet.</p>
                    <p className="text-sm text-gray-400">Check back soon for client feedback!</p>
                  </div>
                ) : (
                  testimonials.map((testimonial, index) => (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="border border-gray-200 h-full hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex items-center mb-4">
                            <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden mr-4">
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
                                <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                                  <User className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{testimonial.client_name}</h3>
                              <div className="flex items-center text-sm text-gray-500">
                                <Flag className="h-3 w-3 mr-1" />
                                {testimonial.country} • {testimonial.visa_type}
                              </div>
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
                          
                          <p className="text-gray-600 italic flex-grow">"{testimonial.comment}"</p>
                          
                          <div className="mt-4 text-sm text-gray-500">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {new Date(testimonial.created_at).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="success-stories">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Approved Visa Gallery</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  A showcase of successful visa approvals we've helped our clients achieve
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visasLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="border border-gray-200">
                      <CardContent className="p-0">
                        <div className="animate-pulse">
                          <div className="h-48 bg-gray-200 rounded-t"></div>
                          <div className="p-4 space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="flex space-x-2">
                              <div className="h-6 bg-gray-200 rounded w-16"></div>
                              <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : approvedVisas.length === 0 ? (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-gray-500 mb-4">No approved visa records available yet.</p>
                    <p className="text-sm text-gray-400">Check back soon for success stories!</p>
                  </div>
                ) : (
                  approvedVisas.map((visa, index) => (
                    <motion.div
                      key={visa.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="relative">
                            <img 
                              src={visa.image_url} 
                              alt={`${visa.country} Visa`} 
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                            <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600">
                              Approved
                            </Badge>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-bold text-gray-900 mb-1">{visa.country} {visa.visa_type}</h3>
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <MapPin className="h-3 w-3 mr-1" />
                              {visa.destination}
                              <span className="mx-2">•</span>
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(visa.approval_date).toLocaleDateString()}
                            </div>
                            
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 border-blue-200">
                                {visa.visa_category}
                              </Badge>
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                {visa.duration}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* CTA Section */}
          <div className="mt-16 bg-blue-50 rounded-xl p-6 md:p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Get Your Visa?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Join thousands of satisfied travelers who've successfully obtained their visas through our expert assistance.
            </p>
            <Button className="bg-teal hover:bg-teal/90">
              Start Your Application <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TestimonialsPage;
