
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, Clock, Check, ArrowRight, Calendar, Clipboard, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ApplicationSteps = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  
  const steps = [
    {
      id: 1,
      title: "Fill Out Your Details",
      description: "Complete your application with our simple, guided form",
      icon: FileText,
      color: "from-teal-400 to-teal-500"
    },
    {
      id: 2,
      title: "Document Verification",
      description: "Our experts verify your documents for accuracy and completeness",
      icon: Shield,
      color: "from-teal-400 to-teal-500"
    },
    {
      id: 3,
      title: "Expert Human Review",
      description: "Visa specialists ensure everything is perfect",
      icon: Clock,
      color: "from-teal-400 to-teal-500"
    },
    {
      id: 4,
      title: "Visa Delivery",
      description: "Receive your approved visa electronically or by mail",
      icon: Check,
      color: "from-teal-400 to-teal-500"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-2xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-teal-600 font-medium mb-3 bg-teal-50 px-4 py-1 rounded-full text-sm tracking-wide">Our Process</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Four Simple Steps to Your Visa</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Our streamlined process takes the stress out of visa applications
          </p>
        </motion.div>

        {/* Main steps - desktop version */}
        <div className="hidden md:block relative">
          {/* Progress line - with better animation */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
          <motion.div 
            className="absolute left-0 top-1/2 h-0.5 bg-teal-500 transform -translate-y-1/2"
            initial={{ width: "0%" }}
            animate={{ width: activeStep ? `${(activeStep / steps.length) * 100}%` : '25%' }}
            transition={{ duration: 0.5 }}
          ></motion.div>
          
          <div className="grid grid-cols-4 gap-4 max-w-5xl mx-auto relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
                onMouseEnter={() => setActiveStep(step.id)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <div className={`bg-white rounded-lg shadow-sm border border-gray-100 p-6 
                  transition-all duration-300 h-full flex flex-col
                  ${activeStep === step.id ? 'shadow-md scale-105' : 'hover:shadow-md hover:scale-102'}`}>
                  
                  {/* Improved step number indicator */}
                  <div className={`absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-lg 
                    flex items-center justify-center z-10 shadow-md
                    ${activeStep === step.id ? "bg-teal-500 text-white" : "bg-white text-teal-500 border border-teal-200"}`}>
                    <span className="font-bold">{step.id}</span>
                  </div>
                  
                  {/* Professional border animation for active step */}
                  {activeStep === step.id && (
                    <motion.div 
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute inset-0 border-2 border-teal-400 rounded-lg"></div>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-teal-500 rounded-t-lg"></div>
                    </motion.div>
                  )}
                  
                  {/* Icon with travel theme animation */}
                  <div className={`w-16 h-16 mb-5 rounded-full bg-gradient-to-r ${step.color} flex items-center 
                    justify-center text-white shadow-md mx-auto mt-4`}>
                    <motion.div
                      animate={activeStep === step.id ? 
                        { scale: [1, 1.1, 1], rotate: [0, 5, 0] } : 
                        { scale: 1, rotate: 0 }
                      }
                      transition={{ duration: 0.5, repeat: activeStep === step.id ? Infinity : 0, repeatType: "reverse" }}
                    >
                      <step.icon className="h-7 w-7" />
                    </motion.div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">{step.title}</h3>
                  <p className="text-gray-600 mb-4 text-center text-sm">{step.description}</p>
                  
                  {/* Arrow indicator for next step - don't show on last step */}
                  {index < steps.length - 1 && (
                    <motion.div 
                      className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-teal-500 z-10"
                      animate={activeStep === step.id ? 
                        { x: [0, 5, 0] } : 
                        { x: 0 }
                      }
                      transition={{ duration: 0.8, repeat: activeStep === step.id ? Infinity : 0 }}
                    >
                      <ArrowRight className="h-6 w-6" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Mobile version - vertical steps with improved alignment */}
        <div className="md:hidden">
          <div className="relative max-w-sm mx-auto px-4">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 ml-px"></div>
            <motion.div 
              className="absolute left-8 top-0 w-0.5 bg-teal-500 ml-px"
              initial={{ height: "25%" }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            ></motion.div>
            
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                className="relative mb-10 last:mb-0"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="flex">
                  {/* Step circle - improved design */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-r ${step.color} 
                    flex items-center justify-center text-white shadow-md z-10`}>
                    <motion.div
                      whileInView={{ 
                        scale: [1, 1.1, 1],
                        transition: { duration: 1, repeat: 1 }
                      }}
                      viewport={{ once: true }}
                    >
                      <step.icon className="h-7 w-7" />
                    </motion.div>
                  </div>
                  
                  {/* Content with improved design */}
                  <div className="ml-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex-grow">
                    <div className="absolute -left-1 top-6 w-5 h-0.5 bg-teal-500"></div>
                    <span className="inline-block px-2 py-1 bg-teal-50 text-teal-600 text-xs rounded-full mb-2">Step {step.id}</span>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Statistics Cards - updated for consistency */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              { 
                icon: Calendar, 
                value: "24-48 hrs", 
                label: "Average Processing Time",
                color: "bg-teal-50 text-teal-600"
              },
              { 
                icon: Clipboard, 
                value: "98%", 
                label: "Application Success Rate",
                color: "bg-teal-50 text-teal-600"
              },
              { 
                icon: Award, 
                value: "50,000+", 
                label: "Satisfied Customers",
                color: "bg-teal-50 text-teal-600"
              }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mr-4 flex-shrink-0`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* CTA button - updated for consistency */}
        <motion.div 
          className="flex justify-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link to="/visa-finder">
            <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-8 shadow-md group">
              Start Your Application 
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ApplicationSteps;
