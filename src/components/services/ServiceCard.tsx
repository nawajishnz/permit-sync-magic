import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AddonService } from '@/models/addon_services';

interface ServiceCardProps {
  service: AddonService;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative h-48">
        <img
          src={service.image_url}
          alt={service.name}
          className="w-full h-full object-cover"
        />
        {service.discount_percentage && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {service.discount_percentage}% OFF
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
        <p className="text-gray-600 mb-4">{service.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">₹{service.price}</span>
            <span className="text-sm text-gray-500 ml-2">/ service</span>
          </div>
          <div className="text-sm text-gray-500">
            {service.delivery_days} day{service.delivery_days !== 1 ? 's' : ''} delivery
          </div>
        </div>
        
        <Link to={`/services/${service.id}`}>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
            Learn More
          </Button>
        </Link>
      </div>
    </div>
  );
}; 