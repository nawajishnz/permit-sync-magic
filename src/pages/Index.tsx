
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PopularDestinations from '@/components/PopularDestinations';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import PopularCountries from '@/components/PopularCountries';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50/30">
      <Header />
      <main className="flex-grow">
        <Hero />
        <div className="py-20 bg-white">
          <PopularDestinations />
        </div>
        <HowItWorks />
        <div className="py-20 bg-gradient-to-b from-blue-50/60 to-white">
          <Testimonials />
        </div>
        <div className="py-20 bg-white">
          <PopularCountries />
        </div>
        
        {/* Admin login section */}
        <div className="py-12 bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Portal</h2>
              <p className="text-gray-600 mb-6">
                If you're an administrator, access the admin dashboard to manage countries, visa applications, and more.
              </p>
              <Link to="/auth?admin=true">
                <Button className="bg-navy hover:bg-navy/90">
                  Access Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
