import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, FileUp } from 'lucide-react';

interface ApplicationReviewProps {
  formData: any;
}

const ApplicationReview: React.FC<ApplicationReviewProps> = ({ formData }) => {
  // Format date from YYYY-MM-DD to readable format
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not provided';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  const checkPersonalInfoComplete = () => {
    const requiredFields = [
      'firstName', 
      'lastName', 
      'email', 
      'phoneNumber', 
      'dateOfBirth',
      'nationality',
      'gender',
      'maritalStatus'
    ];
    
    return requiredFields.every(field => 
      formData.personalInfo && formData.personalInfo[field]
    );
  };
  
  const checkTravelInfoComplete = () => {
    const travelInfo = formData.travelInfo;
    if (!travelInfo) return false;
    
    const requiredBaseFields = [
      'purposeOfTravel',
      'departureDate',
      'returnDate',
      'bookingOption'
    ];
    
    const baseComplete = requiredBaseFields.every(field => travelInfo[field]);
    if (!baseComplete) return false;
    
    if (travelInfo.bookingOption === 'provided') {
      const requiredAccommodationFields = [
        'type',
        'name',
        'address',
        'bookingReference'
      ];
      if (!travelInfo.accommodation) return false;
      return requiredAccommodationFields.every(field => travelInfo.accommodation[field]);
    }
    
    return true; 
  };
  
  const checkPassportInfoComplete = () => {
    const requiredFields = [
      'passportNumber',
      'issuingCountry',
      'issueDate',
      'expiryDate'
    ];
    
    return requiredFields.every(field => 
      formData.passportInfo && formData.passportInfo[field]
    );
  };
  
  const checkDocumentsComplete = () => {
    const documents = formData.documents;
    if (!documents) return false;
    
    const needsBookingAssistance = formData?.travelInfo?.bookingOption === 'assist';

    const alwaysRequiredDocs = ['passport', 'photo', 'financialProof', 'insurance'];
    if (!alwaysRequiredDocs.every(doc => documents[doc])) {
        return false;
    }
    
    if (!needsBookingAssistance) {
      const conditionallyRequiredDocs = ['itinerary', 'accommodation'];
      if (!conditionallyRequiredDocs.every(doc => documents[doc])) {
        return false;
      }
    }
    
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-indigo-800 mb-2">Application Summary</h3>
        <p className="text-indigo-700">
          Please review all the information you've provided for your visa application. 
          Make sure everything is accurate before proceeding to payment.
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            {checkPersonalInfoComplete() ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <Check className="h-3 w-3 mr-1" /> Complete
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                <AlertCircle className="h-3 w-3 mr-1" /> Incomplete
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Full Name</p>
              <p className="font-medium">
                {formData.personalInfo?.firstName || 'Not provided'} {formData.personalInfo?.lastName || ''}
              </p>
            </div>
            
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{formData.personalInfo?.email || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Phone Number</p>
              <p className="font-medium">{formData.personalInfo?.phoneNumber || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Date of Birth</p>
              <p className="font-medium">{formatDate(formData.personalInfo?.dateOfBirth)}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Nationality</p>
              <p className="font-medium">{formData.personalInfo?.nationality || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Gender</p>
              <p className="font-medium">{formData.personalInfo?.gender || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Marital Status</p>
              <p className="font-medium">{formData.personalInfo?.maritalStatus || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-500">Current Address</p>
            <p className="font-medium">
              {[
                formData.personalInfo?.address?.street,
                formData.personalInfo?.address?.city,
                formData.personalInfo?.address?.state,
                formData.personalInfo?.address?.postalCode,
                formData.personalInfo?.address?.country
              ].filter(Boolean).join(', ') || 'Not provided'}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Travel Information</h3>
            {checkTravelInfoComplete() ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <Check className="h-3 w-3 mr-1" /> Complete
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                <AlertCircle className="h-3 w-3 mr-1" /> Incomplete
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Purpose of Travel</p>
              <p className="font-medium">{formData.travelInfo?.purposeOfTravel || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Departure Date</p>
              <p className="font-medium">{formatDate(formData.travelInfo?.departureDate)}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Return Date</p>
              <p className="font-medium">{formatDate(formData.travelInfo?.returnDate)}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-500">Accommodation</p>
            {formData.travelInfo?.bookingOption === 'assist' ? (
              <p className="font-medium text-blue-600 mt-1">Booking assistance requested. Details will be handled later.</p>
            ) : (
              <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium">{formData.travelInfo?.accommodation?.type || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{formData.travelInfo?.accommodation?.name || 'Not provided'}</p>
                </div>
                
                <div className="md:col-span-2">
                  <p className="text-gray-500">Address</p>
                  <p className="font-medium">{formData.travelInfo?.accommodation?.address || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-gray-500">Booking Reference</p>
                  <p className="font-medium">{formData.travelInfo?.accommodation?.bookingReference || 'Not provided'}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <p className="text-gray-500">Previous Visits</p>
            <p className="font-medium">
              {formData.travelInfo?.previousVisits ? 'Yes' : 'No'}
              {formData.travelInfo?.previousVisits && formData.travelInfo?.previousVisitDetails && (
                <span className="block mt-1 text-gray-600">{formData.travelInfo.previousVisitDetails}</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Passport Information</h3>
            {checkPassportInfoComplete() ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <Check className="h-3 w-3 mr-1" /> Complete
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                <AlertCircle className="h-3 w-3 mr-1" /> Incomplete
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Passport Number</p>
              <p className="font-medium">{formData.passportInfo?.passportNumber || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Issuing Country</p>
              <p className="font-medium">{formData.passportInfo?.issuingCountry || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Issue Date</p>
              <p className="font-medium">{formatDate(formData.passportInfo?.issueDate)}</p>
            </div>
            
            <div>
              <p className="text-gray-500">Expiry Date</p>
              <p className="font-medium">{formatDate(formData.passportInfo?.expiryDate)}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-500">Other Passports/Nationalities</p>
            <p className="font-medium">
              {formData.passportInfo?.hasOtherPassports ? 'Yes' : 'No'}
              {formData.passportInfo?.hasOtherPassports && formData.passportInfo?.otherPassportDetails && (
                <span className="block mt-1 text-gray-600">{formData.passportInfo.otherPassportDetails}</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Uploaded Documents</h3>
            {checkDocumentsComplete() ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <Check className="h-3 w-3 mr-1" /> Complete
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                <AlertCircle className="h-3 w-3 mr-1" /> Incomplete
              </Badge>
            )}
          </div>
          
          <ul className="list-disc list-inside space-y-1 text-sm">
            {Object.entries(formData.documents || {}).map(([key, value]) => {
              if (!value) return null;
              
              const isOptional = formData.travelInfo?.bookingOption === 'assist' && 
                                 ['itinerary', 'accommodation'].includes(key);
              
              return (
                <li key={key} className="flex items-center">
                  <FileUp className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                  {isOptional && <span className="ml-2 text-xs text-green-600">(Optional - Assistance)</span>}
                </li>
              );
            })}
          </ul>
          
          {formData.documents?.additionalDocuments && formData.documents.additionalDocuments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-2">Additional Documents</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {formData.documents.additionalDocuments.map((file: File, index: number) => (
                  <li key={index} className="flex items-center">
                    <FileUp className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{file.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-amber-800 flex items-center mb-2">
          <AlertCircle className="h-5 w-5 mr-2" />
          Important Notice
        </h3>
        <p className="text-amber-700">
          By proceeding to payment, you confirm that all the information provided is accurate and complete. 
          False or misleading information may result in visa rejection and non-refundable fees.
        </p>
      </div>
    </div>
  );
};

export default ApplicationReview;
