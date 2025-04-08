import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe, Clock, Award, Zap, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const WhyChooseUs = () => {
  const features = [
    {
      icon: Shield,
      title: "Guaranteed Approval",
      description: "With our 98% approval rate, you can apply with confidence. If your visa isn't approved, we'll refund your service fee.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Zap,
      title: "Digital Processing",
      description: "Our streamlined digital system reduces processing time by up to 10x compared to traditional methods.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: FileCheck, 
      title: "Document Verification",
      description: "Our system automatically checks your documents against the latest requirements, ensuring they meet all visa standards.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Globe,
      title: "Worldwide Coverage",
      description: "We support visa applications for over 190 countries, helping travelers from anywhere to everywhere.",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description: "Track your application status 24/7 and receive notifications at every step of the process.",
      color: "bg-amber-100 text-amber-600"
    },
    {
      icon: Award,
      title: "Expert Support",
      description: "Our visa specialists are available to answer questions and guide you through any complex visa requirements.",
      color: "bg-teal-100 text-teal-600"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">Why Permitsy</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            The Smarter Way to Get Your Visa
          </h2>
          <p className="text-lg text-gray-600">
            We combine advanced technology with visa expertise to make the application process simple, fast, and stress-free
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-md p-8 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-6`}>
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link to="/countries">
            <Button variant="default" size="lg" className="text-white font-medium">
              Browse Countries
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
