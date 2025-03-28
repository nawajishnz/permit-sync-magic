
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50/30">
      <Header />
      <main className="flex-grow">
        <Hero />
        <div className="py-20 bg-white">
          <PopularDestinations />
        </div>
        <div className="relative py-20 overflow-hidden bg-[url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000')] bg-cover bg-center">
          <div className="absolute inset-0 bg-indigo-600/70 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <HowItWorks />
          </div>
        </div>
        <div className="py-20 bg-gradient-to-b from-blue-50/60 to-white">
          <Testimonials />
        </div>
        <div className="py-20 bg-white">
          <PopularCountries />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
