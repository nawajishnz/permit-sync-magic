import React from 'react';
import { motion } from 'framer-motion';
import { FileText, User, Home, CreditCard, Globe, FileImage, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const VisaDocumentChecklist = () => {
  const documents = [
    {
      icon: FileText,
      title: "Valid Passport",
      description: "Must be valid for at least 6 months beyond your intended stay",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: User,
      title: "Application Form",
      description: "Completed and signed visa application form",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      icon: FileImage,
      title: "Photos",
      description: "Recent passport-sized photos meeting specific requirements",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Globe,
      title: "Travel Itinerary",
      description: "Flight reservations and detailed travel plans",
      color: "bg-amber-100 text-amber-600"
    },
    {
      icon: Home,
      title: "Accommodation Proof",
      description: "Hotel reservations or invitation letter from host",
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      icon: CreditCard,
      title: "Financial Documents",
      description: "Bank statements showing sufficient funds for your trip",
      color: "bg-rose-100 text-rose-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            Be Prepared
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Common Visa Documents
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            While requirements vary by country, most visa applications require these essential documents
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {documents.map((doc, index) => (
              <motion.div
                key={index}
                className="flex items-start p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className={`${doc.color} w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                  <doc.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{doc.title}</h3>
                  <p className="text-sm text-gray-600">{doc.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="mt-10 pt-8 border-t border-gray-100 text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-gray-600 mb-6">
              Our platform automatically guides you through the exact requirements for your specific visa type and destination country.
            </p>
            <Link to="/countries">
              <Button variant="default" size="lg" className="text-white font-medium">
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

export default VisaDocumentChecklist;
