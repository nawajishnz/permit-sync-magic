import React from 'react';
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getTestimonials, Testimonial } from '@/models/testimonials';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Link } from 'react-router-dom';

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col">
    <div className="flex items-center mb-4">
      <div className="h-12 w-12 rounded-full overflow-hidden mr-4 bg-gray-200 flex items-center justify-center text-navy">
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
        <h4 className="font-bold text-navy">{testimonial.client_name}</h4>
        <p className="text-sm text-gray-500">
          {testimonial.country} • {testimonial.visa_type}
        </p>
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
  </div>
);

const Testimonials = () => {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['homepage-testimonials'],
    queryFn: () => getTestimonials(true),
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have successfully obtained their visas with our help
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials && testimonials.length > 0 ? (
            testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar_url}
                    alt={testimonial.client_name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{testimonial.client_name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.country} • {testimonial.visa_type}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600">{testimonial.comment}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No testimonials available at the moment.</p>
            </div>
          )}
        </div>
        
        <div className="text-center mt-10">
          <p className="text-teal font-medium">
            4.9 out of 5 stars from over 10,000+ reviews
          </p>
        </div>

        <div className="text-center mt-10">
          <Link to="/countries" className="text-teal font-medium">
            Browse Countries
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
