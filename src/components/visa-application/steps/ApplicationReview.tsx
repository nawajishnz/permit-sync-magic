
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
    const requiredFields = [
      'purposeOfTravel',
      'departureDate',
      'returnDate'
    ];
    
    return requiredFields.every(field => 
      formData.travelInfo && formData.travelInfo[field]
    );
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
    const requiredDocs = ['passport', 'photo', 'financialProof'];
    return requiredDocs.every(doc => 
      formData.documents && formData.documents[doc]
    );
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
            <h3 className="text-lg font-semibold">Supporting Documents</h3>
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
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="h-5 w-5 mr-2 mt-0.5">
                {formData.documents?.passport ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <p className="font-medium">Passport Copy</p>
                {formData.documents?.passport && (
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <FileUp className="h-3 w-3 mr-1" />
                    <span>{formData.documents.passport.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-5 w-5 mr-2 mt-0.5">
                {formData.documents?.photo ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <p className="font-medium">Passport Size Photo</p>
                {formData.documents?.photo && (
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <FileUp className="h-3 w-3 mr-1" />
                    <span>{formData.documents.photo.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-5 w-5 mr-2 mt-0.5">
                {formData.documents?.financialProof ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <p className="font-medium">Financial Proof</p>
                {formData.documents?.financialProof && (
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <FileUp className="h-3 w-3 mr-1" />
                    <span>{formData.documents.financialProof.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-5 w-5 mr-2 mt-0.5">
                {formData.documents?.itinerary ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-300" />
                )}
              </div>
              <div>
                <p className="font-medium">Travel Itinerary</p>
                {formData.documents?.itinerary && (
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <FileUp className="h-3 w-3 mr-1" />
                    <span>{formData.documents.itinerary.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-5 w-5 mr-2 mt-0.5">
                {formData.documents?.accommodation ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-300" />
                )}
              </div>
              <div>
                <p className="font-medium">Accommodation Proof</p>
                {formData.documents?.accommodation && (
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <FileUp className="h-3 w-3 mr-1" />
                    <span>{formData.documents.accommodation.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="h-5 w-5 mr-2 mt-0.5">
                {formData.documents?.insurance ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-300" />
                )}
              </div>
              <div>
                <p className="font-medium">Travel Insurance</p>
                {formData.documents?.insurance && (
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <FileUp className="h-3 w-3 mr-1" />
                    <span>{formData.documents.insurance.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            {formData.documents?.additionalDocuments && formData.documents.additionalDocuments.length > 0 && (
              <>
                <h4 className="font-medium mt-4">Additional Documents</h4>
                {formData.documents.additionalDocuments.map((doc: File, index: number) => (
                  <div key={index} className="flex items-start ml-6">
                    <FileUp className="h-4 w-4 mr-2 text-gray-500" />
                    <p className="text-sm">{doc.name}</p>
                  </div>
                ))}
              </>
            )}
          </div>
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
