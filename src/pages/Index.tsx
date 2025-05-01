
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PopularDestinations from '@/components/PopularDestinations';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import WhyChooseUs from '@/components/WhyChooseUs';
import ApplicationSteps from '@/components/ApplicationSteps';
import { useIsMobile } from '@/hooks/use-mobile';
import VisaComparisonSection from '@/components/VisaComparisonSection';
import TravelTipsSection from '@/components/TravelTipsSection';
import VisaDocumentChecklist from '@/components/VisaDocumentChecklist';
import AddonServicesSection from '@/components/countries/AddonServicesSection';
import { getAddonServices, AddonService } from '@/models/addon_services';
import ApprovedVisas from '@/components/ApprovedVisas';
import { RecentBlogs } from '@/components/RecentBlogs';
import StatsSection from '@/components/home/StatsSection';
import AdminPortalSection from '@/components/home/AdminPortalSection';

const Index = () => {
  const isMobile = useIsMobile();
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };
  
  const [addonServices, setAddonServices] = useState<AddonService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const services = await getAddonServices();
        setAddonServices(services.slice(0, 4)); // Get first 4 services for the homepage
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching addon services:", error);
        // Fallback to sample data if there's an error or no services found
        if (addonServices.length === 0) {
          setAddonServices(sampleAddonServices);
        }
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  const sampleAddonServices: AddonService[] = [
    {
      id: '1',
      name: 'Rental Agreement',
      description: 'Legal documentation for property rental with verified attestation',
      price: '1200',
      delivery_days: 3,
      discount_percentage: 20,
      image_url: 'https://images.pexels.com/photos/955395/pexels-photo-955395.jpeg'
    },
    {
      id: '2',
      name: 'Hotel Booking',
      description: 'Premium hotel reservation service with guaranteed confirmation',
      price: '800',
      delivery_days: 2,
      discount_percentage: 15,
      image_url: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'
    },
    {
      id: '3',
      name: 'Flight Tickets',
      description: 'Discounted international flight booking with flexible changes',
      price: '800',
      delivery_days: 1,
      discount_percentage: 10,
      image_url: 'https://images.pexels.com/photos/62623/wing-plane-flying-airplane-62623.jpeg'
    },
    {
      id: '4',
      name: 'Police Clearance Certificate',
      description: 'Official criminal record verification from authorities',
      price: '2500',
      delivery_days: 7,
      discount_percentage: 5,
      image_url: 'https://images.pexels.com/photos/4021256/pexels-photo-4021256.jpeg'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50/30 overflow-x-hidden">
      <Header />
      <main className="flex-grow pt-20 md:pt-24">
        <Hero />
        
        <div className="pt-2 pb-4 md:pt-4 md:pb-10 bg-gradient-to-br from-indigo-50/40 via-blue-50/30 to-white/90 px-4">
          <PopularDestinations />
        </div>
        
        <StatsSection />

        <ApplicationSteps />
        
        <VisaDocumentChecklist />
        
        <HowItWorks />
        
        <VisaComparisonSection />
        
        <WhyChooseUs />
        
        <TravelTipsSection />
        
        <RecentBlogs />
        
        <AddonServicesSection />
        
        <div className="bg-white py-4">
          <ApprovedVisas />
        </div>
        
        <div className="py-12 md:py-20 bg-gradient-to-b from-blue-50/60 to-white px-4">
          <Testimonials />
        </div>
        
        <AdminPortalSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
