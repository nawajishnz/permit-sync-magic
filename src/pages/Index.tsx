
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
import { motion } from 'framer-motion';
import { Shield, Users, Clock } from 'lucide-react';

const Index = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50/30">
      <Header />
      <main className="flex-grow">
        <Hero />
        
        {/* Stats section */}
        <motion.div 
          className="py-12 bg-gray-50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Shield, count: '98%', label: 'Success Rate', color: 'bg-indigo-100 text-indigo-600' },
                { icon: Users, count: '50k+', label: 'Happy Travelers', color: 'bg-blue-100 text-blue-600' },
                { icon: Clock, count: '10x', label: 'Faster Processing', color: 'bg-teal-100 text-teal-600' }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 12px 20px -10px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.count}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

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
        <motion.div 
          className="py-12 bg-gray-50 border-t border-gray-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Portal</h2>
              <p className="text-gray-600 mb-6">
                If you're an administrator, access the admin dashboard to manage countries, visa applications, and more.
              </p>
              <Link to="/auth?admin=true">
                <Button className="bg-navy hover:bg-navy/90 shadow-md transition-all duration-300 hover:shadow-lg">
                  Access Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
