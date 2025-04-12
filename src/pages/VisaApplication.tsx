import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ApplicationForm from '@/components/visa-application/ApplicationForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Using the same country data from CountryDetails for consistency
const countryData = {
  usa: {
    name: 'United States',
    visaPackages: [
      { 
        name: 'Standard Processing', 
        processingTime: '7-10 days', 
      },
      { 
        name: 'Express Processing', 
        processingTime: '3-5 days', 
      },
      { 
        name: 'Premium Service', 
        processingTime: '24-48 hours', 
      }
    ]
  },
  canada: {
    name: 'Canada',
    visaPackages: [
      { 
        name: 'Standard Processing', 
        processingTime: '2-3 weeks', 
      },
      { 
        name: 'Express Processing', 
        processingTime: '7-10 days', 
      },
      { 
        name: 'Premium Service', 
        processingTime: '3-5 days', 
      }
    ]
  },
  uk: {
    name: 'United Kingdom',
    visaPackages: [
      { 
        name: 'Standard Processing', 
        processingTime: '3-4 weeks', 
      },
      { 
        name: 'Express Processing', 
        processingTime: '1-2 weeks', 
      },
      { 
        name: 'Premium Service', 
        processingTime: '3-5 days', 
      }
    ]
  },
  schengen: {
    name: 'Schengen Area',
    visaPackages: [
      { 
        name: 'Standard Processing', 
        processingTime: '10-15 days', 
      },
      { 
        name: 'Express Processing', 
        processingTime: '5-7 days', 
      },
      { 
        name: 'Premium Service', 
        processingTime: '2-4 days', 
      }
    ]
  },
  australia: {
    name: 'Australia',
    visaPackages: [
      { 
        name: 'Standard Processing', 
        processingTime: '20-50 days', 
      },
      { 
        name: 'Express Processing', 
        processingTime: '14-20 days', 
      },
      { 
        name: 'Premium Service', 
        processingTime: '7-12 days', 
      }
    ]
  },
  uae: {
    name: 'UAE',
    visaPackages: [
      { 
        name: 'Standard Processing', 
        processingTime: '3-5 days', 
      },
      { 
        name: 'Express Processing', 
        processingTime: '24-48 hours', 
      },
      { 
        name: 'Premium Service', 
        processingTime: 'Same day', 
      }
    ]
  },
  japan: {
    name: 'Japan',
    visaPackages: [
      { 
        name: 'Standard Processing', 
        processingTime: '5-7 days', 
      },
      { 
        name: 'Express Processing', 
        processingTime: '3-4 days', 
      },
      { 
        name: 'Premium Service', 
        processingTime: '1-2 days', 
      }
    ]
  },
  singapore: {
    name: 'Singapore',
    visaPackages: [
      { 
        name: 'Standard Processing', 
        processingTime: '3-5 days', 
      },
      { 
        name: 'Express Processing', 
        processingTime: '1-2 days', 
      },
      { 
        name: 'Premium Service', 
        processingTime: 'Same day', 
      }
    ]
  }
};

interface LocationState {
  serviceOrder?: boolean;
  serviceName?: string;
  servicePrice?: string;
}

const VisaApplication = () => {
  const { countryId, packageId } = useParams<{ countryId: string; packageId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Check for service order from location state
  const locationState = location.state as LocationState;
  const isServiceOrder = locationState?.serviceOrder === true;
  const serviceName = locationState?.serviceName;
  
  useEffect(() => {
    // Always provide a fallback for any invalid params
    if (!countryId || !packageId) {
      setLoading(false);
      return;
    }
    
    if (isServiceOrder) {
      // For service orders, we don't need to validate against countryData
      setLoading(false);
      return;
    }
    
    // Validate parameters for visa applications
    if (!countryData[countryId as keyof typeof countryData]) {
      toast({
        title: "Invalid Country",
        description: "Could not find the requested country information.",
        variant: "destructive"
      });
      
      // Don't navigate away, just show a fallback
      setLoading(false);
      return;
    }
    
    const packageIdNum = parseInt(packageId, 10);
    const country = countryData[countryId as keyof typeof countryData];
    
    if (isNaN(packageIdNum) || packageIdNum < 0 || packageIdNum >= country.visaPackages.length) {
      toast({
        title: "Invalid Package",
        description: "The selected visa package does not exist.",
        variant: "destructive"
      });
      
      // Don't navigate away, just show a fallback
      setLoading(false);
      return;
    }
    
    setLoading(false);
  }, [countryId, packageId, navigate, toast, isServiceOrder]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Get appropriate title and data based on whether this is a service order or visa application
  let title = "Application Form";
  let backLink = "/countries";
  let visaPackage = { name: "Standard", processingTime: "7-10 days" };
  let countryName = "United States";
  
  if (isServiceOrder) {
    // If it's a service order
    title = serviceName || "Service Order";
    backLink = "/addon-services";
    visaPackage = { 
      name: serviceName || "Service Order", 
      processingTime: "3-5 days" 
    };
    countryName = "Service Order";
  } else if (countryId && packageId && countryData[countryId as keyof typeof countryData]) {
    // If it's a visa application with valid params
    const country = countryData[countryId as keyof typeof countryData];
    const packageIdNum = parseInt(packageId, 10);
    
    if (!isNaN(packageIdNum) && packageIdNum >= 0 && packageIdNum < country.visaPackages.length) {
      countryName = country.name;
      visaPackage = country.visaPackages[packageIdNum];
      backLink = `/country/${countryId}`;
    }
  }
  
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
          
          <ApplicationForm 
            countryName={countryName}
            visaType={visaPackage.name}
            processingTime={visaPackage.processingTime}
            isServiceOrder={isServiceOrder}
            serviceName={serviceName}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VisaApplication;
