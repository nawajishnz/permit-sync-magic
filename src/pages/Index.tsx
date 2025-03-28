
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PopularDestinations from '@/components/PopularDestinations';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <PopularDestinations />
        {/* Add additional home page sections here */}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
