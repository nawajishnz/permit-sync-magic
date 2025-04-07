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
    <section className="py-20 bg-gradient-to-b from-white to-blue-50/30">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            The Permitsy Advantage
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            See how our innovative approach to visa applications compares to traditional methods
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse shadow-lg rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-5 text-left text-gray-500 font-medium border-b-2 border-gray-100 w-1/3 rounded-tl-xl">Comparison</th>
                  <th className="p-5 text-center text-gray-500 font-medium border-b-2 border-gray-100 w-1/3">
                    Traditional Process
                  </th>
                  <th className="p-5 text-center text-indigo-600 font-medium border-b-2 border-gray-100 w-1/3 bg-indigo-50/50 rounded-tr-xl">
                    <span className="flex items-center justify-center">
                      <span className="mr-2">Permitsy</span>
                      <motion.div 
                        className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-full"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Recommended
                      </motion.div>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item, index) => (
                  <motion.tr 
                    key={index}
                    className={`border-b border-gray-100 ${index === comparisonData.length - 1 ? 'border-b-0' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <td className="p-6 text-gray-800 font-medium flex items-center">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        <item.icon className="h-5 w-5 text-gray-600" />
                      </div>
                      {item.aspect}
                    </td>
                    <td className="p-6 text-center bg-white">
                      <div className="flex items-center justify-center">
                        <div className="bg-red-100 p-1 rounded-full mr-2">
                          <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                        </div>
                        <span className="text-gray-600 text-sm">{item.traditional}</span>
                      </div>
                    </td>
                    <td className={`p-6 text-center bg-indigo-50/50 ${index === comparisonData.length - 1 ? 'rounded-br-xl' : ''}`}>
                      <div className="flex items-center justify-center">
                        <div className="bg-green-100 p-1 rounded-full mr-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        </div>
                        <span className="text-gray-800 text-sm font-medium">{item.permitsy}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/countries" className="text-indigo-600 hover:text-indigo-700">
              Browse Countries
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VisaComparisonSection;
