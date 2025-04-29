
import React, { useCallback } from 'react';
import { Star, Users, BarChart4 } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoPlay from 'embla-carousel-autoplay';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TestimonialProps {
  name: string;
  initials: string;
  location: string;
  rating: number;
  comment: string;
  visaType?: string;
  avatarUrl?: string;
  bgColor?: string;
}

const testimonialData: TestimonialProps[] = [
  {
    name: "Jitish Sharma",
    initials: "JS",
    location: "Delhi",
    rating: 5,
    comment: "Seamless and efficient. The checklist for the requisite documents was simplified. It makes matters so much easier for laymen like myself. The team was helpful every step of the way. All in all a very smooth process for an otherwise complex task.",
    visaType: "Tourist Visa",
    bgColor: "#4263eb"
  },
  {
    name: "Abhinav Singh",
    initials: "AS",
    location: "Mumbai",
    rating: 5,
    comment: "Applied for Japan Tourist Visa and received 5-year multiple entry visa. The process was smooth and seamless. Didn't have to worry about the application form, cover letter, or itinerary as it was all taken care of by the team.",
    visaType: "Japan Visa",
    bgColor: "#4263eb"
  },
  {
    name: "Arushi Bhatnagar",
    initials: "AB",
    location: "Bangalore",
    rating: 5,
    comment: "My experience with Permitsy was extremely smooth. Considering the number of documents needed for the Schengen visa, their team provided us with an accurate checklist, guided us through the entire process of application.",
    visaType: "Schengen Visa",
    bgColor: "#4263eb"
  },
  {
    name: "Sanchay Harjai",
    initials: "SH",
    location: "Chennai",
    rating: 5,
    comment: "Amazing folks, had a hiccup with my visa, but the team understood my situation, and jumped in quickly to help me out with everything at a personal level, a very dedicated team that really does care about customers.",
    visaType: "UK Visa",
    bgColor: "#4263eb"
  },
  {
    name: "Siddharth A Pitolwala",
    initials: "SAP",
    location: "Hyderabad",
    rating: 5,
    comment: "We had a wonderful experience with Permitsy for our UAE visa. Starting from explaining the process to ensuring that our visa is received in a timely manner, Permitsy provides valuable customer service.",
    visaType: "UAE Visa",
    bgColor: "#4263eb"
  }
];

const TestimonialCard = ({ name, initials, location, rating, comment, visaType, avatarUrl, bgColor = "#4263eb" }: TestimonialProps) => {
  return (
    <Card className="h-full border shadow-md hover:shadow-lg transition-shadow overflow-hidden bg-white rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div 
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl text-white font-bold"
            style={{ backgroundColor: bgColor }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
            <p className="text-gray-500 text-sm">{location}</p>
            
            <div className="flex my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i}
                  className={cn(
                    "w-4 h-4", 
                    i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                  )}
                />
              ))}
            </div>
            
            <p className="text-gray-600 mt-2 text-sm line-clamp-4">{comment}</p>
            
            {visaType && (
              <div className="mt-2">
                <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                  {visaType}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Testimonials = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    AutoPlay({ delay: 3000, stopOnInteraction: false })
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full mb-4 shadow-md">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-center">What Our Customers Say</h2>
          <div className="h-1 w-16 bg-indigo-500 rounded mb-4"></div>
          <p className="text-gray-600 max-w-2xl text-center text-sm sm:text-base">
            Read genuine reviews from travelers who successfully obtained their visas using our services
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonialData.map((testimonial, index) => (
                <div className="flex-[0_0_90%] sm:flex-[0_0_45%] md:flex-[0_0_30%] px-3" key={index}>
                  <TestimonialCard {...testimonial} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-8">
            <div className="flex gap-3">
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

            <div className="flex items-center space-x-10">
              <div className="flex items-center gap-2">
                <div className="bg-gray-900 rounded-full p-2">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-xl">1,00,000+</p>
                  <p className="text-gray-500 text-sm">Happy Users</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-gray-900 rounded-full p-2">
                  <BarChart4 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-xl">4.8 <span className="text-yellow-400">★</span></p>
                  <p className="text-gray-500 text-sm">Google rating</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="group border-indigo-200 hover:bg-indigo-50 transition-colors">
              <a href="/testimonials">
                See all reviews
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
