
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ApplicationForm from '@/components/visa-application/ApplicationForm';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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

const VisaApplication = () => {
  const { countryId, packageId } = useParams<{ countryId: string; packageId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Validate parameters
    if (!countryId || !packageId || !countryData[countryId as keyof typeof countryData]) {
      navigate('/not-found');
      return;
    }
    
    const packageIdNum = parseInt(packageId, 10);
    const country = countryData[countryId as keyof typeof countryData];
    
    if (isNaN(packageIdNum) || packageIdNum < 0 || packageIdNum >= country.visaPackages.length) {
      navigate('/not-found');
      return;
    }
    
    setLoading(false);
  }, [countryId, packageId, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Safe to use countryId and packageId now
  const country = countryData[countryId as keyof typeof countryData];
  const visaPackage = country.visaPackages[parseInt(packageId!, 10)];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow py-8">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <Link to={`/country/${countryId}`}>
              <Button variant="ghost" size="sm" className="flex items-center text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to {country.name} Visa
              </Button>
            </Link>
          </div>
          
          <ApplicationForm 
            countryName={country.name}
            visaType={visaPackage.name}
            processingTime={visaPackage.processingTime}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VisaApplication;
