import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Shield, Clock, Award, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const VisaComparisonSection = () => {
  const comparisonData = [
    {
      aspect: 'Application Process',
      traditional: 'Lengthy paper forms, multiple office visits',
      permitsy: 'Simple online application, no office visits required',
      icon: FileText
    },
    {
      aspect: 'Processing Time',
      traditional: 'Several weeks to months',
      permitsy: 'As fast as 72 hours for many destinations',
      icon: Clock
    },
    {
      aspect: 'Document Verification',
      traditional: 'Manual checking, high error rate',
      permitsy: 'Professional document review by visa experts',
      icon: Shield
    },
    {
      aspect: 'Expert Assistance',
      traditional: 'Limited availability, extra cost',
      permitsy: 'Included with every application',
      icon: Users
    },
    {
      aspect: 'Success Rate',
      traditional: 'Varies widely, no guarantees',
      permitsy: '98% first-attempt approval rate',
      icon: Award
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-blue-50/30">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12 md:mb-16 relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            The Permitsy Advantage
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            See how our innovative approach to visa applications compares to traditional methods
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Mobile View */}
          <div className="block md:hidden space-y-4">
            {comparisonData.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="p-4 bg-indigo-50 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="bg-gray-100 p-2.5 rounded-lg mr-3">
                      <item.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800">{item.aspect}</h3>
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="flex items-start">
                    <div className="bg-red-100 p-2 rounded-full mr-3 flex-shrink-0 mt-1">
                      <X className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Traditional Process</p>
                      <p className="text-gray-600 text-sm">{item.traditional}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0 mt-1">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-700 mb-1">Permitsy</p>
                      <p className="text-indigo-900 text-sm font-medium">{item.permitsy}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
              {/* Table Header */}
              <div className="grid grid-cols-3 border-b border-gray-100">
                <div className="p-6 text-left border-r border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800">Comparison</h3>
                </div>
                <div className="p-6 text-center border-r border-gray-100 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-600">Traditional Process</h3>
                </div>
                <div className="p-6 text-center relative bg-indigo-50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/10"></div>
                  <div className="relative">
                    <h3 className="text-xl font-bold text-indigo-700 mb-2">Permitsy</h3>
                    <div className="inline-block bg-indigo-600 text-white text-sm font-medium px-4 py-1 rounded-full shadow-sm">
                      Recommended
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Table Body */}
              {comparisonData.map((item, index) => (
                <motion.div 
                  key={index}
                  className={`grid grid-cols-3 border-b border-gray-100 ${index === comparisonData.length - 1 ? 'border-b-0' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="p-6 flex items-center border-r border-gray-100">
                    <div className="bg-gray-100 p-2.5 rounded-lg mr-4 flex-shrink-0">
                      <item.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-800">{item.aspect}</span>
                  </div>
                  
                  <div className="p-6 border-r border-gray-100 bg-gray-50 flex items-center">
                    <div className="bg-red-100 p-2 rounded-full mr-3 flex-shrink-0">
                      <X className="h-4 w-4 text-red-500" />
                    </div>
                    <span className="text-gray-600">{item.traditional}</span>
                  </div>
                  
                  <div className="p-6 bg-indigo-50 relative flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0 shadow-sm border border-green-200">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-indigo-900 font-medium">{item.permitsy}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div 
            className="mt-8 md:mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/countries">
              <Button variant="default" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-6 h-auto">
                Browse Countries
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VisaComparisonSection;
