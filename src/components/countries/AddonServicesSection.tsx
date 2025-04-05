
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Check, ShoppingBag, FileText, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AddonService } from '@/models/addon_services';

type AddonServicesSectionProps = {
  services: AddonService[];
  className?: string;
};

const AddonServicesSection = ({ services, className = '' }: AddonServicesSectionProps) => {
  if (!services || services.length === 0) {
    return null;
  }

  // Map service names to appropriate images 
  const getServiceImage = (serviceName: string): string => {
    const serviceImages: Record<string, string> = {
      'Rental Agreement': '/lovable-uploads/dbcd3c53-8e2f-44b0-bc5b-d246022d31f0.png',
      'Hotel Booking': '/lovable-uploads/8c33eeef-863c-461b-9170-b1c79770cab1.png',
      'Flight Tickets': '/lovable-uploads/8c33eeef-863c-461b-9170-b1c79770cab1.png',
      'Police Clearance Certificate': '/lovable-uploads/8c33eeef-863c-461b-9170-b1c79770cab1.png',
      'Document Attestation': '/lovable-uploads/8c33eeef-863c-461b-9170-b1c79770cab1.png',
      'Transcript': '/lovable-uploads/8c33eeef-863c-461b-9170-b1c79770cab1.png',
      'Travel Insurance': '/lovable-uploads/8c33eeef-863c-461b-9170-b1c79770cab1.png',
      'Passport Registration/Renew': '/lovable-uploads/8c33eeef-863c-461b-9170-b1c79770cab1.png'
    };

    return serviceImages[serviceName] || '/placeholder.svg';
  };

  // Get appropriate icon based on service type
  const getServiceIcon = (serviceName: string) => {
    const icons: Record<string, React.ElementType> = {
      'Rental Agreement': FileText,
      'Hotel Booking': ShoppingBag,
      'Flight Tickets': Globe,
      'Police Clearance Certificate': Shield,
      'Document Attestation': FileText,
      'Transcript': FileText,
      'Travel Insurance': Shield,
      'Passport Registration/Renew': FileText
    };
    
    const IconComponent = icons[serviceName] || FileText;
    return <IconComponent className="h-4 w-4 mr-1.5 text-green-500" />;
  };

  return (
    <div className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col border border-gray-100">
                {/* Top section with image and discount badge */}
                <div className="relative">
                  {service.discount_percentage && service.discount_percentage > 0 && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-bold z-10">
                      {service.discount_percentage}% OFF
                    </div>
                  )}
                  <div className="h-48 overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200">
                    <img 
                      src={getServiceImage(service.name)}
                      alt={service.name} 
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent opacity-60"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-xl font-bold drop-shadow-md">{service.name}</h3>
                  </div>
                </div>
                
                {/* Content section */}
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-bold text-2xl text-gray-900">
                      ₹{service.price}
                      <span className="text-sm font-normal text-gray-500 ml-1">Per person</span>
                    </div>
                    <div className="flex items-center text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                      <Clock className="w-4 h-4 mr-1 text-indigo-600" />
                      <span className="font-medium">{service.delivery_days} Days</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 flex-grow">{service.description}</p>
                  
                  <div className="mt-auto">
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      {getServiceIcon(service.name)}
                      <span>Embassy approved documentation</span>
                    </div>
                    
                    <Link to={`/addon-services/${service.id}`} className="block">
                      <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white group flex items-center justify-center">
                        View Details 
                        <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddonServicesSection;
