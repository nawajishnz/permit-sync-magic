import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { getApprovedVisas, type ApprovedVisa } from '@/models/testimonials';

const ApprovedVisas: React.FC = () => {
  const [visas, setVisas] = useState<ApprovedVisa[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Multiply visas for continuous scroll
  const scrollingVisas = visas.length > 0 
    ? [...visas, ...visas, ...visas, ...visas]
    : [];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 mb-10">
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full mb-4 shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-center">Our Success Stories</h2>
          <div className="h-1 w-16 bg-indigo-500 rounded mb-4"></div>
          <p className="text-gray-600 max-w-2xl text-center text-sm sm:text-base">
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
        <div className="relative overflow-hidden mb-16">
          <div className="flex animate-scroll-left whitespace-nowrap py-6">
            {scrollingVisas.map((visa, index) => (
              <div 
                key={`${visa.id}-${index}`}
                className="inline-block px-4"
              >
                <div className="h-[480px] w-[340px] rounded-lg overflow-hidden border border-gray-300 shadow-md bg-white flex items-center justify-center p-3">
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
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ApprovedVisas; 