import React, { useEffect, useState, useRef } from 'react';
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { getApprovedVisas, type ApprovedVisa } from '@/models/testimonials';

const ApprovedVisas: React.FC = () => {
  const [visas, setVisas] = useState<ApprovedVisa[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

  // Set up smooth continuous scrolling using requestAnimationFrame
  useEffect(() => {
    const startSmoothScroll = () => {
      let scrollPosition = 0;
      
      const scrollAnimation = () => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          
          // Scroll by a small amount each frame for smooth motion
          container.scrollLeft += 0.5;  
          
          // Reset to beginning when reached the end (create infinite loop effect)
          if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
            container.scrollLeft = 0;
          }
          
          // Continue the animation loop
          animationFrameRef.current = requestAnimationFrame(scrollAnimation);
        }
      };
      
      // Start the animation
      animationFrameRef.current = requestAnimationFrame(scrollAnimation);
    };
    
    if (!loading && visas.length > 0) {
      startSmoothScroll();
    }
    
    // Clean up animation on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [loading, visas]);

  // Create a long, repeating list of visas for continuous scrolling
  const displayVisas = visas.length > 0 ? [...visas, ...visas, ...visas, ...visas] : [];

  // Scroll handlers for desktop navigation arrows
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

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
            <button 
              onClick={scrollLeft}
              className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-md hover:bg-gray-100 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-indigo-600" />
            </button>
            <button 
              onClick={scrollRight}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-md hover:bg-gray-100 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-indigo-600" />
            </button>
          </div>
          
          {/* Horizontal scrollable container */}
          <div 
            ref={scrollContainerRef}
            id="visa-scroll-container"
            className="flex overflow-x-auto py-8 snap-x scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent gap-6"
            style={{ 
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              paddingLeft: '2rem',
              paddingRight: '2rem',
              msOverflowStyle: 'none'
            }}
          >
            {displayVisas.map((visa, index) => (
              <div 
                key={`${visa.id}-${index}`}
                className="flex-shrink-0 snap-center"
              >
                <div className="h-[320px] w-[240px] md:h-[360px] md:w-[280px] rounded-lg overflow-hidden bg-white flex items-center justify-center relative group">
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
      )}
    </section>
  );
};

export default ApprovedVisas; 