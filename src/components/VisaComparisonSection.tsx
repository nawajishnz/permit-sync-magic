
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const VisaComparisonSection = () => {
  const comparisonData = [
    {
      aspect: 'Application Process',
      traditional: 'Lengthy paper forms, multiple office visits',
      permitsy: 'Simple online application, no office visits required'
    },
    {
      aspect: 'Processing Time',
      traditional: 'Several weeks to months',
      permitsy: 'As fast as 72 hours for many destinations'
    },
    {
      aspect: 'Document Verification',
      traditional: 'Manual checking, high error rate',
      permitsy: 'AI-powered verification, 98% accuracy'
    },
    {
      aspect: 'Expert Assistance',
      traditional: 'Limited availability, extra cost',
      permitsy: 'Included with every application'
    },
    {
      aspect: 'Success Rate',
      traditional: 'Varies widely, no guarantees',
      permitsy: '98% first-attempt approval rate'
    }
  ];

  return (
    <section className="py-20 bg-white">
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
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left text-gray-500 font-medium border-b-2 border-gray-100 w-1/3">Comparison</th>
                  <th className="p-4 text-center text-gray-500 font-medium border-b-2 border-gray-100 w-1/3">
                    Traditional Process
                  </th>
                  <th className="p-4 text-center text-indigo-600 font-medium border-b-2 border-gray-100 w-1/3">
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
                    className="border-b border-gray-100"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <td className="p-5 text-gray-800 font-medium">{item.aspect}</td>
                    <td className="p-5 text-center">
                      <div className="flex items-center justify-center">
                        <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{item.traditional}</span>
                      </div>
                    </td>
                    <td className="p-5 text-center bg-indigo-50/50">
                      <div className="flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
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
            <Link to="/visa-finder">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-8 shadow-md">
                Experience the Difference
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VisaComparisonSection;
