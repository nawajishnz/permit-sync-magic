
import React from 'react';
import { Star } from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useQuery } from '@tanstack/react-query';
import { getTestimonials, type Testimonial } from '@/models/testimonials';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Fallback testimonials in case API fails
const fallbackTestimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    country: 'Canada',
    visa: 'US Tourist Visa',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    content: 'Permitsy made my visa application process incredibly smooth. The step-by-step guidance and document checklist saved me hours of research and stress.'
  },
  {
    id: '2',
    name: 'Michael Chen',
    country: 'Singapore',
    visa: 'UK Visitor Visa',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    content: "I was worried about my visa application being rejected, but with Permitsy's expert review service, my application was approved on the first try. Highly recommended!"
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    country: 'Mexico',
    visa: 'Schengen Visa',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    content: 'The visa interview preparation was invaluable. I felt confident walking in and got my visa approved without any issues. Thank you, Permitsy!'
  },
  {
    id: '4',
    name: 'Thomas Weber',
    country: 'Germany',
    visa: 'Canada Tourist Visa',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    content: 'Everything was handled professionally from start to finish. The 24/7 support team was always there to answer my questions, even during weekends.'
  }
];

const TestimonialCard = ({ testimonial }: { testimonial: typeof fallbackTestimonials[0] | Testimonial }) => {
  // Determine if the testimonial is from the API or fallback data
  const isApiData = 'client_name' in testimonial;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col">
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
          <img 
            src={isApiData ? testimonial.avatar_url || '/placeholder.svg' : `${testimonial.image}`} 
            alt={isApiData ? testimonial.client_name : testimonial.name} 
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
        </div>
        <div>
          <h4 className="font-bold text-navy">{isApiData ? testimonial.client_name : testimonial.name}</h4>
          <p className="text-sm text-gray-500">
            {isApiData ? testimonial.country : testimonial.country} • {isApiData ? testimonial.visa_type : testimonial.visa}
          </p>
        </div>
      </div>
      
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < (isApiData ? testimonial.rating : testimonial.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
      
      <p className="text-gray-600 italic flex-grow">"{isApiData ? testimonial.comment : testimonial.content}"</p>
    </div>
  );
};

const Testimonials = () => {
  const { data: apiTestimonials, isLoading, error } = useQuery({
    queryKey: ['homeTestimonials'],
    queryFn: () => getTestimonials(true),
    staleTime: 5 * 60 * 1000,
  });

  // Determine which testimonials to show
  const testimonialsToShow = apiTestimonials?.length ? 
    apiTestimonials.slice(0, 4).map(t => ({ 
      ...t,
      // Map API data to the format expected by TestimonialCard
      name: t.client_name,
      visa: t.visa_type,
      image: t.avatar_url,
      content: t.comment
    })) : 
    fallbackTestimonials;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-navy mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of travelers who have successfully obtained their visas with our assistance.
          </p>
        </motion.div>
        
        <div className="relative px-12">
          <Carousel className="w-full">
            <CarouselContent>
              {testimonialsToShow.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3 p-2">
                  <TestimonialCard testimonial={testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 bg-white text-navy hover:bg-navy hover:text-white" />
            <CarouselNext className="right-0 bg-white text-navy hover:bg-navy hover:text-white" />
          </Carousel>
        </div>
        
        <div className="text-center mt-10">
          <p className="text-teal font-medium mb-4">
            4.9 out of 5 stars from over 10,000+ reviews
          </p>
          <Link to="/testimonials" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
            View all testimonials
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
