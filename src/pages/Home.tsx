
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import CountryGrid from '@/components/CountryGrid';
import FAQ from '@/components/FAQ';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />
        
        {/* How It Works Section */}
        <HowItWorks />
        
        {/* Popular Destinations */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our most popular visa destinations and start your journey today
              </p>
            </div>
            
            <CountryGrid limit={6} />
            
            <div className="mt-12 text-center">
              <Link to="/countries">
                <Button variant="outline" size="lg" className="group">
                  View All Destinations
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <Testimonials />
        
        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find answers to common questions about our visa services
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <FAQ />
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Still have questions?</p>
              <Link to="/contact">
                <Button>Contact Us</Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
              Let us handle your visa application process so you can focus on planning your trip.
            </p>
            <Link to="/countries">
              <Button size="lg" variant="secondary" className="bg-white text-blue-700 hover:bg-gray-100">
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
