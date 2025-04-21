import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCountryData } from '@/hooks/useCountryData';

interface LocationState {
  serviceOrder?: boolean;
  serviceName?: string;
  servicePrice?: string;
}

// List of required documents (can be refined later, maybe fetched with country data)
const requiredDocuments = [
  { name: "Passport Copy", description: "Clear scan of bio-data pages." },
  { name: "Passport Size Photo", description: "Recent, white background." },
  { name: "Financial Proof", description: "e.g., Bank Statements." },
  { name: "Travel Insurance", description: "Covering the duration of stay." },
  { name: "Travel Itinerary", description: "Flight bookings (Required if not using booking assistance)." },
  { name: "Accommodation Proof", description: "Hotel booking or invitation (Required if not using booking assistance)." },
];

const VisaApplication = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { data: country, isLoading: countryLoading, isError: countryError } = useCountryData(countryId);
  
  // State for the initial minimal form
  const [initialData, setInitialData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    purposeOfTravel: '',
    departureDate: '',
    returnDate: ''
  });

  const locationState = location.state as LocationState;
  const isServiceOrder = locationState?.serviceOrder === true;
  const serviceName = locationState?.serviceName;

  useEffect(() => {
    if (isServiceOrder) {
      return;
    }

    if (countryLoading) {
      return; // Wait for country data
    }

    if (countryError || !country) {
      toast({
        title: "Invalid Country",
        description: countryError ? "Failed to load country information." : "Could not find the requested country information.",
        variant: "destructive"
      });
      return;
    }

    if (!country.packageDetails) {
        toast({
          title: "Application Unavailable",
          description: "Visa package details are not configured for this country.",
          variant: "destructive"
        });
        return;
    }

  }, [countryId, navigate, toast, isServiceOrder, country, countryLoading, countryError]);

  if (countryLoading && !isServiceOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if ((countryError || !country) && !isServiceOrder) {
     return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow pt-20 md:pt-24 py-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Application</h2>
            <p className="text-gray-600 mb-4">Could not load the necessary information for the selected country.</p>
            <Link to="/countries">
              <Button variant="outline">Back to Countries</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isServiceOrder && country && !country.packageDetails) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow pt-20 md:pt-24 py-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Application Unavailable</h2>
            <p className="text-gray-600 mb-4">Visa package details are not configured for this country.</p>
            <Link to={countryId ? `/country/${countryId}` : '/countries'}>
              <Button variant="outline">Back to Country Details</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  let title = "Application Form";
  let backLink = "/countries";
  let visaPackageInfo: { name: string; processing_time: string } = { name: "Service", processing_time: "N/A" };
  let countryName = "Service";

  if (isServiceOrder) {
    title = serviceName || "Service Order";
    backLink = "/addon-services";
    visaPackageInfo = {
      name: serviceName || "Service Order",
      processing_time: "Processing time varies"
    };
    countryName = "Service Order";
  } else if (country && country.packageDetails) {
    countryName = country.name;
    visaPackageInfo = {
        name: country.packageDetails.name,
        processing_time: country.packageDetails.processing_time
    };
    backLink = `/country/${countryId}`;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInitialData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
     setInitialData(prev => ({ ...prev, [name]: value }));
  };

  const handleInitiateApplication = (event: React.FormEvent) => {
    event.preventDefault();
    // Basic validation
    if (!initialData.firstName || !initialData.lastName || !initialData.email || !initialData.purposeOfTravel || !initialData.departureDate || !initialData.returnDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all the required fields to start your application.",
        variant: "default"
      });
      return;
    }
    
    // Extract IDs from packageDetails 
    const currentPackageId = country?.packageDetails?.id;
    const currentCountryId = country?.packageDetails?.country_id; 
    
    // Validate IDs 
    if (!currentCountryId || !currentPackageId) {
         toast({
            title: "Configuration Error",
            description: "Could not determine required IDs from the visa package details. Please contact support.", 
            variant: "destructive"
         });
         return;
    }
    
    const simulatedAppId = `SIM${Math.floor(Math.random() * 90000) + 10000}`;
    console.log(`Initiating application ${simulatedAppId} with IDs:`, { currentCountryId, currentPackageId }); 
    
    toast({
      title: "Application Initiated",
      description: "Your initial details have been saved. Proceed to your dashboard to complete payment and details.",
    });
    
    navigate('/dashboard', { 
      state: { 
         orderPlaced: true, 
         applicationId: simulatedAppId, 
         countryName, 
         visaType: visaPackageInfo.name, 
         countryId: currentCountryId, 
         packageId: currentPackageId, 
         ...initialData
      } 
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow pt-20 md:pt-24 py-8">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <Link to={backLink}>
              <Button variant="ghost" size="sm" className="flex items-center text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to {isServiceOrder ? "Services" : `${countryName} Visa`}
              </Button>
            </Link>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-lg shadow-md space-y-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
              Apply for {isServiceOrder ? serviceName : `${countryName} ${visaPackageInfo.name}`}
            </h1>
            
            <div className="border-t pt-4">
               <p className="text-gray-600">
                  <span className="font-medium">Estimated Processing Time:</span> {visaPackageInfo.processing_time}
               </p>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Required Documents</h2>
              <p className="text-sm text-gray-600 mb-4">Please prepare the following documents. You will be asked to upload them during the application process.</p>
              <ul className="space-y-2">
                {requiredDocuments.map((doc, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-700">{doc.name}</span>
                      <p className="text-sm text-gray-500">{doc.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
               <p className="text-xs text-gray-500 mt-3">* Travel Itinerary and Accommodation Proof may be optional if you select our booking assistance add-on service later.</p>
            </div>
            
            <form onSubmit={handleInitiateApplication} className="border-t pt-6 space-y-6">
               <h2 className="text-xl font-semibold text-gray-700 mb-3">Start Your Application</h2>
               <p className="text-gray-600 mb-4">Provide some basic details to initiate your application. You can complete the rest later.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="space-y-2">
                     <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                     <Input 
                        id="firstName"
                        name="firstName"
                        placeholder="Enter your first name"
                        value={initialData.firstName}
                        onChange={handleInputChange}
                        required
                     />
                  </div>
                  
                   {/* Last Name */}
                  <div className="space-y-2">
                     <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                     <Input 
                        id="lastName"
                        name="lastName"
                        placeholder="Enter your last name"
                        value={initialData.lastName}
                        onChange={handleInputChange}
                        required
                     />
                  </div>
                  
                  {/* Email */}
                  <div className="space-y-2">
                     <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                     <Input 
                        id="email"
                        name="email"
                        type="email" 
                        placeholder="your.email@example.com"
                        value={initialData.email}
                        onChange={handleInputChange}
                        required
                     />
                  </div>
                  
                  {/* Purpose of Travel */}
                  <div className="space-y-2">
                     <Label htmlFor="purposeOfTravel">Purpose of Travel <span className="text-red-500">*</span></Label>
                     <Select 
                        name="purposeOfTravel" 
                        onValueChange={(value) => handleSelectChange('purposeOfTravel', value)} 
                        value={initialData.purposeOfTravel}
                        required
                     >
                        <SelectTrigger id="purposeOfTravel">
                           <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="tourism">Tourism</SelectItem>
                           <SelectItem value="business">Business</SelectItem>
                           <SelectItem value="education">Education</SelectItem>
                           <SelectItem value="employment">Employment</SelectItem>
                           <SelectItem value="medical">Medical Treatment</SelectItem>
                           <SelectItem value="visiting-family">Visiting Family/Friends</SelectItem>
                           <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
                  
                   {/* Departure Date */}
                  <div className="space-y-2">
                     <Label htmlFor="departureDate">Departure Date <span className="text-red-500">*</span></Label>
                     <Input 
                        id="departureDate"
                        name="departureDate"
                        type="date"
                        value={initialData.departureDate}
                        onChange={handleInputChange}
                        required
                     />
                  </div>
                  
                   {/* Return Date */}
                  <div className="space-y-2">
                     <Label htmlFor="returnDate">Return Date <span className="text-red-500">*</span></Label>
                     <Input 
                        id="returnDate"
                        name="returnDate"
                        type="date"
                        value={initialData.returnDate}
                        onChange={handleInputChange}
                        required
                     />
                  </div>
               </div>
               
               <div className="text-center pt-4">
                  <Button 
                     type="submit" 
                     size="lg" 
                     className="bg-indigo-600 hover:bg-indigo-700"
                  >
                     Initiate Application & Continue
                  </Button>
                  <p className="text-xs text-gray-500 mt-3">We'll save these details. You can complete payment and full details in your dashboard.</p>
               </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VisaApplication;
