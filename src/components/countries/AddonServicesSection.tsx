
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Clock, User, Info, ArrowRight } from 'lucide-react';
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

  return (
    <div className={`py-12 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enhance your visa application with our premium add-on services designed to make your travel preparations smoother and hassle-free.
          </p>
        </div>

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
              <Card className="overflow-hidden h-full flex flex-col border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  {service.discount_percentage && service.discount_percentage > 0 && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                      {service.discount_percentage}% off
                    </div>
                  )}
                  <img 
                    src={service.image_url || '/placeholder.svg'} 
                    alt={service.name} 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg'; // Fallback image
                    }}
                  />
                  <div className="absolute bottom-0 w-full bg-indigo-900 py-3 px-4 text-white font-semibold text-center">
                    {service.name}
                  </div>
                </div>
                
                <CardContent className="p-4 flex-grow flex flex-col">
                  <div className="flex justify-between items-center mb-4 mt-2">
                    <div className="flex items-center text-gray-900 font-bold text-xl">
                      ₹{service.price}
                      <span className="text-sm font-normal text-gray-500 ml-1">Per person</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{service.delivery_days} Days</span>
                      <span className="text-xs text-gray-500 ml-1">Delivery</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 flex-grow">{service.description}</p>
                  
                  <Link to={`/addon-services/${service.id}`}>
                    <Button className="w-full bg-teal hover:bg-teal/90 group">
                      View Details <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddonServicesSection;
