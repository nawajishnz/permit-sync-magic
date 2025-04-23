import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ApplicationForm from '@/components/visa-application/ApplicationForm';
import { useCountryData, CountryData, VisaPackage } from '@/hooks/useCountryData';
import { Breadcrumbs, BreadcrumbsItem } from "@/components/ui/breadcrumbs";

const VisaApplication = () => {
  const { countryId, packageId } = useParams<{ countryId?: string; packageId?: string }>();
  const navigate = useNavigate();
  
  const { data: countryData, isLoading, isError } = useCountryData(countryId);
  
  const [visaPackage, setVisaPackage] = useState<VisaPackage | null>(null);
  
  useEffect(() => {
    if (countryData && packageId) {
      const selectedPackage = countryData.packageDetails?.id === packageId ? countryData.packageDetails : null;
      setVisaPackage(selectedPackage || null);
    } else if (countryData && !packageId && countryData.packageDetails) {
      setVisaPackage(countryData.packageDetails);
    }
  }, [countryData, packageId]);
  
  const breadcrumbs = [
    { to: '/', label: 'Home' },
    { to: '/countries', label: 'Countries' },
    { to: `/countries/${countryId}`, label: countryData?.name || 'Country Details' },
    { to: '#', label: 'Visa Application', active: true },
  ];
  
  const processingTimeDisplay = `${visaPackage?.processing_days || 'Standard'} days processing`;
  
  const handleFormSubmission = (formData: any) => {
    navigate(`/application-tracker/APP-001`);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (isError || !countryData) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Error loading visa application details.</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Breadcrumbs>
            {breadcrumbs.map((item, index) => (
              <BreadcrumbsItem key={index} to={item.to} active={item.active}>
                {item.label}
              </BreadcrumbsItem>
            ))}
          </Breadcrumbs>
          
          <div className="bg-white rounded-xl shadow p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Visa Application</h1>
                <div className="flex items-center mt-2">
                  {countryData && (
                    <>
                      {countryData.flag && (
                        <img 
                          src={countryData.flag} 
                          alt={`Flag of ${countryData.name}`} 
                          className="w-6 h-4 mr-2 object-cover"
                        />
                      )}
                      <span className="text-gray-700">
                        {countryData.name} - {visaPackage?.name || 'Tourist Visa'}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
                <div className="flex flex-col text-center">
                  <span className="text-sm text-blue-700">Processing Time</span>
                  <span className="font-semibold text-blue-800">
                    {visaPackage?.processing_days || '10-15'} days
                  </span>
                </div>
              </div>
            </div>
            
            <ApplicationForm
              countryId={countryId}
              packageId={packageId}
              countryName={countryData.name}
              visaType={visaPackage?.name || 'Tourist Visa'}
              processingTime={processingTimeDisplay}
              onSubmit={handleFormSubmission}
              isServiceOrder={false}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VisaApplication;
