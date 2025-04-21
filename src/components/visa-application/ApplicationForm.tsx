import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import PersonalInfo from './steps/PersonalInfo';
import TravelInfo from './steps/TravelInfo';
import PassportInfo from './steps/PassportInfo';
import DocumentUpload from './steps/DocumentUpload';
import ApplicationReview from './steps/ApplicationReview';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

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
  isServiceOrder?: boolean;
  serviceName?: string;
  initialData?: any;
  packageId: string;
  countryId: string;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ 
  countryName,
  visaType,
  processingTime,
  isServiceOrder = false,
  serviceName,
  initialData,
  packageId,
  countryId,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState(() => {
    const defaultFormData = {
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
        bookingOption: 'provided',
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
    };

    if (initialData) {
      return {
        ...defaultFormData,
        personalInfo: {
          ...defaultFormData.personalInfo,
          firstName: initialData.firstName || defaultFormData.personalInfo.firstName,
          lastName: initialData.lastName || defaultFormData.personalInfo.lastName,
          email: initialData.email || defaultFormData.personalInfo.email,
        },
        travelInfo: {
          ...defaultFormData.travelInfo,
          purposeOfTravel: initialData.purposeOfTravel || defaultFormData.travelInfo.purposeOfTravel,
          departureDate: initialData.departureDate || defaultFormData.travelInfo.departureDate,
          returnDate: initialData.returnDate || defaultFormData.travelInfo.returnDate,
          bookingOption: initialData.bookingOption || defaultFormData.travelInfo.bookingOption,
        },
        passportInfo: {
          ...defaultFormData.passportInfo,
          ...(initialData.passportInfo || {}),
        },
        documents: {
          ...defaultFormData.documents,
          ...(initialData.documents || {}),
        },
      };
    }

    return defaultFormData;
  });
  
  useEffect(() => {
      if (initialData) {
          setFormData(currentData => ({
             ...currentData,
              personalInfo: {
                ...currentData.personalInfo,
                firstName: initialData.firstName || currentData.personalInfo.firstName,
                lastName: initialData.lastName || currentData.personalInfo.lastName,
                email: initialData.email || currentData.personalInfo.email,
              },
              travelInfo: {
                ...currentData.travelInfo,
                purposeOfTravel: initialData.purposeOfTravel || currentData.travelInfo.purposeOfTravel,
                departureDate: initialData.departureDate || currentData.travelInfo.departureDate,
                returnDate: initialData.returnDate || currentData.travelInfo.returnDate,
                bookingOption: initialData.bookingOption || currentData.travelInfo.bookingOption,
              },
          }));
      }
  }, [initialData]);

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
        formData={formData}
        updateFormData={(data) => updateFormSection('documents', data)} 
      />,
    },
    {
      id: 'review',
      title: 'Application Review',
      description: 'Review your application',
      component: <ApplicationReview formData={formData} />,
    },
  ];

  const updateFormSection = (section: string, data: any) => {
    if (section === 'documents') {
       setFormData(prev => ({
         ...prev,
         documents: {
           ...prev.documents,
           ...data
         }
       }));
    } else {
        setFormData(prev => ({
          ...prev,
          [section]: data,
        }));
    }
  };

  const handleNext = () => {
    let isValid = true;
    
    if (currentStep === 0) {
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
      window.scrollTo(0, 0);
    } else if (isValid && currentStep === steps.length - 1) {
        handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    if (!user?.id) {
        toast({
            title: "Authentication Error",
            description: "You must be logged in to submit an application.",
            variant: "destructive"
        });
        setIsSubmitting(false);
        return;
    }
    
    if (!packageId || !countryId) {
        toast({
            title: "Configuration Error",
            description: "Missing necessary application identifiers (Package or Country ID).",
            variant: "destructive"
        });
        setIsSubmitting(false);
        return;
    }
    
    const applicationData = {
        user_id: user.id,
        package_id: packageId,
        visa_type_id: packageId,
        status: 'Submitted',
        submitted_date: new Date().toISOString(),
        next_step: 'Document Review',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        form_data: formData
    };
    
    console.log('Submitting to visa_applications:', applicationData);

    try {
      const { data, error } = await supabase
        .from('visa_applications')
        .insert([applicationData])
        .select();

      if (error) {
        console.error('Error submitting application to Supabase:', error);
        toast({
          title: "Submission Failed",
          description: `There was an error submitting your application: ${error.message}`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log('Application submitted successfully:', data);
      toast({
        title: "Application Submitted",
        description: `Your ${isServiceOrder ? 'service order' : 'visa application'} has been successfully submitted.`,
      });
      
      setTimeout(() => {
        navigate('/dashboard?tab=applications');
      }, 2000);

    } catch (err) {
      console.error('Unexpected error during submission:', err);
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
       setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    if (isServiceOrder) {
      return (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {serviceName || "Service"} Order
          </h2>
          <p className="text-gray-500">
            Estimated processing time: {processingTime}
          </p>
        </>
      );
    } else {
      return (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {countryName} Visa Application - {visaType}
          </h2>
          <p className="text-gray-500">
            Estimated processing time: {processingTime}
          </p>
        </>
      );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="p-6 shadow-md">
        <div className="mb-8">
          {getTitle()}
        </div>

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

        <div className="mb-8">
          {steps[currentStep].component}
        </div>

        <div className="mt-8 flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentStep === 0 || isSubmitting}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={isSubmitting}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? (
                <>
                  Submitting...
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full ml-2"></div>
                </>
            ) : currentStep === steps.length - 1 ? (
              <>Submit Application <Check className="h-4 w-4 ml-2" /></>
            ) : (
              <>Next Step <ArrowRight className="h-4 w-4 ml-2" /></>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ApplicationForm;
