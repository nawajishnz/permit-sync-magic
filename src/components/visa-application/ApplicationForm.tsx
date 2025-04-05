import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import PersonalInfo from './steps/PersonalInfo';
import TravelInfo from './steps/TravelInfo';
import PassportInfo from './steps/PassportInfo';
import DocumentUpload from './steps/DocumentUpload';
import ApplicationReview from './steps/ApplicationReview';
import PaymentInfo from './steps/PaymentInfo';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type Step = {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
};

interface ApplicationFormProps {
  countryName: string;
  visaType: string;
  processingTime: string;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ 
  countryName,
  visaType,
  processingTime
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      nationality: '',
      gender: '',
      maritalStatus: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    },
    travelInfo: {
      purposeOfTravel: '',
      departureDate: '',
      returnDate: '',
      accommodation: {
        type: '',
        name: '',
        address: '',
        bookingReference: '',
      },
      previousVisits: false,
      previousVisitDetails: '',
    },
    passportInfo: {
      passportNumber: '',
      issuingCountry: '',
      issueDate: '',
      expiryDate: '',
      hasOtherPassports: false,
      otherPassportDetails: '',
    },
    documents: {
      passport: null,
      photo: null,
      financialProof: null,
      itinerary: null,
      accommodation: null,
      insurance: null,
      additionalDocuments: [],
    },
  });

  const steps: Step[] = [
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Provide your basic details',
      component: <PersonalInfo 
        formData={formData.personalInfo} 
        updateFormData={(data) => updateFormSection('personalInfo', data)} 
      />,
    },
    {
      id: 'travel-info',
      title: 'Travel Information',
      description: 'Details about your trip',
      component: <TravelInfo 
        formData={formData.travelInfo} 
        updateFormData={(data) => updateFormSection('travelInfo', data)} 
      />,
    },
    {
      id: 'passport',
      title: 'Passport Details',
      description: 'Enter your passport information',
      component: <PassportInfo 
        formData={formData.passportInfo} 
        updateFormData={(data) => updateFormSection('passportInfo', data)} 
      />,
    },
    {
      id: 'documents',
      title: 'Document Upload',
      description: 'Upload all required documents',
      component: <DocumentUpload 
        formData={formData.documents} 
        updateFormData={(data) => updateFormSection('documents', data)} 
      />,
    },
    {
      id: 'review',
      title: 'Application Review',
      description: 'Review your application',
      component: <ApplicationReview formData={formData} />,
    },
    {
      id: 'payment',
      title: 'Payment',
      description: 'Complete your payment',
      component: <PaymentInfo />,
    },
  ];

  const updateFormSection = (section: string, data: any) => {
    setFormData({
      ...formData,
      [section]: data,
    });
  };

  const handleNext = () => {
    // Validate current step
    let isValid = true;
    
    if (currentStep === 0) {
      // Basic validation for personal info
      const { firstName, lastName, email } = formData.personalInfo;
      if (!firstName || !lastName || !email) {
        isValid = false;
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
      }
    }
    
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Scroll to top when moving to next step
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Scroll to top when moving to previous step
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    // Submit form data
    console.log('Form submitted:', formData);
    
    // Show success message
    toast({
      title: "Application Submitted",
      description: "Your visa application has been successfully submitted.",
    });
    
    // In a real app, you would submit the form data to your backend
    // Redirect to confirmation page or dashboard
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="p-6 shadow-md">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {countryName} Visa Application - {visaType}
          </h2>
          <p className="text-gray-500">
            Estimated processing time: {processingTime}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex flex-col items-center ${index === currentStep ? 'text-indigo-600' : 'text-gray-400'}`}
                style={{ width: `${100 / steps.length}%` }}
              >
                <div 
                  className={`rounded-full flex items-center justify-center w-8 h-8 mb-2 ${
                    index < currentStep ? 'bg-indigo-600 text-white' : 
                    index === currentStep ? 'bg-indigo-100 text-indigo-600 border border-indigo-600' : 
                    'bg-gray-100 text-gray-400'
                  }`}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium hidden md:block">{step.title}</p>
                  <p className="text-xs hidden md:block">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="relative h-1 bg-gray-200 rounded-full">
            <div 
              className="absolute h-1 bg-indigo-600 rounded-full" 
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="mb-8">
          {steps[currentStep].component}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button 
              onClick={handleNext}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Submit Application
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ApplicationForm;
