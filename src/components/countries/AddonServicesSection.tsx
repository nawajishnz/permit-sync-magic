
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Check, FileText, Hotel, Plane, Shield, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AddonService } from '@/models/addon_services';
import { useQuery } from '@tanstack/react-query';
import { getAddonServices } from '@/models/addon_services';

const AddonServiceCard = ({ service }: { service: AddonService }) => {
  
  const getServiceIcon = (serviceName: string) => {
    const icons = {
      'Hotel': Hotel,
      'Flight': Plane,
      'Travel': Plane,
      'Airport': Plane,
      'Transport': Plane,
      'Accommodation': Hotel,
      'Insurance': Shield,
      'Document': FileText,
      'Documents': FileText,
      'Document Attestation': FileText,
      'Transcript': FileText,
      'Travel Insurance': Shield,
      'Passport Registration/Renew': FileCheck
    };
    
    const IconComponent = icons[serviceName] || FileText;
    return <IconComponent className="h-5 w-5" />;
  };
  
  // Extract first relevant word from service name for icon
  const getIconKey = (name: string) => {
    const words = name.split(' ');
    for (const word of words) {
      if (word in {
        'Hotel': true, 'Flight': true, 'Travel': true, 'Airport': true,
        'Transport': true, 'Accommodation': true, 'Insurance': true,
        'Document': true, 'Documents': true, 'Passport': true, 'Transcript': true
      }) {
        return word;
      }
    }
    return name; // Return full name if no matching word
  };
  
  // Convert service ID to a number for arithmetic operations
  const serviceIdNumber = typeof service.id === 'number' ? service.id : Number(service.id) || 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full"
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={service.image_url || `https://images.unsplash.com/photo-${1466721591366 + serviceIdNumber * 5432}-2d5fba72006d?auto=format&fit=crop&w=800&q=80`} 
          alt={service.name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://images.unsplash.com/photo-${1466721591366 + serviceIdNumber * 5432}-2d5fba72006d?auto=format&fit=crop&w=800&q=80`; 
          }}
        />
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center mb-3">
          <div className="h-8 w-8 rounded-full bg-teal/10 flex items-center justify-center text-teal mr-3">
            {getServiceIcon(getIconKey(service.name))}
          </div>
          <h3 className="font-bold text-navy">{service.name}</h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 flex-grow">{service.description}</p>
        
        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>{service.delivery_days} days</span>
          </div>
          <Link to={`/addon-services/${service.id}`}>
            <Button variant="ghost" size="sm" className="text-teal px-0 hover:bg-transparent hover:text-teal/80">
              Learn more <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const AddonServicesSection = () => {
  const { data: addonServices, isLoading } = useQuery({
    queryKey: ['addonServices'],
    queryFn: getAddonServices
  });
  
  // Show a limited number of services on the homepage
  const featuredServices = addonServices ? addonServices.slice(0, 3) : [];
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">Additional Travel Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enhance your travel experience with our comprehensive range of additional services
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredServices.map((service) => (
                <AddonServiceCard key={service.id} service={service} />
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link to="/addon-services">
                <Button className="bg-teal hover:bg-teal/90">
                  View All Services
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AddonServicesSection;
