
import React, { useEffect, useState, useCallback } from 'react';
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { getApprovedVisas, type ApprovedVisa } from '@/models/testimonials';
import useEmblaCarousel from 'embla-carousel-react';
import AutoPlay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';

const ApprovedVisas: React.FC = () => {
  const [visas, setVisas] = useState<ApprovedVisa[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', dragFree: true }, [
    AutoPlay({ delay: 3500, stopOnInteraction: false })
  ]);

  useEffect(() => {
    const fetchVisas = async () => {
      try {
        setLoading(true);
        const fetchedVisas = await getApprovedVisas();
        setVisas(fetchedVisas);
      } catch (error) {
        console.error('Error fetching approved visas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisas();
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Create a duplicate array of visas for smoother infinite scrolling
  const displayVisas = visas.length > 0 ? [...visas, ...visas] : [];

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4 mb-6 sm:mb-10">
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full mb-4 shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-center">Our Success Stories</h2>
          <div className="h-1 w-16 bg-indigo-500 rounded mb-4"></div>
          <p className="text-gray-600 max-w-2xl text-center text-sm sm:text-base px-4">
            Explore real tourist visas we've successfully processed for our clients. 
            All personal information is protected for privacy and security.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : visas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No approved visas available to display.</div>
      ) : (
        <div className="relative mb-16 px-4">
          {/* Desktop navigation arrows */}
          <div className="hidden md:block">
            <Button 
              onClick={scrollPrev}
              className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-md hover:bg-gray-100 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              variant="outline"
              size="icon"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-indigo-600" />
            </Button>
            <Button 
              onClick={scrollNext}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-md hover:bg-gray-100 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              variant="outline"
              size="icon"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-indigo-600" />
            </Button>
          </div>
          
          {/* Carousel with Embla */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 py-8">
              {displayVisas.map((visa, index) => (
                <div 
                  key={`${visa.id}-${index}`}
                  className="flex-[0_0_240px] md:flex-[0_0_280px] snap-center"
                >
                  <div className="h-[320px] w-full md:h-[360px] rounded-lg overflow-hidden bg-white flex items-center justify-center relative group">
                    <div className="absolute inset-0 border border-gray-200 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300"></div>
                    <div className="relative p-3 w-full h-full flex items-center justify-center">
                      <img 
                        src={visa.image_url} 
                        alt={`Approved Visa`}
                        className="max-h-full max-w-full object-contain" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile navigation dots */}
          <div className="flex justify-center mt-6 gap-2 md:hidden">
            <Button 
              onClick={scrollPrev}
              variant="outline" 
              size="icon"
              className="rounded-full border border-gray-200 w-9 h-9"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              onClick={scrollNext}
              variant="outline"
              size="icon" 
              className="rounded-full border border-gray-200 w-9 h-9"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ApprovedVisas;
