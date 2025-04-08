import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  avatarUrl?: string;
  countryFlag?: string;
}

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample testimonial data - in production this would come from your database
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Aditya Sharma',
      location: 'Bangalore',
      rating: 5,
      date: 'March 15, 2024',
      comment: 'As a tech professional from Bangalore, I needed a quick UK business visa. Permitsy handled everything perfectly. Their document verification system caught issues in my application that would have caused delays. Received my visa in just 4 days!',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGluZGlhbiUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
      countryFlag: '🇮🇳',
    },
    {
      id: '2',
      name: 'Priya Nayak',
      location: 'Mangalore',
      rating: 5,
      date: 'February 28, 2024',
      comment: 'My family and I were planning our first international trip to Singapore from Mangalore. The visa application process seemed daunting until we found Permitsy. Their step-by-step guidance made everything so simple. All four visas approved without any hassle!',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aW5kaWFuJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60',
      countryFlag: '🇮🇳',
    },
    {
      id: '3',
      name: 'Vikram Reddy',
      location: 'Hyderabad',
      rating: 4,
      date: 'January 10, 2024',
      comment: 'Being from Hyderabad and applying for a Schengen visa was quite complex. Permitsy\'s support team was available even during late hours to answer my queries. Their attention to detail with my documentation was impressive. Would definitely use their service again.',
      avatarUrl: 'https://images.unsplash.com/photo-1582015752624-e8b1c75e3711?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aW5kaWFuJTIwbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
      countryFlag: '🇮🇳',
    },
    {
      id: '4',
      name: 'Kavitha Rao',
      location: 'Mysore',
      rating: 5,
      date: 'December 5, 2023',
      comment: 'As a professor from Mysore University traveling to Canada for an academic conference, I needed my visa processed quickly. Permitsy understood my requirements perfectly. Their AI-powered system identified exactly what supporting documents would strengthen my application.',
      avatarUrl: 'https://images.unsplash.com/photo-1601931935821-5fbe71157695?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzR8fGluZGlhbiUyMHdvbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
      countryFlag: '🇮🇳',
    },
    {
      id: '5',
      name: 'Rajesh Kumar',
      location: 'Bangalore',
      rating: 5,
      date: 'November 20, 2023',
      comment: 'I needed a last-minute tourist visa for Australia while working on a tight schedule in Bangalore\'s IT park. Permitsy\'s mobile interface made it possible to complete my application during commutes. Their real-time updates kept me informed at every stage.',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aW5kaWFuJTIwbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
      countryFlag: '🇮🇳',
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  // Generate star ratings
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const currentTestimonial = testimonials[currentIndex];
  const nextTestimonialIndex = (currentIndex + 1) % testimonials.length;
  const nextTestimonial2Index = (currentIndex + 2) % testimonials.length;

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full mb-4 shadow-md">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-center">What Our Customers Say</h2>
          <div className="h-1 w-16 bg-indigo-500 rounded mb-4"></div>
          <p className="text-gray-600 max-w-2xl text-center text-sm sm:text-base">
            Read genuine reviews from travelers who successfully obtained their visas using our services
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main testimonial */}
          <motion.div
            key={currentTestimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-lg mb-6 relative"
          >
            <div className="absolute top-6 right-8 text-indigo-100">
              <Quote className="w-20 h-20 rotate-180" />
            </div>
            <div className="flex flex-col sm:flex-row gap-6 relative z-10">
              <div className="flex-shrink-0 flex flex-col items-center sm:items-start">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-2xl overflow-hidden mb-2">
                  {currentTestimonial.avatarUrl ? (
                    <img 
                      src={currentTestimonial.avatarUrl} 
                      alt={currentTestimonial.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{currentTestimonial.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-800">{currentTestimonial.name}</span>
                <div className="flex items-center text-xs text-gray-600 mt-1">
                  <span>{currentTestimonial.countryFlag}</span>
                  <span className="ml-1">{currentTestimonial.location}</span>
                </div>
                <div className="flex mt-2">
                  {renderStars(currentTestimonial.rating)}
                </div>
              </div>

              <div className="flex-1">
                <p className="text-gray-700 italic mb-4 relative">
                  "{currentTestimonial.comment}"
                </p>
                <div className="text-sm text-gray-500 mt-auto">
                  {currentTestimonial.date}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Testimonial navigation */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={prevTestimonial}
                className="bg-white p-2 rounded-full shadow-md hover:bg-indigo-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-indigo-600" />
              </button>
              <button
                onClick={nextTestimonial}
                className="bg-white p-2 rounded-full shadow-md hover:bg-indigo-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-indigo-600" />
              </button>
            </div>
            
            <div className="text-gray-500 text-sm">
              {currentIndex + 1} of {testimonials.length}
            </div>
          </div>

          {/* Upcoming testimonials (small preview) */}
          <div className="hidden md:flex gap-4 mt-8">
            <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-100 opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex items-start mb-2">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-lg mr-3 overflow-hidden">
                  {testimonials[nextTestimonialIndex].avatarUrl ? (
                    <img 
                      src={testimonials[nextTestimonialIndex].avatarUrl} 
                      alt={testimonials[nextTestimonialIndex].name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{testimonials[nextTestimonialIndex].name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{testimonials[nextTestimonialIndex].name}</p>
                  <div className="flex mt-1">
                    {renderStars(testimonials[nextTestimonialIndex].rating)}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">"{testimonials[nextTestimonialIndex].comment}"</p>
            </div>
            
            <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-100 opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex items-start mb-2">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-lg mr-3 overflow-hidden">
                  {testimonials[nextTestimonial2Index].avatarUrl ? (
                    <img 
                      src={testimonials[nextTestimonial2Index].avatarUrl} 
                      alt={testimonials[nextTestimonial2Index].name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{testimonials[nextTestimonial2Index].name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{testimonials[nextTestimonial2Index].name}</p>
                  <div className="flex mt-1">
                    {renderStars(testimonials[nextTestimonial2Index].rating)}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">"{testimonials[nextTestimonial2Index].comment}"</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md transform hover:translate-y-[-2px] transition-all">
            Read More Reviews
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
