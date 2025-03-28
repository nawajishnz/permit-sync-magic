
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PopularDestinations from '@/components/PopularDestinations';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import PopularCountries from '@/components/PopularCountries';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <div className="bg-gray-50 py-20">
          <PopularDestinations />
        </div>
        <div className="py-20">
          <Testimonials />
        </div>
        <div className="bg-gray-50 py-20">
          <PopularCountries />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
