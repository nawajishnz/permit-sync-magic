
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
  
  // Fetch country data including visa packages
  const { data: countryData, isLoading, isError } = useCountryData(countryId);
  
  // State to hold the selected visa package
  const [visaPackage, setVisaPackage] = useState<VisaPackage | null>(null);
  
  useEffect(() => {
    if (countryData && packageId) {
      // Find the selected visa package by ID
      const selectedPackage = countryData.packageDetails?.id === packageId ? countryData.packageDetails : null;
      setVisaPackage(selectedPackage || null);
    } else if (countryData && !packageId && countryData.packageDetails) {
      // If no packageId is provided, default to the first package
      setVisaPackage(countryData.packageDetails);
    }
  }, [countryData, packageId]);
  
  // Breadcrumb navigation items
  const breadcrumbs = [
    { to: '/', label: 'Home' },
    { to: '/countries', label: 'Countries' },
    { to: `/countries/${countryId}`, label: countryData?.name || 'Country Details' },
    { to: '#', label: 'Visa Application', active: true },
  ];
  
  // Display processing time based on visa package
  const processingTimeDisplay = `${visaPackage?.processing_days || 'Standard'} days processing`;
  
  // Handle form submission and navigate to the next step
  const handleFormSubmission = (formData: any) => {
    // Navigate to the application tracker page with the application ID
    navigate(`/application-tracker/APP-001`);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  // Render error state
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
          {/* Breadcrumb navigation */}
          <Breadcrumbs>
            {breadcrumbs.map((item, index) => (
              <BreadcrumbsItem key={index} to={item.to} active={item.active}>
                {item.label}
              </BreadcrumbsItem>
            ))}
          </Breadcrumbs>
          
          <div className="bg-white rounded-xl shadow p-6 md:p-8">
            {/* Application header */}
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
            
            {/* Application Form */}
            <ApplicationForm
              countryId={countryId}
              packageId={packageId}
              countryName={countryData.name}
              visaType={visaPackage?.name || 'Tourist Visa'}
              processingTime={processingTimeDisplay}
              handleSubmit={handleFormSubmission}
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
