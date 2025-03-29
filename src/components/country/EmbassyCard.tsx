
import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmbassyDetails {
  address: string;
  phone: string;
  email: string;
  hours: string;
}

interface EmbassyCardProps {
  details: EmbassyDetails;
}

const EmbassyCard: React.FC<EmbassyCardProps> = ({ details }) => {
  return (
    <Card className="bg-white overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5">
          <h3 className="font-semibold text-navy text-lg mb-4">Embassy Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-teal-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Address</p>
                <p className="text-sm text-gray-600">{details.address}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-teal-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone</p>
                <p className="text-sm text-gray-600">{details.phone}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-teal-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{details.email}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-teal-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Working Hours</p>
                <p className="text-sm text-gray-600">{details.hours}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmbassyCard;
