
import React from 'react';
import { EmbassyDetails } from '@/hooks/useCountryData';
import { Building2, Phone, Mail, Clock } from 'lucide-react';

interface EmbassySectionProps {
  embassyDetails: EmbassyDetails;
}

const EmbassySection: React.FC<EmbassySectionProps> = ({ embassyDetails }) => {
  if (!embassyDetails) {
    return null;
  }
  
  return (
    <div className="my-6">
      <h3 className="text-xl font-semibold mb-4">Embassy Information</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        {embassyDetails.address && (
          <div className="flex items-start mb-3">
            <Building2 className="w-5 h-5 mr-2 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-gray-600">{embassyDetails.address}</p>
            </div>
          </div>
        )}
        
        {embassyDetails.phone && (
          <div className="flex items-start mb-3">
            <Phone className="w-5 h-5 mr-2 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Phone</p>
              <p className="text-gray-600">{embassyDetails.phone}</p>
            </div>
          </div>
        )}
        
        {embassyDetails.email && (
          <div className="flex items-start mb-3">
            <Mail className="w-5 h-5 mr-2 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-gray-600">{embassyDetails.email}</p>
            </div>
          </div>
        )}
        
        {embassyDetails.hours && (
          <div className="flex items-start">
            <Clock className="w-5 h-5 mr-2 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium">Office Hours</p>
              <p className="text-gray-600">{embassyDetails.hours}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmbassySection;
